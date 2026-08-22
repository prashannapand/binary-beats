from django.test import TestCase
from orders.models import Order

class OrderTransitionTests(TestCase):
    def test_valid_transitions(self):
        o = Order(status=Order.STATUS_PENDING)
        self.assertTrue(o.can_transition(Order.STATUS_CONFIRMED))
        o.status = Order.STATUS_CONFIRMED
        self.assertTrue(o.can_transition(Order.STATUS_PREPARING))

    def test_invalid_transition(self):
        o = Order(status=Order.STATUS_READY)
        self.assertFalse(o.can_transition(Order.STATUS_CONFIRMED))
        with self.assertRaises(ValueError):
            o.set_status(Order.STATUS_CONFIRMED)
