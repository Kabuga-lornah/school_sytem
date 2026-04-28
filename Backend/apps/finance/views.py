from rest_framework import viewsets

from .models import SchoolFees, Transaction, Wallet
from .serializers import SchoolFeesSerializer, TransactionSerializer, WalletSerializer


class SchoolFeesViewSet(viewsets.ModelViewSet):
    queryset = SchoolFees.objects.all()
    serializer_class = SchoolFeesSerializer


class WalletViewSet(viewsets.ModelViewSet):
    queryset = Wallet.objects.all()
    serializer_class = WalletSerializer


class TransactionViewSet(viewsets.ModelViewSet):
    queryset = Transaction.objects.all()
    serializer_class = TransactionSerializer
