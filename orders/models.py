import uuid
from decimal import Decimal
from django.db import models
from django.utils import timezone
from django.db.models import Sum


class ServiceRequest(models.Model):
    TYPE_WATER = "WATER"
    TYPE_PLATE = "PLATE"
    TYPE_CUTLERY = "CUTLERY"
    TYPE_NAPKINS = "NAPKINS"
    TYPE_CHAIR = "CHAIR"
    TYPE_STAFF = "STAFF"
    TYPE_BILL = "BILL"
    TYPE_CUSTOM = "CUSTOM"

    TYPE_CHOICES = [
        (TYPE_WATER, "Request Water"),
        (TYPE_PLATE, "Extra Plate"),
        (TYPE_CUTLERY, "Cutlery"),
        (TYPE_NAPKINS, "Napkins"),
        (TYPE_CHAIR, "Extra Chair"),
        (TYPE_STAFF, "Call Staff"),
        (TYPE_BILL, "Request Bill"),
        (TYPE_CUSTOM, "Custom Request"),
    ]

    STATUS_PENDING = "PENDING"
    STATUS_ACKNOWLEDGED = "ACKNOWLEDGED"
    STATUS_FULFILLED = "FULFILLED"

    STATUS_CHOICES = [
        (STATUS_PENDING, "Pending"),
        (STATUS_ACKNOWLEDGED, "Acknowledged"),
        (STATUS_FULFILLED, "Fulfilled"),
    ]

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    restaurant = models.ForeignKey("restaurants.Restaurant", on_delete=models.CASCADE, related_name="service_requests")
    dining_session = models.ForeignKey("tables.DiningSession", on_delete=models.CASCADE, related_name="service_requests")
    request_type = models.CharField(max_length=20, choices=TYPE_CHOICES, default=TYPE_WATER)
    custom_note = models.CharField(max_length=255, blank=True)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default=STATUS_PENDING)
    created_at = models.DateTimeField(default=timezone.now)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["-created_at"]


class Order(models.Model):
    STATUS_PENDING = "PENDING"
    STATUS_CONFIRMED = "CONFIRMED"
    STATUS_PREPARING = "PREPARING"
    STATUS_READY = "READY"
    STATUS_SERVED = "SERVED"
    STATUS_REJECTED = "REJECTED"

    STATUS_CHOICES = [
        (STATUS_PENDING, "Pending"),
        (STATUS_CONFIRMED, "Confirmed"),
        (STATUS_PREPARING, "Preparing"),
        (STATUS_READY, "Ready"),
        (STATUS_SERVED, "Served"),
        (STATUS_REJECTED, "Rejected"),
    ]

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    restaurant = models.ForeignKey("restaurants.Restaurant", on_delete=models.CASCADE, related_name="orders")
    dining_session = models.ForeignKey("tables.DiningSession", on_delete=models.CASCADE, related_name="orders")
    customer_session = models.ForeignKey("customer_sessions.CustomerSession", on_delete=models.CASCADE, related_name="orders")
    created_at = models.DateTimeField(default=timezone.now)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default=STATUS_PENDING)
    order_level_note = models.TextField(blank=True)
    rejection_reason = models.TextField(blank=True)
    subtotal = models.DecimalField(max_digits=10, decimal_places=2, default=Decimal("0.00"))
    total = models.DecimalField(max_digits=10, decimal_places=2, default=Decimal("0.00"))
    updated_at = models.DateTimeField(auto_now=True)

    def can_transition(self, new_status):
        allowed = {
            self.STATUS_PENDING: [self.STATUS_CONFIRMED, self.STATUS_REJECTED],
            self.STATUS_CONFIRMED: [self.STATUS_PREPARING],
            self.STATUS_PREPARING: [self.STATUS_READY],
            self.STATUS_READY: [self.STATUS_SERVED],
        }
        return new_status in allowed.get(self.status, [])

    def set_status(self, new_status, rejection_reason=""):
        if not self.can_transition(new_status):
            raise ValueError(f"Invalid transition {self.status} -> {new_status}")
        self.status = new_status
        if new_status == self.STATUS_REJECTED:
            self.rejection_reason = rejection_reason.strip()
        self.save(update_fields=["status", "rejection_reason", "updated_at"])


class OrderItem(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    order = models.ForeignKey(Order, on_delete=models.CASCADE, related_name="items")
    menu_item = models.ForeignKey("menu.MenuItem", on_delete=models.SET_NULL, null=True)
    quantity = models.PositiveSmallIntegerField(default=1)
    item_note = models.TextField(blank=True)
    unit_price = models.DecimalField(max_digits=10, decimal_places=2)
    line_total = models.DecimalField(max_digits=10, decimal_places=2, default=Decimal("0.00"))
    is_rejected = models.BooleanField(default=False)
    rejection_note = models.CharField(max_length=255, blank=True)

    def save(self, *args, **kwargs):
        self.line_total = self.unit_price * self.quantity
        super().save(*args, **kwargs)


class Bill(models.Model):
    STATUS_NOT_REQUESTED = "NOT_REQUESTED"
    STATUS_REQUESTED = "REQUESTED"
    STATUS_PAID = "PAID"

    STATUS_CHOICES = [
        (STATUS_NOT_REQUESTED, "Not requested"),
        (STATUS_REQUESTED, "Requested"),
        (STATUS_PAID, "Paid"),
    ]

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    restaurant = models.ForeignKey("restaurants.Restaurant", on_delete=models.CASCADE, related_name="bills")
    dining_session = models.OneToOneField("tables.DiningSession", on_delete=models.CASCADE, related_name="bill")
    
    # Financial breakdown
    subtotal = models.DecimalField(max_digits=10, decimal_places=2, default=Decimal("0.00"))
    discount = models.DecimalField(max_digits=10, decimal_places=2, default=Decimal("0.00"))
    additional_charges = models.DecimalField(max_digits=10, decimal_places=2, default=Decimal("0.00"))
    service_charge = models.DecimalField(max_digits=10, decimal_places=2, default=Decimal("0.00"))
    vat_rate = models.DecimalField(max_digits=4, decimal_places=2, default=Decimal("0.13"))  # 13% Configurable
    tax = models.DecimalField(max_digits=10, decimal_places=2, default=Decimal("0.00"))
    total = models.DecimalField(max_digits=10, decimal_places=2, default=Decimal("0.00"))
    
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default=STATUS_NOT_REQUESTED)
    requested_at = models.DateTimeField(null=True, blank=True)
    paid_at = models.DateTimeField(null=True, blank=True)

    def refresh_totals(self):
        # Calculate active subtotal from non-rejected orders and items
        active_orders = self.dining_session.orders.exclude(status=Order.STATUS_REJECTED)
        active_items_total = OrderItem.objects.filter(
            order__in=active_orders,
            is_rejected=False
        ).aggregate(val=Sum("line_total"))["val"] or Decimal("0.00")

        self.subtotal = active_items_total
        taxable_amount = max(Decimal("0.00"), self.subtotal - self.discount + self.additional_charges + self.service_charge)
        self.tax = (taxable_amount * self.vat_rate).quantize(Decimal("0.01"))
        self.total = taxable_amount + self.tax
        self.save(update_fields=["subtotal", "tax", "total", "discount", "additional_charges", "service_charge"])

    def request(self):
        self.refresh_totals()
        if self.status == self.STATUS_NOT_REQUESTED:
            self.status = self.STATUS_REQUESTED
            self.requested_at = timezone.now()
            self.save(update_fields=["status", "requested_at"])

    def mark_paid(self):
        self.refresh_totals()
        self.status = self.STATUS_PAID
        self.paid_at = timezone.now()
        self.save(update_fields=["status", "paid_at"])