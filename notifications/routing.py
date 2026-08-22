from django.urls import re_path

from .consumers import CustomerSessionConsumer, StaffRestaurantConsumer


websocket_urlpatterns = [
    re_path(r"ws/customer/(?P<customer_token>[^/]+)/$", CustomerSessionConsumer.as_asgi()),
    re_path(r"ws/staff/(?P<restaurant_id>[0-9a-f-]+)/$", StaffRestaurantConsumer.as_asgi()),
]
