from rest_framework import serializers

from apps.academic.models import Result, Student
from apps.finance.models import SchoolFees, Transaction, Wallet

from .models import School, User


class SchoolSerializer(serializers.ModelSerializer):
    class Meta:
        model = School
        fields = ("id", "name", "email", "phone", "location", "school_code", "created_at")


class SchoolAdminRegisterSerializer(serializers.Serializer):
    school_name = serializers.CharField(max_length=255)
    school_email = serializers.EmailField()
    school_phone = serializers.CharField(max_length=30)
    location = serializers.CharField(max_length=255)
    admin_username = serializers.CharField(max_length=150)
    admin_email = serializers.EmailField()
    password = serializers.CharField(write_only=True, min_length=8)

    def validate_admin_username(self, value):
        if User.objects.filter(username=value).exists():
            raise serializers.ValidationError("A user with that username already exists.")
        return value

    def validate_admin_email(self, value):
        if User.objects.filter(email=value).exists():
            raise serializers.ValidationError("A user with that email already exists.")
        return value


class ActivateAccountSerializer(serializers.Serializer):
    school_code = serializers.CharField(max_length=50)
    identifier = serializers.CharField(max_length=255)
    temporary_password = serializers.CharField(write_only=True)
    new_password = serializers.CharField(write_only=True, min_length=8)


class ParentSummarySerializer(serializers.ModelSerializer):
    school = SchoolSerializer(read_only=True)

    class Meta:
        model = User
        fields = ("id", "username", "email", "school")


class ResultSummarySerializer(serializers.ModelSerializer):
    assessment_title = serializers.CharField(source="assessment.title", read_only=True)
    subject = serializers.CharField(source="assessment.subject.name", read_only=True)

    class Meta:
        model = Result
        fields = ("id", "assessment_title", "subject", "score", "grade", "created_at")


class FeesSummarySerializer(serializers.ModelSerializer):
    balance = serializers.SerializerMethodField()
    is_overdue = serializers.SerializerMethodField()

    class Meta:
        model = SchoolFees
        fields = ("total_fees", "amount_paid", "balance", "is_overdue", "due_date")

    def get_balance(self, obj):
        return obj.balance()

    def get_is_overdue(self, obj):
        return obj.is_overdue()


class TransactionSummarySerializer(serializers.ModelSerializer):
    class Meta:
        model = Transaction
        fields = ("id", "amount", "type", "description", "created_at")


class WalletSummarySerializer(serializers.ModelSerializer):
    is_low_balance = serializers.SerializerMethodField()
    recent_transactions = serializers.SerializerMethodField()

    class Meta:
        model = Wallet
        fields = ("balance", "is_low_balance", "recent_transactions")

    def get_is_low_balance(self, obj):
        return obj.is_low_balance()

    def get_recent_transactions(self, obj):
        transactions = list(obj.transactions.all()[:5])
        return TransactionSummarySerializer(transactions, many=True).data


class ChildDashboardSerializer(serializers.ModelSerializer):
    name = serializers.SerializerMethodField()
    class_display = serializers.SerializerMethodField()
    academics = serializers.SerializerMethodField()
    finance = serializers.SerializerMethodField()
    alerts = serializers.SerializerMethodField()

    class Meta:
        model = Student
        fields = (
            "id",
            "name",
            "admission_number",
            "class_display",
            "academics",
            "finance",
            "alerts",
        )

    def get_name(self, obj):
        return f"{obj.first_name} {obj.last_name}".strip()

    def get_class_display(self, obj):
        if obj.school_class_id and obj.school_class:
            return str(obj.school_class)
        return None

    def get_academics(self, obj):
        latest_results = list(obj.results.all()[:5])
        return {"latest_results": ResultSummarySerializer(latest_results, many=True).data}

    def get_finance(self, obj):
        fees = getattr(obj, "fees_account", None)
        wallet = getattr(obj, "wallet", None)

        return {
            "fees": FeesSummarySerializer(fees).data if fees else None,
            "wallet": WalletSummarySerializer(wallet).data if wallet else None,
        }

    def get_alerts(self, obj):
        alerts = []
        fees = getattr(obj, "fees_account", None)
        wallet = getattr(obj, "wallet", None)
        latest_results = list(obj.results.all()[:5])

        if fees and fees.is_overdue():
            alerts.append("fees overdue")

        if wallet and wallet.is_low_balance():
            alerts.append("wallet low balance")

        if any(result.grade in {"D", "E"} for result in latest_results):
            alerts.append("weak academic result")

        return alerts

    def to_representation(self, instance):
        data = super().to_representation(instance)
        data["class"] = data.pop("class_display")
        return data
