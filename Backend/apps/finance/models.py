from django.db import models
from django.core.exceptions import ValidationError
from django.utils import timezone

from apps.academic.models import Student


class SchoolFees(models.Model):
    student = models.OneToOneField(Student, on_delete=models.CASCADE, related_name='fees_account')
    total_fees = models.FloatField()
    amount_paid = models.FloatField(default=0)
    due_date = models.DateField()

    def balance(self):
        return self.total_fees - self.amount_paid

    def is_overdue(self):
        return self.due_date < timezone.localdate() and self.balance() > 0

    def __str__(self):
        return f"{self.student} Fees"


class Wallet(models.Model):
    student = models.OneToOneField(Student, on_delete=models.CASCADE, related_name='wallet')
    balance = models.FloatField(default=0)

    def is_low_balance(self):
        return self.balance < 500

    def __str__(self):
        return f"{self.student} Wallet"


class Transaction(models.Model):
    TRANSACTION_TYPES = (
        ('deposit', 'Deposit'),
        ('withdraw', 'Withdraw'),
        ('payment', 'School Fee Payment'),
    )

    wallet = models.ForeignKey(Wallet, on_delete=models.CASCADE, related_name='transactions')
    amount = models.FloatField()
    type = models.CharField(max_length=20, choices=TRANSACTION_TYPES)
    description = models.CharField(max_length=255, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.wallet.student} - {self.type} - {self.amount}"

    def save(self, *args, **kwargs):
        if not self.pk:
            wallet = self.wallet

            if self.type == 'deposit':
                wallet.balance += self.amount
            elif self.type == 'withdraw':
                if wallet.balance >= self.amount:
                    wallet.balance -= self.amount
                else:
                    raise ValidationError("Insufficient wallet balance")
            elif self.type == 'payment':
                if wallet.balance >= self.amount:
                    wallet.balance -= self.amount

                    fees = wallet.student.fees_account
                    fees.amount_paid += self.amount
                    fees.save()
                else:
                    raise ValidationError("Not enough balance to pay fees")

            wallet.save()

        super().save(*args, **kwargs)
