from decimal import Decimal

from django.test import TestCase

from accounts.models import StaffUser
from menu.models import Category, MenuItem
from orders.models import Bill, Order
from restaurants.models import Restaurant
from tables.models import Table


class MVPWorkflowTests(TestCase):
    def setUp(self):
        self.restaurant = Restaurant.objects.create(name="Himalayan Bites", slug="himalayan-bites")
        self.other_restaurant = Restaurant.objects.create(name="Other Bites", slug="other-bites")
        self.table = Table.objects.create(restaurant=self.restaurant, number="2")
        category = Category.objects.create(restaurant=self.restaurant, name="Momos")
        self.item = MenuItem.objects.create(
            restaurant=self.restaurant,
            category=category,
            name="Chicken Momo",
            unit_price=Decimal("180.00"),
        )
        self.staff = StaffUser.objects.create(username="staff", restaurant=self.restaurant)
        self.staff.set_password("secret123")
        self.staff.save()
        self.other_staff = StaffUser.objects.create(username="other", restaurant=self.other_restaurant)
        self.other_staff.set_password("secret123")
        self.other_staff.save()

    def staff_token(self, username="staff"):
        response = self.client.post(
            "/api/staff/login/",
            {"username": username, "password": "secret123"},
            content_type="application/json",
        )
        self.assertEqual(response.status_code, 200)
        return response.json()["access"]

    def staff_headers(self, username="staff"):
        return {"HTTP_AUTHORIZATION": f"Bearer {self.staff_token(username)}"}

    def open_table_and_customer_token(self):
        response = self.client.post(f"/api/staff/tables/{self.table.id}/open/", **self.staff_headers())
        self.assertEqual(response.status_code, 201)
        response = self.client.post(
            "/api/customer/sessions/",
            {"restaurant_slug": self.restaurant.slug, "table_id": str(self.table.id)},
            content_type="application/json",
        )
        self.assertEqual(response.status_code, 201)
        return response.json()["customer_token"]

    def test_complete_table_session_workflow(self):
        customer_token = self.open_table_and_customer_token()
        customer_headers = {"HTTP_X_CUSTOMER_TOKEN": customer_token}

        response = self.client.get("/api/customer/menu/", **customer_headers)
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.json()["categories"][0]["items"][0]["name"], "Chicken Momo")

        response = self.client.post(
            "/api/customer/orders/",
            {"items": [{"menu_item_id": str(self.item.id), "quantity": 2, "item_note": "Less spicy"}]},
            content_type="application/json",
            **customer_headers,
        )
        self.assertEqual(response.status_code, 201)
        order_id = response.json()["id"]
        self.assertEqual(response.json()["total"], "360.00")

        for next_status in ("CONFIRMED", "PREPARING", "READY", "SERVED"):
            response = self.client.post(
                f"/api/staff/orders/{order_id}/status/",
                {"status": next_status},
                content_type="application/json",
                **self.staff_headers(),
            )
            self.assertEqual(response.status_code, 200)
            self.assertEqual(response.json()["status"], next_status)

        response = self.client.post("/api/customer/bill/request/", **customer_headers)
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.json()["status"], Bill.STATUS_REQUESTED)

        response = self.client.post("/api/customer/payment/demo/", **customer_headers)
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.json()["status"], Bill.STATUS_PAID)

        response = self.client.post(f"/api/staff/tables/{self.table.id}/close/", **self.staff_headers())
        self.assertEqual(response.status_code, 200)
        response = self.client.get("/api/customer/menu/", **customer_headers)
        self.assertEqual(response.status_code, 400)

    def test_unavailable_checkout_creates_no_partial_order(self):
        customer_token = self.open_table_and_customer_token()
        self.item.state = MenuItem.STATE_UNAVAILABLE
        self.item.save(update_fields=["state"])
        response = self.client.post(
            "/api/customer/orders/",
            {"items": [{"menu_item_id": str(self.item.id), "quantity": 1}]},
            content_type="application/json",
            HTTP_X_CUSTOMER_TOKEN=customer_token,
        )
        self.assertEqual(response.status_code, 400)
        self.assertEqual(Order.objects.count(), 0)

    def test_staff_cannot_access_another_restaurant_table(self):
        response = self.client.post(
            f"/api/staff/tables/{self.table.id}/open/",
            **self.staff_headers(username="other"),
        )
        self.assertEqual(response.status_code, 404)
