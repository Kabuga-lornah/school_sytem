from django.contrib.auth.models import AbstractUser
from django.db import models
from django.utils.text import slugify


class School(models.Model):
    name = models.CharField(max_length=255)
    email = models.EmailField()
    phone = models.CharField(max_length=30)
    location = models.CharField(max_length=255)
    school_code = models.CharField(max_length=50, unique=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def save(self, *args, **kwargs):
        if not self.school_code:
            base_code = f"MYSHULE-{slugify(self.name).upper().replace('-', '')[:12]}"
            candidate = base_code
            suffix = 1
            while School.objects.filter(school_code=candidate).exclude(pk=self.pk).exists():
                suffix += 1
                candidate = f"{base_code}-{suffix:03d}"
            self.school_code = candidate
        super().save(*args, **kwargs)

    def __str__(self):
        return self.name

class User(AbstractUser):
    ROLE_CHOICES = (
        ('admin', 'Admin'),
        ('teacher', 'Teacher'),
        ('parent', 'Parent'),
    )

    role = models.CharField(max_length=10, choices=ROLE_CHOICES)
    phone = models.CharField(max_length=30, blank=True)
    must_change_password = models.BooleanField(default=False)
    is_approved = models.BooleanField(default=True)
    invited_by = models.ForeignKey('self', null=True, blank=True, on_delete=models.SET_NULL, related_name='invited_users')
    school = models.ForeignKey(School, null=True, blank=True, on_delete=models.CASCADE, related_name='users')

    def __str__(self):
        return f"{self.username} ({self.role})"
