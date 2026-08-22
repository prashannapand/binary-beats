from django.db import migrations, models


class Migration(migrations.Migration):
    dependencies = [("restaurants", "0001_initial")]

    operations = [
        migrations.AddField(
            model_name="restaurant",
            name="logo_url",
            field=models.URLField(blank=True),
        ),
        migrations.AddField(
            model_name="restaurant",
            name="address",
            field=models.TextField(blank=True),
        ),
        migrations.AddField(
            model_name="restaurant",
            name="created_at",
            field=models.DateTimeField(auto_now_add=True),
        ),
    ]
