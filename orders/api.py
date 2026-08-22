from django.db.models import Sum
from datetime import date
from decimal import Decimal
from asgiref.sync import async_to_sync
from channels.layers import get_channel_layer
from django.db import transaction
from django.shortcuts import get_object_or_404
from django.utils import timezone
from rest_framework import status
from rest_framework.exceptions import AuthenticationFailed, PermissionDenied, ValidationError
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework_simplejwt.authentication import JWTAuthentication
from rest_framework.views import APIView
from menu.models import Category, MenuItem
from sessions.models import CustomerSession
from tables.models import DiningSession, Table
from .models import Bill, Order, OrderItem, ServiceRequest


def money(value):
    return f"{Decimal(str(value)):.2f}"


def serialize_service_request(req):
    return {
        "id": str(req.id),
        "table_number": req.dining_session.table.number,
        "request_type": req.request_type,
        "custom_note": req.custom_note,
        "status": req.status,
        "created_at": req.created_at.isoformat(),
    }


def serialize_bill(bill):
    orders = (
        bill.dining_session.orders.exclude(status=Order.STATUS_REJECTED)
        .prefetch_related("items__menu_item")
        .order_by("created_at")
        if bill.dining_session_id
        else []
    )
    return {
        "id": str(bill.id),
        "status": bill.status,
        "subtotal": money(bill.subtotal),
        "discount": money(bill.discount),
        "additional_charges": money(bill.additional_charges),
        "service_charge": money(bill.service_charge),
        "vat_rate": str(bill.vat_rate),
        "tax": money(bill.tax),
        "total": money(bill.total),
        "requested_at": bill.requested_at.isoformat() if bill.requested_at else None,
        "paid_at": bill.paid_at.isoformat() if bill.paid_at else None,
        "table_number": bill.dining_session.table.number if bill.dining_session_id else "",
        "items": [
            {
                "id": str(item.id),
                "name": item.menu_item.name if item.menu_item else "Removed item",
                "quantity": item.quantity,
                "item_note": item.item_note,
                "unit_price": money(item.unit_price),
                "line_total": money(item.line_total),
                "is_rejected": item.is_rejected,
            }
            for order in orders
            for item in order.items.all()
        ],
    }


def emit(group, event, data):
    channel_layer = get_channel_layer()
    if channel_layer:
        async_to_sync(channel_layer.group_send)(
            group,
            {"type": "broadcast", "event": event, "data": data},
        )


def emit_session_event(dining_session, event, data):
    emit(f"restaurant_{dining_session.restaurant_id}", event, data)
    emit(f"session_{dining_session.id}", event, data)


def emit_menu_event(restaurant, event, data):
    emit(f"restaurant_{restaurant.id}", event, data)
    active_sessions = DiningSession.objects.filter(
        restaurant=restaurant,
        status=DiningSession.STATUS_ACTIVE,
    ).values_list("id", flat=True)
    for session_id in active_sessions:
        emit(f"session_{session_id}", event, data)


def active_customer_session(request):
    token = (
        request.headers.get("X-Customer-Token")
        or request.query_params.get("token")
        or request.data.get("customer_token")
    )
    if not token:
        raise AuthenticationFailed("A customer session token is required.")
    try:
        customer_session = CustomerSession.objects.select_related(
            "dining_session", "dining_session__restaurant", "dining_session__table"
        ).get(token=token)
    except CustomerSession.DoesNotExist as exc:
        raise AuthenticationFailed("Invalid customer session token.") from exc
    if not customer_session.is_active:
        raise ValidationError("This dining session has ended or expired.")
    return customer_session


# --- Table Assistant Endpoints ---

class CustomerTableAssistantView(APIView):
    permission_classes = [AllowAny]

    def get(self, request):
        customer_session = active_customer_session(request)
        requests = ServiceRequest.objects.filter(dining_session=customer_session.dining_session)
        return Response({"requests": [serialize_service_request(r) for r in requests]})

    def post(self, request):
        customer_session = active_customer_session(request)
        req_type = request.data.get("request_type", ServiceRequest.TYPE_WATER)
        custom_note = str(request.data.get("custom_note", ""))[:255]

        service_req = ServiceRequest.objects.create(
            restaurant=customer_session.dining_session.restaurant,
            dining_session=customer_session.dining_session,
            request_type=req_type,
            custom_note=custom_note,
        )
        payload = serialize_service_request(service_req)
        emit_session_event(customer_session.dining_session, "assistant.created", payload)
        return Response(payload, status=status.HTTP_201_CREATED)


class StaffTableAssistantView(APIView):
    authentication_classes = [JWTAuthentication]
    permission_classes = [IsAuthenticated]

    def get(self, request):
        restaurant = request.user.restaurant
        requests = ServiceRequest.objects.filter(
            restaurant=restaurant,
            status__in=[ServiceRequest.STATUS_PENDING, ServiceRequest.STATUS_ACKNOWLEDGED]
        )
        return Response({"requests": [serialize_service_request(r) for r in requests]})

    def patch(self, request, request_id):
        restaurant = request.user.restaurant
        service_req = get_object_or_404(ServiceRequest, id=request_id, restaurant=restaurant)
        new_status = request.data.get("status")
        if new_status in [ServiceRequest.STATUS_ACKNOWLEDGED, ServiceRequest.STATUS_FULFILLED]:
            service_req.status = new_status
            service_req.save(update_fields=["status", "updated_at"])
            payload = serialize_service_request(service_req)
            emit_session_event(service_req.dining_session, "assistant.updated", payload)
            return Response(payload)
        raise ValidationError("Invalid status transition.")


# --- Partial Order Item Handling ---

class StaffOrderItemRejectView(APIView):
    authentication_classes = [JWTAuthentication]
    permission_classes = [IsAuthenticated]

    def post(self, request, item_id):
        restaurant = request.user.restaurant
        item = get_object_or_404(OrderItem.objects.select_related("order__dining_session"), id=item_id, order__restaurant=restaurant)
        item.is_rejected = True
        item.rejection_note = request.data.get("reason", "Item unavailable.")
        item.save(update_fields=["is_rejected", "rejection_note"])

        # Update order & bill totals
        order = item.order
        order.subtotal = OrderItem.objects.filter(order=order, is_rejected=False).aggregate(val=Sum("line_total"))["val"] or Decimal("0.00")
        order.total = order.subtotal
        order.save(update_fields=["subtotal", "total", "updated_at"])

        if hasattr(order.dining_session, "bill"):
            order.dining_session.bill.refresh_totals()

        payload = {
            "order_id": str(order.id),
            "item_id": str(item.id),
            "item_name": item.menu_item.name if item.menu_item else "Item",
            "reason": item.rejection_note,
        }
        emit_session_event(order.dining_session, "order.item_rejected", payload)
        return Response(payload)
from rest_framework_simplejwt.views import TokenObtainPairView
from rest_framework_simplejwt.tokens import RefreshToken

# --- Customer Endpoints ---

class CustomerTableView(APIView):
    permission_classes = [AllowAny]
    def get(self, request, restaurant_slug, table_id):
        table = get_object_or_404(Table.objects.select_related("restaurant"), id=table_id, restaurant__slug=restaurant_slug)
        active_session = DiningSession.objects.filter(table=table, status=DiningSession.STATUS_ACTIVE).first()
        return Response({
            "table_number": table.number,
            "restaurant": {"id": table.restaurant.id, "name": table.restaurant.name},
            "can_start_session": active_session is not None
        })

class CustomerSessionCreateView(APIView):
    permission_classes = [AllowAny]
    def post(self, request):
        restaurant_slug = request.data.get("restaurant_slug")
        table_id = request.data.get("table_id")
        table = get_object_or_404(Table, id=table_id, restaurant__slug=restaurant_slug)
        active_session = DiningSession.objects.filter(table=table, status=DiningSession.STATUS_ACTIVE).first()
        if not active_session:
            raise ValidationError("This table does not have an active dining session.")
        customer_session = CustomerSession.objects.create(dining_session=active_session)
        return Response({"customer_token": str(customer_session.token)}, status=status.HTTP_201_CREATED)

def serialize_menu_item(item):
    return {
        "id": str(item.id),
        "name": item.name,
        "description": item.description,
        "price": money(item.unit_price),
        "state": item.state,
        "is_special": item.is_special_today,
    }

class CustomerMenuView(APIView):
    permission_classes = [AllowAny]
    def get(self, request):
        customer_session = active_customer_session(request)
        restaurant = customer_session.dining_session.restaurant
        categories = Category.objects.filter(restaurant=restaurant).prefetch_related("items")
        data = []
        for cat in categories:
            items = cat.items.filter(state__in=[MenuItem.STATE_AVAILABLE, MenuItem.STATE_UNAVAILABLE])
            if items.exists():
                data.append({
                    "id": str(cat.id),
                    "name": cat.name,
                    "items": [serialize_menu_item(i) for i in items]
                })
        return Response({"categories": data})

def serialize_order(order):
    return {
        "id": str(order.id),
        "status": order.status,
        "total": money(order.total),
        "created_at": order.created_at.isoformat(),
        "rejection_reason": order.rejection_reason,
        "items": [
            {
                "id": str(item.id),
                "name": item.menu_item.name if item.menu_item else "Item",
                "quantity": item.quantity,
                "item_note": item.item_note,
                "is_rejected": item.is_rejected,
                "rejection_note": item.rejection_note,
            }
            for item in order.items.all()
        ]
    }

class CustomerOrderListCreateView(APIView):
    permission_classes = [AllowAny]
    def get(self, request):
        customer_session = active_customer_session(request)
        orders = Order.objects.filter(dining_session=customer_session.dining_session).prefetch_related("items__menu_item").order_by("-created_at")
        return Response({"orders": [serialize_order(o) for o in orders]})
    
    @transaction.atomic
    def post(self, request):
        customer_session = active_customer_session(request)
        items_data = request.data.get("items", [])
        if not items_data:
            raise ValidationError("Order must contain items.")
        
        order = Order.objects.create(
            restaurant=customer_session.dining_session.restaurant,
            dining_session=customer_session.dining_session,
            customer_session=customer_session,
            order_level_note=request.data.get("order_note", "")[:500]
        )
        
        total = Decimal("0.00")
        for item_data in items_data:
            menu_item = get_object_or_404(MenuItem, id=item_data.get("menu_item_id"), restaurant=order.restaurant)
            if menu_item.state == MenuItem.STATE_HIDDEN or menu_item.state == MenuItem.STATE_UNAVAILABLE:
                raise ValidationError(f"{menu_item.name} is currently unavailable.")
            
            qty = int(item_data.get("quantity", 1))
            order_item = OrderItem.objects.create(
                order=order,
                menu_item=menu_item,
                quantity=qty,
                unit_price=menu_item.unit_price,
                item_note=item_data.get("item_note", "")[:255]
            )
            total += order_item.line_total
            
        order.subtotal = total
        order.total = total
        order.save()
        
        if hasattr(order.dining_session, "bill"):
            order.dining_session.bill.refresh_totals()
            
        payload = serialize_order(order)
        emit_session_event(order.dining_session, "order.created", payload)
        return Response(payload, status=status.HTTP_201_CREATED)

class CustomerOrderDetailView(APIView):
    permission_classes = [AllowAny]
    def get(self, request, order_id):
        customer_session = active_customer_session(request)
        order = get_object_or_404(Order, id=order_id, dining_session=customer_session.dining_session)
        return Response(serialize_order(order))

class CustomerBillRequestView(APIView):
    permission_classes = [AllowAny]
    def post(self, request):
        customer_session = active_customer_session(request)
        bill, _ = Bill.objects.get_or_create(
            restaurant=customer_session.dining_session.restaurant,
            dining_session=customer_session.dining_session
        )
        bill.request()
        payload = serialize_bill(bill)
        emit_session_event(customer_session.dining_session, "bill.requested", payload)
        return Response(payload)

class CustomerBillView(APIView):
    permission_classes = [AllowAny]
    def get(self, request):
        customer_session = active_customer_session(request)
        try:
            bill = customer_session.dining_session.bill
            bill.refresh_totals()
            return Response(serialize_bill(bill))
        except Bill.DoesNotExist:
            return Response({"status": Bill.STATUS_NOT_REQUESTED, "total": "0.00", "items": []})

class CustomerPaymentDemoView(APIView):
    permission_classes = [AllowAny]
    def post(self, request):
        customer_session = active_customer_session(request)
        bill = get_object_or_404(Bill, dining_session=customer_session.dining_session)
        if bill.status == Bill.STATUS_PAID:
            return Response(serialize_bill(bill))
        bill.mark_paid()
        payload = serialize_bill(bill)
        emit_session_event(customer_session.dining_session, "bill.paid", payload)
        return Response(payload)


# --- Staff Endpoints ---

from rest_framework_simplejwt.serializers import TokenObtainPairSerializer

class StaffLoginSerializer(TokenObtainPairSerializer):
    def validate(self, attrs):
        data = super().validate(attrs)
        data['staff'] = {
            'id': self.user.id,
            'username': self.user.username,
            'restaurant': {
                'id': self.user.restaurant.id if self.user.restaurant else None,
                'name': self.user.restaurant.name if self.user.restaurant else None,
            }
        }
        return data

class StaffLoginView(TokenObtainPairView):
    serializer_class = StaffLoginSerializer

class StaffDashboardView(APIView):
    authentication_classes = [JWTAuthentication]
    permission_classes = [IsAuthenticated]
    def get(self, request):
        restaurant = request.user.restaurant
        active_tables = DiningSession.objects.filter(restaurant=restaurant, status=DiningSession.STATUS_ACTIVE).count()
        pending_orders = Order.objects.filter(restaurant=restaurant, status=Order.STATUS_PENDING).count()
        preparing_orders = Order.objects.filter(restaurant=restaurant, status=Order.STATUS_PREPARING).count()
        bill_requests = Bill.objects.filter(restaurant=restaurant, status=Bill.STATUS_REQUESTED).count()
        
        from django.utils import timezone
        from django.db.models import Sum
        today = timezone.localdate()
        daily_revenue = Bill.objects.filter(
            restaurant=restaurant, 
            status=Bill.STATUS_PAID, 
            paid_at__date=today
        ).aggregate(val=Sum('total'))['val'] or 0

        return Response({
            "active_tables": active_tables,
            "pending_orders": pending_orders,
            "preparing_orders": preparing_orders,
            "bill_requests": bill_requests,
            "daily_revenue": str(daily_revenue)
        })

class StaffTablesView(APIView):
    authentication_classes = [JWTAuthentication]
    permission_classes = [IsAuthenticated]
    def get(self, request):
        restaurant = request.user.restaurant
        tables = Table.objects.filter(restaurant=restaurant).order_by('number')
        active_sessions = {s.table_id: s for s in DiningSession.objects.filter(restaurant=restaurant, status=DiningSession.STATUS_ACTIVE)}
        data = []
        for t in tables:
            sess = active_sessions.get(t.id)
            data.append({
                "id": str(t.id),
                "number": t.number,
                "status": "ACTIVE" if sess else "AVAILABLE",
                "session_id": str(sess.id) if sess else None,
                "dining_session_id": str(sess.id) if sess else None,
                "qr_path": f"/r/{restaurant.slug}/t/{t.id}"
            })
        return Response({"tables": data})

class StaffTableOpenView(APIView):
    authentication_classes = [JWTAuthentication]
    permission_classes = [IsAuthenticated]
    def post(self, request, table_id):
        restaurant = request.user.restaurant
        table = get_object_or_404(Table, id=table_id, restaurant=restaurant)
        session, created = DiningSession.objects.get_or_create(
            table=table, status=DiningSession.STATUS_ACTIVE,
            defaults={'restaurant': restaurant}
        )
        emit_session_event(session, "table.opened", {"table_id": str(table.id)})
        return Response({"status": "ACTIVE", "session_id": str(session.id)}, status=status.HTTP_201_CREATED if created else status.HTTP_200_OK)

class StaffTableCloseView(APIView):
    authentication_classes = [JWTAuthentication]
    permission_classes = [IsAuthenticated]
    def post(self, request, table_id):
        restaurant = request.user.restaurant
        session = get_object_or_404(DiningSession, table_id=table_id, restaurant=restaurant, status=DiningSession.STATUS_ACTIVE)
        session.status = DiningSession.STATUS_CLOSED
        session.closed_at = timezone.now()
        session.save()
        # Invalidate customer sessions
        CustomerSession.objects.filter(dining_session=session).update(expires_at=timezone.now())
        emit_session_event(session, "table.closed", {"table_id": str(table_id)})
        return Response({"status": "CLOSED"})

def serialize_staff_order(order):
    data = serialize_order(order)
    data["table_number"] = order.dining_session.table.number
    data["order_level_note"] = order.order_level_note
    return data

class StaffOrdersView(APIView):
    authentication_classes = [JWTAuthentication]
    permission_classes = [IsAuthenticated]
    def get(self, request):
        restaurant = request.user.restaurant
        orders = Order.objects.filter(restaurant=restaurant).exclude(
            status__in=[Order.STATUS_SERVED, Order.STATUS_REJECTED]
        ).select_related("dining_session__table").prefetch_related("items__menu_item").order_by("created_at")
        return Response({"orders": [serialize_staff_order(o) for o in orders]})

class StaffOrderStatusView(APIView):
    authentication_classes = [JWTAuthentication]
    permission_classes = [IsAuthenticated]
    def post(self, request, order_id):
        restaurant = request.user.restaurant
        order = get_object_or_404(Order, id=order_id, restaurant=restaurant)
        new_status = request.data.get("status")
        try:
            order.set_status(new_status, request.data.get("reason", ""))
        except ValueError as e:
            raise ValidationError(str(e))
        payload = serialize_staff_order(order)
        emit_session_event(order.dining_session, "order.updated", payload)
        return Response(payload)

class StaffCategoriesView(APIView):
    authentication_classes = [JWTAuthentication]
    permission_classes = [IsAuthenticated]
    def get(self, request):
        restaurant = request.user.restaurant
        categories = Category.objects.filter(restaurant=restaurant)
        return Response({"categories": [{"id": str(c.id), "name": c.name} for c in categories]})
    def post(self, request):
        restaurant = request.user.restaurant
        cat = Category.objects.create(restaurant=restaurant, name=request.data.get("name"))
        emit_menu_event(restaurant, "menu.updated", {})
        return Response({"id": str(cat.id), "name": cat.name}, status=status.HTTP_201_CREATED)

class StaffCategoryDetailView(APIView):
    authentication_classes = [JWTAuthentication]
    permission_classes = [IsAuthenticated]
    def put(self, request, category_id):
        cat = get_object_or_404(Category, id=category_id, restaurant=request.user.restaurant)
        cat.name = request.data.get("name")
        cat.save()
        emit_menu_event(request.user.restaurant, "menu.updated", {})
        return Response({"id": str(cat.id), "name": cat.name})
    def delete(self, request, category_id):
        cat = get_object_or_404(Category, id=category_id, restaurant=request.user.restaurant)
        cat.delete()
        emit_menu_event(request.user.restaurant, "menu.updated", {})
        return Response(status=status.HTTP_204_NO_CONTENT)

def serialize_staff_menu_item(item):
    data = serialize_menu_item(item)
    data["category_id"] = str(item.category.id) if item.category else None
    return data

class StaffMenuView(APIView):
    authentication_classes = [JWTAuthentication]
    permission_classes = [IsAuthenticated]
    def get(self, request):
        restaurant = request.user.restaurant
        items = MenuItem.objects.filter(restaurant=restaurant)
        return Response({"items": [serialize_staff_menu_item(i) for i in items]})
    def post(self, request):
        restaurant = request.user.restaurant
        cat = get_object_or_404(Category, id=request.data.get("category_id"), restaurant=restaurant)
        item = MenuItem.objects.create(
            restaurant=restaurant,
            category=cat,
            name=request.data.get("name"),
            description=request.data.get("description", ""),
            unit_price=Decimal(request.data.get("price", "0.00")),
            state=request.data.get("state", MenuItem.STATE_AVAILABLE)
        )
        emit_menu_event(restaurant, "menu.updated", {})
        return Response(serialize_staff_menu_item(item), status=status.HTTP_201_CREATED)

class StaffMenuDetailView(APIView):
    authentication_classes = [JWTAuthentication]
    permission_classes = [IsAuthenticated]
    def put(self, request, item_id):
        item = get_object_or_404(MenuItem, id=item_id, restaurant=request.user.restaurant)
        item.name = request.data.get("name", item.name)
        item.description = request.data.get("description", item.description)
        item.unit_price = Decimal(request.data.get("price", item.unit_price))
        item.state = request.data.get("state", item.state)
        item.save()
        emit_menu_event(request.user.restaurant, "menu.updated", {})
        return Response(serialize_staff_menu_item(item))
    def delete(self, request, item_id):
        item = get_object_or_404(MenuItem, id=item_id, restaurant=request.user.restaurant)
        item.state = MenuItem.STATE_HIDDEN
        item.save()
        emit_menu_event(request.user.restaurant, "menu.updated", {})
        return Response(status=status.HTTP_204_NO_CONTENT)

class StaffMenuAvailabilityView(APIView):
    authentication_classes = [JWTAuthentication]
    permission_classes = [IsAuthenticated]
    def patch(self, request, item_id):
        item = get_object_or_404(MenuItem, id=item_id, restaurant=request.user.restaurant)
        item.state = request.data.get("state", item.state)
        item.save()
        emit_menu_event(request.user.restaurant, "menu.item_updated", serialize_menu_item(item))
        return Response(serialize_staff_menu_item(item))

class StaffMenuSpecialView(APIView):
    authentication_classes = [JWTAuthentication]
    permission_classes = [IsAuthenticated]
    def patch(self, request, item_id):
        item = get_object_or_404(MenuItem, id=item_id, restaurant=request.user.restaurant)
        item.is_special_today = request.data.get("is_special", False)
        if item.is_special_today:
            item.special_start = date.today()
        item.save()
        emit_menu_event(request.user.restaurant, "menu.item_updated", serialize_menu_item(item))
        return Response(serialize_staff_menu_item(item))

class StaffBillsView(APIView):
    authentication_classes = [JWTAuthentication]
    permission_classes = [IsAuthenticated]
    def get(self, request):
        from django.utils import timezone
        today = timezone.localdate()
        from django.db.models import Q
        bills = Bill.objects.filter(
            Q(status__in=[Bill.STATUS_REQUESTED, Bill.STATUS_NOT_REQUESTED], dining_session__status=DiningSession.STATUS_ACTIVE) | 
            Q(status=Bill.STATUS_PAID, paid_at__date=today),
            restaurant=request.user.restaurant
        ).select_related("dining_session__table")
        for b in bills:
            b.refresh_totals()
        return Response({"bills": [serialize_bill(b) for b in bills if b.total > 0]})

class StaffBillPaidView(APIView):
    authentication_classes = [JWTAuthentication]
    permission_classes = [IsAuthenticated]
    def post(self, request, bill_id):
        bill = get_object_or_404(Bill, id=bill_id, restaurant=request.user.restaurant)
        bill.mark_paid()
        payload = serialize_bill(bill)
        emit_session_event(bill.dining_session, "bill.paid", payload)
        return Response(payload)

class StaffBillSendView(APIView):
    authentication_classes = [JWTAuthentication]
    permission_classes = [IsAuthenticated]
    def post(self, request, bill_id):
        bill = get_object_or_404(Bill, id=bill_id, restaurant=request.user.restaurant)
        bill.request()  # This changes status to REQUESTED
        payload = serialize_bill(bill)
        emit_session_event(bill.dining_session, "bill.updated", payload)
        return Response(payload)

