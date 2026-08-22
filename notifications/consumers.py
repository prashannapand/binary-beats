from urllib.parse import parse_qs

from channels.db import database_sync_to_async
from channels.generic.websocket import AsyncJsonWebsocketConsumer
from rest_framework_simplejwt.authentication import JWTAuthentication

from sessions.models import CustomerSession


class EventConsumer(AsyncJsonWebsocketConsumer):
    async def broadcast(self, event):
        await self.send_json({"event": event.get("event"), "data": event.get("data")})


class CustomerSessionConsumer(EventConsumer):
    async def connect(self):
        token = self.scope["url_route"]["kwargs"]["customer_token"]
        session_id = await self.valid_session_id(token)
        if session_id is None:
            await self.close(code=4401)
            return
        self.group_name = f"session_{session_id}"
        await self.channel_layer.group_add(self.group_name, self.channel_name)
        await self.accept()

    async def disconnect(self, close_code):
        if hasattr(self, "group_name"):
            await self.channel_layer.group_discard(self.group_name, self.channel_name)

    @database_sync_to_async
    def valid_session_id(self, token):
        try:
            customer_session = CustomerSession.objects.select_related("dining_session").get(token=token)
        except CustomerSession.DoesNotExist:
            return None
        return str(customer_session.dining_session_id) if customer_session.is_active else None


class StaffRestaurantConsumer(EventConsumer):
    async def connect(self):
        restaurant_id = self.scope["url_route"]["kwargs"]["restaurant_id"]
        query = parse_qs(self.scope["query_string"].decode())
        token = query.get("token", [""])[0]
        if not await self.is_authorized(token, restaurant_id):
            await self.close(code=4403)
            return
        self.group_name = f"restaurant_{restaurant_id}"
        await self.channel_layer.group_add(self.group_name, self.channel_name)
        await self.accept()

    async def disconnect(self, close_code):
        if hasattr(self, "group_name"):
            await self.channel_layer.group_discard(self.group_name, self.channel_name)

    @database_sync_to_async
    def is_authorized(self, token, restaurant_id):
        try:
            authentication = JWTAuthentication()
            validated_token = authentication.get_validated_token(token)
            user = authentication.get_user(validated_token)
        except Exception:
            return False
        return user.is_active and str(user.restaurant_id) == str(restaurant_id)
