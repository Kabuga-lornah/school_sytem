from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as DjangoUserAdmin

from .models import School, User


@admin.register(School)
class SchoolAdmin(admin.ModelAdmin):
    list_display = ("name", "school_code", "email", "phone", "location", "created_at")
    search_fields = ("name", "school_code", "email")


@admin.register(User)
class UserAdmin(DjangoUserAdmin):
    fieldsets = DjangoUserAdmin.fieldsets + (
        ("School Access", {"fields": ("role", "school")}),
    )
    add_fieldsets = DjangoUserAdmin.add_fieldsets + (
        ("School Access", {"fields": ("role", "school")}),
    )
    list_display = ("username", "email", "role", "school", "is_staff")
    list_filter = ("role", "school", "is_staff", "is_superuser", "is_active")
