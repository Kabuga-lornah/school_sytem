from django.contrib.auth import get_user_model
from django.db import transaction
from django.db.models import Prefetch, Q
from rest_framework import status
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from apps.academic.models import Result, Student
from apps.finance.models import Transaction

from .models import School
from .serializers import (
    ActivateAccountSerializer,
    ChildDashboardSerializer,
    ParentSummarySerializer,
    SchoolAdminRegisterSerializer,
    SchoolSerializer,
)

User = get_user_model()


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

        try:
            school = School.objects.get(school_code=data["school_code"])
        except School.DoesNotExist:
            return Response({"detail": "Invalid school code."}, status=status.HTTP_400_BAD_REQUEST)

        user = (
            User.objects.filter(school=school)
            .filter(Q(username=data["identifier"]) | Q(email=data["identifier"]))
            .first()
        )

        if not user:
            return Response({"detail": "Account not found for this school."}, status=status.HTTP_400_BAD_REQUEST)

        if user.role not in {"teacher", "parent"}:
            return Response(
                {"detail": "Only invited parent or teacher accounts can be activated."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        if not user.check_password(data["temporary_password"]):
            return Response({"detail": "Temporary password is incorrect."}, status=status.HTTP_400_BAD_REQUEST)

        user.set_password(data["new_password"])
        user.save(update_fields=["password"])

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
