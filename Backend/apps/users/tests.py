from datetime import timedelta

from django.test import override_settings
from django.urls import reverse
from django.utils import timezone
from rest_framework.test import APITestCase

from apps.academic.models import Assessment, Result, SchoolClass, Student, Subject
from apps.finance.models import SchoolFees, Transaction, Wallet

from .models import School, User


@override_settings(ALLOWED_HOSTS=["testserver", "localhost", "127.0.0.1"])
class ParentDashboardAPITests(APITestCase):
    def setUp(self):
        self.school = School.objects.create(
            name="Kings Academy",
            email="info@kings.example.com",
            phone="0700000000",
            location="Nairobi",
        )
        self.parent = User.objects.create_user(
            username="parent1",
            email="parent@example.com",
            password="testpass123",
            role="parent",
            school=self.school,
        )
        self.school_class = SchoolClass.objects.create(school=self.school, name="Grade 6", stream="East")
        self.student = Student.objects.create(
            school=self.school,
            parent=self.parent,
            school_class=self.school_class,
            first_name="John",
            last_name="Doe",
            admission_number="ADM001",
            date_of_birth="2014-01-01",
        )
        self.subject = Subject.objects.create(school=self.school, name="Mathematics")
        self.assessment = Assessment.objects.create(
            school=self.school,
            subject=self.subject,
            school_class=self.school_class,
            title="Midterm Exam",
            type="exam",
            total_marks=100,
            date=timezone.localdate(),
        )
        Result.objects.create(student=self.student, assessment=self.assessment, score=40)

        SchoolFees.objects.create(
            student=self.student,
            total_fees=50000,
            amount_paid=30000,
            due_date=timezone.localdate() - timedelta(days=1),
        )
        self.wallet = Wallet.objects.create(student=self.student, balance=0)
        Transaction.objects.create(
            wallet=self.wallet,
            amount=400,
            type="deposit",
            description="Parent top up",
        )

    def authenticate_with_jwt(self):
        login_response = self.client.post(
            reverse("token_obtain_pair"),
            {"username": "parent1", "password": "testpass123"},
            format="json",
        )

        self.assertEqual(login_response.status_code, 200)
        self.assertIn("access", login_response.data)
        self.assertIn("refresh", login_response.data)

        self.client.credentials(HTTP_AUTHORIZATION=f"Bearer {login_response.data['access']}")
        return login_response

    def test_valid_login_returns_tokens(self):
        response = self.client.post(
            reverse("token_obtain_pair"),
            {"username": "parent1", "password": "testpass123"},
            format="json",
        )

        self.assertEqual(response.status_code, 200)
        self.assertIn("access", response.data)

    def test_school_admin_can_register_school(self):
        response = self.client.post(
            reverse("register-school"),
            {
                "school_name": "Sunrise School",
                "school_email": "hello@sunrise.example.com",
                "school_phone": "0712345678",
                "location": "Kisumu",
                "admin_username": "sunrise_admin",
                "admin_email": "admin@sunrise.example.com",
                "password": "securepass123",
            },
            format="json",
        )

        self.assertEqual(response.status_code, 201)
        self.assertEqual(response.data["school"]["name"], "Sunrise School")
        self.assertTrue(response.data["school_code"].startswith("MYSHULE-"))
        self.assertEqual(response.data["admin"]["username"], "sunrise_admin")

    def test_invited_parent_can_activate_account(self):
        invited_parent = User.objects.create_user(
            username="invited_parent",
            email="invite@example.com",
            password="temp-pass-123",
            role="parent",
            school=self.school,
        )

        response = self.client.post(
            reverse("activate-account"),
            {
                "school_code": self.school.school_code,
                "identifier": invited_parent.username,
                "temporary_password": "temp-pass-123",
                "new_password": "new-pass-123",
            },
            format="json",
        )

        self.assertEqual(response.status_code, 200)
        invited_parent.refresh_from_db()
        self.assertTrue(invited_parent.check_password("new-pass-123"))
        self.assertEqual(response.data["detail"], "Account activated successfully.")

    def test_parent_dashboard_returns_401_without_authentication(self):
        response = self.client.get(reverse("parent-dashboard"))

        self.assertEqual(response.status_code, 401)

    def test_parent_dashboard_returns_200_for_authenticated_parent(self):
        self.authenticate_with_jwt()

        response = self.client.get(reverse("parent-dashboard"))

        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data["parent"]["username"], "parent1")
        self.assertEqual(len(response.data["children"]), 1)

        child = response.data["children"][0]
        self.assertEqual(child["name"], "John Doe")
        self.assertEqual(child["admission_number"], "ADM001")
        self.assertEqual(child["class"], "Grade 6 East")
        self.assertEqual(child["finance"]["fees"]["balance"], 20000)
        self.assertTrue(child["finance"]["fees"]["is_overdue"])
        self.assertEqual(child["finance"]["wallet"]["balance"], 400)
        self.assertTrue(child["finance"]["wallet"]["is_low_balance"])
        self.assertEqual(len(child["finance"]["wallet"]["recent_transactions"]), 1)
        self.assertEqual(child["academics"]["latest_results"][0]["grade"], "E")
        self.assertIn("fees overdue", child["alerts"])
        self.assertIn("wallet low balance", child["alerts"])
        self.assertIn("weak academic result", child["alerts"])

    def test_refresh_endpoint_returns_new_access_token(self):
        login_response = self.authenticate_with_jwt()

        response = self.client.post(
            reverse("token_refresh"),
            {"refresh": login_response.data["refresh"]},
            format="json",
        )

        self.assertEqual(response.status_code, 200)
        self.assertIn("access", response.data)
