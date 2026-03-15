from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.views import APIView
from django.utils import timezone
from django.db import models
from django.db.models import Count, Sum
from datetime import timedelta

from .models import AuditLog, Notification
from .serializers import AuditLogSerializer, NotificationSerializer
from apps.warehouse.models import (
    Product,
    ProductBatch,
    StockMovement,
    Category,
    Warehouse,
)
from apps.inventory.models import Inventory


class AuditLogViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = AuditLog.objects.all()
    serializer_class = AuditLogSerializer
    permission_classes = [permissions.IsAdminUser]

    def get_queryset(self):
        return super().get_queryset().select_related('user', 'content_type')


class NotificationViewSet(viewsets.ModelViewSet):
    serializer_class = NotificationSerializer
    permission_classes = [permissions.IsAuthenticated]
    queryset = Notification.objects.all()

    def get_queryset(self):
        return Notification.objects.filter(user=self.request.user)

    @action(detail=True, methods=['post'])
    def mark_as_read(self, request, pk=None):
        notification = self.get_object()
        notification.is_read = True
        notification.save()
        return Response({'status': 'marked as read'})

    @action(detail=False, methods=['post'])
    def mark_all_as_read(self, request):
        self.get_queryset().update(is_read=True)
        return Response({'status': 'all marked as read'})


class DashboardStatsView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        today = timezone.now().date()
        week_ago = today - timedelta(days=7)

        total_products = Product.objects.count()

        # Товары с низким остатком: суммарный остаток партий < min_stock
        low_stock = (
            Product.objects.annotate(
                total_remaining=Sum('productbatch__remaining_quantity')
            )
            .filter(total_remaining__lt=models.F('min_stock'))
            .count()
        )

        # Партии, срок годности у которых истекает в ближайшие 7 дней
        expiring_soon = ProductBatch.objects.filter(
            expiration_date__range=(today, today + timedelta(days=7))
        ).count()

        today_movements = StockMovement.objects.filter(
            document_date=today
        ).count()

        active_warehouses = Warehouse.objects.filter(is_active=True).count()

        active_inventories = Inventory.objects.filter(
            end_date__isnull=True
        ).count()

        data = {
            'total_products': total_products,
            'low_stock': low_stock,
            'expiring_soon': expiring_soon,
            'today_movements': today_movements,
            'active_warehouses': active_warehouses,
            'active_inventories': active_inventories,
        }

        return Response(data, status=status.HTTP_200_OK)


class DashboardMovementsView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        today = timezone.now().date()
        week_ago = today - timedelta(days=6)
        movements = StockMovement.objects.filter(document_date__range=(week_ago, today))

        # Готовим словарь с днями за последнюю неделю
        data_by_date = {}
        for i in range(7):
            day = week_ago + timedelta(days=i)
            key = day.strftime('%Y-%m-%d')
            data_by_date[key] = {'date': key, 'receipt': 0, 'shipment': 0}

        # Агрегация в Python, чтобы избежать странностей SQLite/TruncDate
        for m in movements:
            key = m.document_date.strftime('%Y-%m-%d')
            if key not in data_by_date:
                data_by_date[key] = {'date': key, 'receipt': 0, 'shipment': 0}
            if m.movement_type == 'receipt':
                data_by_date[key]['receipt'] += float(m.quantity)
            elif m.movement_type == 'shipment':
                data_by_date[key]['shipment'] += float(m.quantity)

        data = list(data_by_date.values())
        return Response(data, status=status.HTTP_200_OK)


class DashboardCategoriesView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        qs = (
            Category.objects.annotate(product_count=Count('product'))
            .filter(product_count__gt=0)
            .order_by('-product_count')
        )

        data = [
            {'name': c.name, 'value': c.product_count}
            for c in qs
        ]

        return Response(data, status=status.HTTP_200_OK)