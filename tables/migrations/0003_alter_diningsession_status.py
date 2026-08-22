from django.db import migrations, models


class Migration(migrations.Migration):
    dependencies = [("tables", "0002_table_constraint")]

    operations = [
        migrations.AlterField(
            model_name="diningsession",
            name="status",
            field=models.CharField(choices=[("ACTIVE", "Active"), ("CLOSED", "Closed")], default="ACTIVE", max_length=20),
        ),
    ]
