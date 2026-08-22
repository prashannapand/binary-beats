from django.test import TestCase
from restaurants.models import Restaurant
from tables.models import Table, DiningSession
from sessions.models import CustomerSession
from menu.models import Category, MenuItem
from accounts.models import StaffUser
from decimal import Decimal
import uuid

class OrderCreationTests(TestCase):
    def setUp(self):
        self.restaurant = Restaurant.objects.create(name="Test R", slug="test-r")
        self.table = Table.objects.create(restaurant=self.restaurant, number="1")
        self.staff = StaffUser.objects.create(username="s", restaurant=self.restaurant)
        self.staff.set_password("x")
        self.staff.save()
        self.dining = DiningSession.objects.create(table=self.table, restaurant=self.restaurant, opened_by=self.staff)
        self.customer_session = CustomerSession.objects.create(dining_session=self.dining, token=str(uuid.uuid4()))
        self.cat = Category.objects.create(restaurant=self.restaurant, name="Mains")
        self.item = MenuItem.objects.create(restaurant=self.restaurant, category=self.cat, name="Pizza", unit_price=Decimal("300.00"))
        self.url = "/api/customer/orders/"

    def test_create_order_success(self):
        payload = {"items": [{"menu_item_id": str(self.item.id), "quantity": 2}]}
        resp = self.client.post(self.url, payload, content_type='application/json', HTTP_X_CUSTOMER_TOKEN=self.customer_session.token)
        self.assertEqual(resp.status_code, 201)
        data = resp.json()
        self.assertIn("id", data)
        self.assertEqual(data["status"], "PENDING")
        self.assertEqual(data["total"], "600.00")

    def test_create_order_item_unavailable(self):
        self.item.state = MenuItem.STATE_UNAVAILABLE
        self.item.save()
        payload = {"items": [{"menu_item_id": str(self.item.id), "quantity": 1}]}
        resp = self.client.post(self.url, payload, content_type='application/json', HTTP_X_CUSTOMER_TOKEN=self.customer_session.token)
        self.assertEqual(resp.status_code, 400)
