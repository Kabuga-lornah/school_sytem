from django.db import models
from django.conf import settings
from apps.users.models import School

User = settings.AUTH_USER_MODEL


class SchoolClass(models.Model):
    school = models.ForeignKey(School, on_delete=models.CASCADE, related_name='classes', null=True, blank=True)
    name = models.CharField(max_length=20)
    stream = models.CharField(max_length=10, blank=True)

    def __str__(self):
        return f"{self.name} {self.stream}".strip()


class Student(models.Model):
    school = models.ForeignKey(School, on_delete=models.CASCADE, related_name='students', null=True, blank=True)
    parent = models.ForeignKey(User, on_delete=models.CASCADE, related_name='children')
    school_class = models.ForeignKey('SchoolClass', on_delete=models.SET_NULL, null=True)
    first_name = models.CharField(max_length=50)
    last_name = models.CharField(max_length=50)
    admission_number = models.CharField(max_length=20, unique=True)
    date_of_birth = models.DateField()
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.first_name} {self.last_name}"


class Subject(models.Model):
    school = models.ForeignKey(School, on_delete=models.CASCADE, related_name='subjects', null=True, blank=True)
    name = models.CharField(max_length=50)

    def __str__(self):
        return self.name


class Assessment(models.Model):
    ASSESSMENT_TYPES = (
        ('cat', 'CAT'),
        ('exam', 'Exam'),
        ('assignment', 'Assignment'),
    )

    school = models.ForeignKey(School, on_delete=models.CASCADE, related_name='assessments', null=True, blank=True)
    subject = models.ForeignKey(Subject, on_delete=models.CASCADE)
    school_class = models.ForeignKey(SchoolClass, on_delete=models.CASCADE)
    title = models.CharField(max_length=100)
    type = models.CharField(max_length=20, choices=ASSESSMENT_TYPES)
    total_marks = models.FloatField()
    date = models.DateField()

    def __str__(self):
        return f"{self.title} ({self.subject.name})"


class Result(models.Model):
    student = models.ForeignKey(Student, on_delete=models.CASCADE, related_name='results')
    assessment = models.ForeignKey(Assessment, on_delete=models.CASCADE)
    score = models.FloatField()
    grade = models.CharField(max_length=5, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.student} - {self.assessment} - {self.score}"

    def save(self, *args, **kwargs):
        percentage = (self.score / self.assessment.total_marks) * 100

        if percentage >= 80:
            self.grade = 'A'
        elif percentage >= 70:
            self.grade = 'B'
        elif percentage >= 60:
            self.grade = 'C'
        elif percentage >= 50:
            self.grade = 'D'
        else:
            self.grade = 'E'

        super().save(*args, **kwargs)


class Behavior(models.Model):
    BEHAVIOR_TYPES = (
        ('positive', 'Positive'),
        ('negative', 'Negative'),
    )

    student = models.ForeignKey(Student, on_delete=models.CASCADE)
    type = models.CharField(max_length=10, choices=BEHAVIOR_TYPES)
    description = models.TextField()
    date = models.DateField()

    def __str__(self):
        return f"{self.student} - {self.type}"
