from django.urls import path, include
from django.http import JsonResponse

def health(request):
    return JsonResponse({"status":"ok"})

urlpatterns = [
    path('health/', health),
    path('api/', include('orders.api_urls')),
]
