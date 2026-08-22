import uuid
from django.db import migrations, models
import django.db.models.deletion
import django.utils.timezone


class Migration(migrations.Migration):
    initial = True

    dependencies = [
        ("tables", "0001_initial"),
    ]

    operations = [
        migrations.CreateModel(
            name="CustomerSession",
            fields=[
                ("id", models.UUIDField(default=uuid.uuid4, editable=False, primary_key=True, serialize=False)),
                ("token", models.CharField(default=uuid.uuid4, max_length=128, unique=True)),
                ("created_at", models.DateTimeField(default=django.utils.timezone.now)),
                ("expires_at", models.DateTimeField()),
                ("dining_session", models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name="customer_sessions", to="tables.diningsession")),
            ],
        ),
    ]
