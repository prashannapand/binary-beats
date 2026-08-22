from django.db import migrations, models


class Migration(migrations.Migration):
    dependencies = [("menu", "0001_initial")]

    operations = [
        migrations.AddField(model_name="category", name="display_order", field=models.PositiveIntegerField(default=0)),
        migrations.AddField(model_name="menuitem", name="description", field=models.TextField(blank=True)),
        migrations.AddField(model_name="menuitem", name="image_url", field=models.URLField(blank=True)),
        migrations.AddField(model_name="menuitem", name="is_vegetarian", field=models.BooleanField(blank=True, null=True)),
        migrations.AddField(model_name="menuitem", name="preparation_minutes", field=models.PositiveSmallIntegerField(default=15)),
        migrations.AddField(model_name="menuitem", name="special_start", field=models.DateField(blank=True, null=True)),
        migrations.AddField(model_name="menuitem", name="special_end", field=models.DateField(blank=True, null=True)),
        migrations.AddConstraint(
            model_name="category",
            constraint=models.UniqueConstraint(fields=("restaurant", "name"), name="unique_category_name_per_restaurant"),
        ),
    ]
