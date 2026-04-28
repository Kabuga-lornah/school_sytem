from rest_framework import serializers

from .models import SchoolFees, Transaction, Wallet


class SchoolFeesSerializer(serializers.ModelSerializer):
    balance = serializers.SerializerMethodField()
    is_overdue = serializers.SerializerMethodField()

    class Meta:
        model = SchoolFees
        fields = '__all__'

    def get_balance(self, obj):
        return obj.balance()

    def get_is_overdue(self, obj):
        return obj.is_overdue()


class WalletSerializer(serializers.ModelSerializer):
    is_low_balance = serializers.SerializerMethodField()

    class Meta:
        model = Wallet
        fields = '__all__'

    def get_is_low_balance(self, obj):
        return obj.is_low_balance()


class TransactionSerializer(serializers.ModelSerializer):
    class Meta:
        model = Transaction
        fields = '__all__'
