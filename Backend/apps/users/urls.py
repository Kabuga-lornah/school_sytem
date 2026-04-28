from django.urls import path

from .views import ParentDashboardAPIView

urlpatterns = [
    path("dashboard/", ParentDashboardAPIView.as_view(), name="parent-dashboard"),
]
