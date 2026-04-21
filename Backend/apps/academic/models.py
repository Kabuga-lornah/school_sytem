from django.db import models
from django.conf import settings

User = settings.AUTH_USER_MODEL

class Student(models.Model):
    parent = models.ForeignKey(User, on_delete=models.CASCADE, related_name='children')
    first_name = models.CharField(max_length=50)
    last_name = models.CharField(max_length=50)
    admission_number = models.CharField(max_length=20, unique=True)
    date_of_birth = models.DateField()
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.first_name} {self.last_name}"