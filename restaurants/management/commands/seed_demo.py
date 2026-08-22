from django.core.management.base import BaseCommand

from accounts.models import StaffUser
from menu.models import Category, MenuItem
from restaurants.models import Restaurant
from tables.models import Table


class Command(BaseCommand):
    help = "Seed Himalayan Bites demo data and a staff login"

    def handle(self, *args, **options):
        restaurant, _ = Restaurant.objects.get_or_create(
            slug="himalayan-bites",
            defaults={"name": "Himalayan Bites", "address": "Kathmandu"},
        )
        for number in range(1, 6):
            Table.objects.get_or_create(restaurant=restaurant, number=str(number))

        menu = {
            "Momos": [
                ("Chicken Cheese Momo", "Juicy chicken momo with a creamy cheese filling.", "220.00", False, True),
                ("Veg Momo", "Seasonal vegetables wrapped in a steamed dumpling.", "180.00", True, False),
            ],
            "Noodles": [
                ("Chicken Chowmein", "Wok-tossed noodles with chicken and crisp vegetables.", "260.00", False, False),
                ("Veg Chowmein", "Wok-tossed noodles with fresh vegetables.", "220.00", True, False),
            ],
            "Pizza": [
                ("Margherita Pizza", "Tomato, mozzarella, and basil.", "450.00", True, False),
            ],
            "Drinks": [
                ("Coke", "Chilled 250 ml bottle.", "50.00", None, False),
                ("Lemonade", "Freshly squeezed lemon, mint, and soda.", "90.00", True, False),
            ],
            "Desserts": [
                ("Brownie", "Warm chocolate brownie.", "160.00", True, False),
            ],
        }
        for display_order, (category_name, items) in enumerate(menu.items()):
            category, _ = Category.objects.get_or_create(
                restaurant=restaurant,
                name=category_name,
                defaults={"display_order": display_order},
            )
            for name, description, price, is_vegetarian, is_special in items:
                MenuItem.objects.get_or_create(
                    restaurant=restaurant,
                    category=category,
                    name=name,
                    defaults={
                        "description": description,
                        "unit_price": price,
                        "is_vegetarian": is_vegetarian,
                        "is_special_today": is_special,
                    },
                )

        staff, created = StaffUser.objects.get_or_create(
            username="demo_staff",
            defaults={"restaurant": restaurant, "role": StaffUser.ROLE_ADMIN},
        )
        if created:
            staff.set_password("demo1234")
            staff.save(update_fields=["password"])
        self.stdout.write(self.style.SUCCESS("Seeded Himalayan Bites. Staff login: demo_staff / demo1234"))
