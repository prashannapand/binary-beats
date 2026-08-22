import uuid
from decimal import Decimal
from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):
    dependencies = [
        ("orders", "0001_initial"),
        ("restaurants", "0001_initial"),
        ("tables", "0001_initial"),
    ]

    operations = [
        migrations.AddField(model_name="order", name="rejection_reason", field=models.TextField(blank=True)),
        migrations.AddField(model_name="order", name="updated_at", field=models.DateTimeField(auto_now=True)),
        migrations.CreateModel(
            name="Bill",
            fields=[
                ("id", models.UUIDField(default=uuid.uuid4, editable=False, primary_key=True, serialize=False)),
                ("subtotal", models.DecimalField(decimal_places=2, default=Decimal("0.00"), max_digits=10)),
                ("tax", models.DecimalField(decimal_places=2, default=Decimal("0.00"), max_digits=10)),
                ("service_charge", models.DecimalField(decimal_places=2, default=Decimal("0.00"), max_digits=10)),
                ("total", models.DecimalField(decimal_places=2, default=Decimal("0.00"), max_digits=10)),
                ("status", models.CharField(choices=[("NOT_REQUESTED", "Not requested"), ("REQUESTED", "Requested"), ("PAID", "Paid")], default="NOT_REQUESTED", max_length=20)),
                ("requested_at", models.DateTimeField(blank=True, null=True)),
                ("paid_at", models.DateTimeField(blank=True, null=True)),
                ("dining_session", models.OneToOneField(on_delete=django.db.models.deletion.CASCADE, related_name="bill", to="tables.diningsession")),
                ("restaurant", models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name="bills", to="restaurants.restaurant")),
            ],
        ),
    ]
