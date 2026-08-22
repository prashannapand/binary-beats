from django.db import models
import uuid
from django.utils import timezone

class Table(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    restaurant = models.ForeignKey("restaurants.Restaurant", on_delete=models.CASCADE, related_name="tables")
    number = models.CharField(max_length=32)

    class Meta:
        constraints = [
            models.UniqueConstraint(fields=["restaurant", "number"], name="unique_table_number_per_restaurant"),
        ]

    def __str__(self):
        return f"{self.restaurant.name} · Table {self.number}"

class DiningSession(models.Model):
    STATUS_ACTIVE = "ACTIVE"
    STATUS_CLOSED = "CLOSED"
    STATUS_CHOICES = [(STATUS_ACTIVE,"Active"), (STATUS_CLOSED,"Closed")]

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    table = models.ForeignKey(Table, on_delete=models.CASCADE, related_name="sessions")
    restaurant = models.ForeignKey("restaurants.Restaurant", on_delete=models.CASCADE)
    opened_by = models.ForeignKey("accounts.StaffUser", null=True, on_delete=models.SET_NULL)
    started_at = models.DateTimeField(default=timezone.now)
    closed_at = models.DateTimeField(null=True, blank=True)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default=STATUS_ACTIVE)

    def close(self):
        if self.status == self.STATUS_CLOSED:
            return
        self.status = self.STATUS_CLOSED
        self.closed_at = timezone.now()
        self.save(update_fields=['status','closed_at'])
