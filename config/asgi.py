import os
from django.core.asgi import get_asgi_application
from channels.routing import ProtocolTypeRouter, URLRouter
from channels.auth import AuthMiddlewareStack

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django_asgi_app = get_asgi_application()

# Lazy import to avoid AppRegistryNotReady
def get_websocket_application():
    import notifications.routing
    return AuthMiddlewareStack(
        URLRouter(
            notifications.routing.websocket_urlpatterns
        )
    )

application = ProtocolTypeRouter({
    "http": django_asgi_app,
    "websocket": get_websocket_application(),
})
