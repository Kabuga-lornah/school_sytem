from django.urls import include, path
from rest_framework.routers import DefaultRouter

from .views import SchoolFeesViewSet, TransactionViewSet, WalletViewSet

router = DefaultRouter()
router.register(r'fees', SchoolFeesViewSet)
router.register(r'wallets', WalletViewSet)
router.register(r'transactions', TransactionViewSet)

urlpatterns = [
    path('', include(router.urls)),
]
