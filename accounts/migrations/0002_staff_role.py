from django.db import migrations, models


class Migration(migrations.Migration):
    dependencies = [("accounts", "0001_initial")]

    operations = [
        migrations.AddField(
            model_name="staffuser",
            name="role",
            field=models.CharField(choices=[("ADMIN", "Admin"), ("STAFF", "Staff")], default="STAFF", max_length=16),
        ),
    ]
