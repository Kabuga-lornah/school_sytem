import logging

from django.contrib.auth import get_user_model
from django.db import transaction
from django.db.models import Prefetch, Q
from django.utils.crypto import get_random_string
from django.utils.text import slugify
from rest_framework import status
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework_simplejwt.views import TokenObtainPairView

from apps.academic.models import Result, SchoolClass, Student
from apps.finance.models import Transaction

from .models import School
from .serializers import (
    ActivateAccountSerializer,
    ChildDashboardSerializer,
    ParentInviteSerializer,
    ParentSummarySerializer,
    RoleAwareTokenObtainPairSerializer,
    SchoolAdminRegisterSerializer,
    SchoolSerializer,
    StudentSummarySerializer,
    TeacherInviteSerializer,
)

User = get_user_model()
logger = logging.getLogger(__name__)


class RoleAwareTokenObtainPairView(TokenObtainPairView):
    serializer_class = RoleAwareTokenObtainPairSerializer


def build_teacher_activation_key(first_name, school_name):
    first = slugify(first_name).replace("-", "")
    school = slugify(school_name).replace("-", "")
    return f"{first}{school}"


def generate_temporary_password():
    return get_random_string(10)


def generate_placeholder_teacher_username(email):
    local_part = email.split("@", 1)[0]
    base = f"pending-{slugify(local_part).replace('-', '') or 'teacher'}"
    candidate = base
    suffix = 1
    while User.objects.filter(username=candidate).exists():
        suffix += 1
        candidate = f"{base}-{suffix}"
    return candidate


def generate_parent_username(first_name):
    base = slugify(first_name).replace("-", "") or "parent"
    candidate = base
    suffix = 1
    while User.objects.filter(username=candidate).exists():
        suffix += 1
        candidate = f"{base}{suffix}"
    return candidate


def activation_error(detail, data, status_code=status.HTTP_400_BAD_REQUEST):
    logger.warning(
        "Account activation failed: %s | school_code=%s | identifier=%s | requested_username=%s",
        detail,
        data.get("school_code"),
        data.get("identifier"),
        data.get("username"),
    )
    return Response({"detail": detail}, status=status_code)


class RegisterSchoolAPIView(APIView):
    permission_classes = [AllowAny]

    @transaction.atomic
    def post(self, request):
        serializer = SchoolAdminRegisterSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        data = serializer.validated_data

        school = School.objects.create(
            name=data["school_name"],
            email=data["school_email"],
            phone=data["school_phone"],
            location=data["location"],
        )
        admin_user = User.objects.create_user(
            username=data["admin_username"],
            email=data["admin_email"],
            password=data["password"],
            role="admin",
            school=school,
        )

        return Response(
            {
                "school": SchoolSerializer(school).data,
                "admin": ParentSummarySerializer(admin_user).data,
                "school_code": school.school_code,
            },
            status=status.HTTP_201_CREATED,
        )


class ActivateAccountAPIView(APIView):
    permission_classes = [AllowAny]

    @transaction.atomic
    def post(self, request):
        serializer = ActivateAccountSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        data = serializer.validated_data
        identifier = data["identifier"].strip()

        try:
            school = School.objects.get(school_code=data["school_code"])
        except School.DoesNotExist:
            return activation_error("Invalid school code.", data)

        user = (
            User.objects.filter(school=school)
            .filter(Q(username__iexact=identifier) | Q(email__iexact=identifier) | Q(phone=identifier))
            .first()
        )

        if not user:
            return activation_error("Account not found for this school.", data)

        if user.role not in {"teacher", "parent"}:
            return activation_error("Only invited parent or teacher accounts can be activated.", data)

        if user.role == "teacher" and not user.is_approved:
            return activation_error("This teacher account is waiting for admin approval.", data)

        if not user.must_change_password:
            return activation_error("This account has already been activated.", data)

        if not user.check_password(data["temporary_password"]):
            return activation_error("Temporary password is incorrect.", data)

        if user.role == "teacher":
            username = data.get("username", "").strip()
            if not username:
                return activation_error("Teachers must choose a username during activation.", data)
            if User.objects.exclude(pk=user.pk).filter(username=username).exists():
                return activation_error("That username is already taken.", data)
            user.username = username

        user.set_password(data["new_password"])
        user.must_change_password = False
        update_fields = ["password", "must_change_password"]
        if user.role == "teacher":
            update_fields.append("username")
        user.save(update_fields=update_fields)

        return Response(
            {
                "detail": "Account activated successfully.",
                "user": ParentSummarySerializer(user).data,
            }
        )


class ParentDashboardAPIView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        if request.user.role != "parent":
            return Response({"detail": "Only parents can access this dashboard."}, status=403)

        children = (
            Student.objects.filter(parent=request.user, school=request.user.school)
            .select_related("school_class", "fees_account", "wallet")
            .prefetch_related(
                Prefetch(
                    "results",
                    queryset=Result.objects.select_related("assessment__subject").order_by("-created_at"),
                ),
                Prefetch(
                    "wallet__transactions",
                    queryset=Transaction.objects.order_by("-created_at"),
                ),
            )
            .order_by("first_name", "last_name")
        )

        data = {
            "parent": ParentSummarySerializer(request.user).data,
            "children": ChildDashboardSerializer(children, many=True).data,
        }
        return Response(data)


class AdminTeacherInviteAPIView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        if request.user.role == "admin":
            teachers = User.objects.filter(school=request.user.school, role="teacher").order_by("username")
            return Response({"teachers": ParentSummarySerializer(teachers, many=True).data})

        if request.user.role == "teacher":
            teachers = User.objects.filter(school=request.user.school, role="teacher", invited_by=request.user).order_by("username")
            return Response({"teachers": ParentSummarySerializer(teachers, many=True).data})

        return Response({"detail": "Only school staff can view teacher records."}, status=403)

    @transaction.atomic
    def post(self, request):
        if request.user.role not in {"admin", "teacher"}:
            return Response({"detail": "Only school staff can invite teachers."}, status=403)

        serializer = TeacherInviteSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        data = serializer.validated_data
        activation_key = build_teacher_activation_key(data["first_name"], request.user.school.name)
        is_admin_invite = request.user.role == "admin"

        teacher = User.objects.create_user(
            username=generate_placeholder_teacher_username(data["email"]),
            email=data["email"],
            password=activation_key,
            role="teacher",
            school=request.user.school,
            phone=data["phone"],
            first_name=data["first_name"],
            last_name=data["last_name"],
            must_change_password=True,
            is_approved=is_admin_invite,
            invited_by=request.user,
        )

        return Response(
            {
                "detail": "Teacher invited successfully." if is_admin_invite else "Teacher request submitted for admin approval.",
                "teacher": ParentSummarySerializer(teacher).data,
                "activation_key": activation_key,
                "school_code": request.user.school.school_code,
                "delivery_note": "Teachers should use their email or phone number plus this activation key, then choose a username during activation." if is_admin_invite else "The school admin must approve this teacher before activation can continue.",
            },
            status=status.HTTP_201_CREATED,
        )


class ApproveTeacherAPIView(APIView):
    permission_classes = [IsAuthenticated]

    @transaction.atomic
    def post(self, request, teacher_id):
        if request.user.role != "admin":
            return Response({"detail": "Only school admins can approve teachers."}, status=403)

        teacher = User.objects.filter(pk=teacher_id, school=request.user.school, role="teacher").first()
        if not teacher:
            return Response({"detail": "Teacher not found for this school."}, status=404)

        if teacher.is_approved:
            return Response({"detail": "Teacher is already approved.", "teacher": ParentSummarySerializer(teacher).data})

        teacher.is_approved = True
        teacher.save(update_fields=["is_approved"])

        return Response({"detail": "Teacher approved successfully.", "teacher": ParentSummarySerializer(teacher).data})


class ParentInviteAPIView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        if request.user.role not in {"admin", "teacher"}:
            return Response({"detail": "Only teachers or admins can view parents."}, status=403)

        parents = User.objects.filter(school=request.user.school, role="parent").order_by("username")
        students = Student.objects.filter(school=request.user.school).select_related("parent", "school_class").order_by(
            "first_name", "last_name"
        )
        return Response(
            {
                "parents": ParentSummarySerializer(parents, many=True).data,
                "students": StudentSummarySerializer(students, many=True).data,
            }
        )

    @transaction.atomic
    def post(self, request):
        if request.user.role not in {"admin", "teacher"}:
            return Response({"detail": "Only teachers or admins can invite parents."}, status=403)

        serializer = ParentInviteSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        data = serializer.validated_data
        temporary_password = generate_temporary_password()
        generated_username = generate_parent_username(data["parent_first_name"])

        parent = User.objects.create_user(
            username=generated_username,
            email=data["parent_email"],
            password=temporary_password,
            role="parent",
            school=request.user.school,
            phone=data.get("parent_phone", ""),
            first_name=data["parent_first_name"],
            last_name=data.get("parent_last_name", ""),
            must_change_password=True,
        )
        created_students = []

        for learner in data["learners"]:
            school_class = None
            class_name = learner.get("class_name", "").strip()
            class_stream = learner.get("class_stream", "").strip()

            if class_name:
                school_class, _ = SchoolClass.objects.get_or_create(
                    school=request.user.school,
                    name=class_name,
                    stream=class_stream,
                )

            created_students.append(
                Student.objects.create(
                    school=request.user.school,
                    parent=parent,
                    school_class=school_class,
                    first_name=learner["student_first_name"],
                    last_name=learner["student_last_name"],
                    admission_number=learner["admission_number"],
                    date_of_birth=learner["date_of_birth"],
                )
            )

        return Response(
            {
                "detail": "Parent invited and learners linked successfully.",
                "parent": ParentSummarySerializer(parent).data,
                "students": StudentSummarySerializer(created_students, many=True).data,
                "temporary_password": temporary_password,
                "school_code": request.user.school.school_code,
                "delivery_note": "Email/SMS delivery is not connected yet, so share these credentials manually.",
            },
            status=status.HTTP_201_CREATED,
        )
