from django.contrib import admin

from .models import SchoolFees, Transaction, Wallet


admin.site.register(SchoolFees)
admin.site.register(Wallet)
admin.site.register(Transaction)
