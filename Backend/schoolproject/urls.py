"""
URL configuration for schoolproject project.

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/5.2/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  path('', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  path('', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.urls import include, path
    2. Add a URL to urlpatterns:  path('blog/', include('blog.urls'))
"""
from django.contrib import admin
from django.urls import include, path
from rest_framework_simplejwt.views import TokenRefreshView
from apps.users.views import (
    ActivateAccountAPIView,
    AdminTeacherInviteAPIView,
    ApproveTeacherAPIView,
    ParentInviteAPIView,
    RegisterSchoolAPIView,
    RoleAwareTokenObtainPairView,
)

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/auth/login/', RoleAwareTokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('api/auth/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('api/auth/register-school/', RegisterSchoolAPIView.as_view(), name='register-school'),
    path('api/auth/activate-account/', ActivateAccountAPIView.as_view(), name='activate-account'),
    path('api/admin/teachers/', AdminTeacherInviteAPIView.as_view(), name='admin-teacher-invites'),
    path('api/admin/teachers/<int:teacher_id>/approve/', ApproveTeacherAPIView.as_view(), name='approve-teacher'),
    path('api/school/parents/', ParentInviteAPIView.as_view(), name='school-parent-invites'),
    path('api/finance/', include('apps.finance.urls')),
    path('api/parent/', include('apps.users.urls')),
]
