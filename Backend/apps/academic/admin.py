from django.contrib import admin

from .models import Assessment, Behavior, Result, SchoolClass, Student, Subject


admin.site.register(SchoolClass)
admin.site.register(Student)
admin.site.register(Subject)
admin.site.register(Assessment)
admin.site.register(Result)
admin.site.register(Behavior)
