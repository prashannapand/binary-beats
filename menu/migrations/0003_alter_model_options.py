from django.db import migrations


class Migration(migrations.Migration):
    dependencies = [("menu", "0002_menu_details")]

    operations = [
        migrations.AlterModelOptions(
            name="category",
            options={"ordering": ["display_order", "name"]},
        ),
        migrations.AlterModelOptions(
            name="menuitem",
            options={"ordering": ["category__display_order", "name"]},
        ),
    ]
