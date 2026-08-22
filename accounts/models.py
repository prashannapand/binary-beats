from django.contrib.auth.models import AbstractUser
from django.db import models

class StaffUser(AbstractUser):
    ROLE_ADMIN = "ADMIN"
    ROLE_STAFF = "STAFF"
    ROLE_CHOICES = [(ROLE_ADMIN, "Admin"), (ROLE_STAFF, "Staff")]

    restaurant = models.ForeignKey("restaurants.Restaurant", on_delete=models.CASCADE, null=True, blank=True, related_name="staff")
    role = models.CharField(max_length=16, choices=ROLE_CHOICES, default=ROLE_STAFF)

    def __str__(self):
        return self.username
