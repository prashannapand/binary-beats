from django.db import migrations, models


class Migration(migrations.Migration):
    dependencies = [("tables", "0001_initial")]

    operations = [
        migrations.AddConstraint(
            model_name="table",
            constraint=models.UniqueConstraint(fields=("restaurant", "number"), name="unique_table_number_per_restaurant"),
        ),
    ]
