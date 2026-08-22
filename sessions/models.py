from django.db import models
import uuid
from django.utils import timezone
from datetime import timedelta


def default_expiry():
    return timezone.now() + timedelta(hours=6)

class CustomerSession(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    dining_session = models.ForeignKey("tables.DiningSession", on_delete=models.CASCADE, related_name="customer_sessions")
    token = models.CharField(max_length=128, unique=True, default=uuid.uuid4)
    created_at = models.DateTimeField(default=timezone.now)
    expires_at = models.DateTimeField(default=default_expiry)

    @property
    def is_active(self):
        return (
            self.expires_at > timezone.now()
            and self.dining_session.status == "ACTIVE"
        )

    def __str__(self):
        return f"{self.id}"
