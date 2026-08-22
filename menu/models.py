from django.db import models
import uuid

class Category(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    restaurant = models.ForeignKey("restaurants.Restaurant", on_delete=models.CASCADE, related_name="categories")
    name = models.CharField(max_length=120)
    display_order = models.PositiveIntegerField(default=0)

    class Meta:
        ordering = ["display_order", "name"]
        constraints = [
            models.UniqueConstraint(fields=["restaurant", "name"], name="unique_category_name_per_restaurant"),
        ]

class MenuItem(models.Model):
    STATE_AVAILABLE = "AVAILABLE"
    STATE_UNAVAILABLE = "UNAVAILABLE"
    STATE_HIDDEN = "HIDDEN"
    STATE_CHOICES = [(STATE_AVAILABLE,"Available"), (STATE_UNAVAILABLE,"Unavailable"), (STATE_HIDDEN,"Hidden")]

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    restaurant = models.ForeignKey("restaurants.Restaurant", on_delete=models.CASCADE, related_name="menu_items")
    category = models.ForeignKey(Category, null=True, on_delete=models.SET_NULL, related_name="items")
    name = models.CharField(max_length=255)
    description = models.TextField(blank=True)
    unit_price = models.DecimalField(max_digits=10, decimal_places=2)
    image_url = models.URLField(blank=True)
    is_vegetarian = models.BooleanField(null=True, blank=True)
    preparation_minutes = models.PositiveSmallIntegerField(default=15)
    state = models.CharField(max_length=20, choices=STATE_CHOICES, default=STATE_AVAILABLE)
    is_special_today = models.BooleanField(default=False)
    special_start = models.DateField(null=True, blank=True)
    special_end = models.DateField(null=True, blank=True)

    class Meta:
        ordering = ["category__display_order", "name"]

    def is_orderable(self):
        return self.state == self.STATE_AVAILABLE
