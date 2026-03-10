from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response
from django.db import transaction
from django.shortcuts import get_object_or_404
from .models import Inventory, InventoryItem
from .serializers import InventorySerializer, InventoryItemSerializer
from apps.warehouse.models import ProductBatch, Product, Warehouse
from apps.warehouse.serializers import ProductBatchSerializer


class InventoryViewSet(viewsets.ModelViewSet):
    queryset = Inventory.objects.all()
    serializer_class = InventorySerializer

    def get_permissions(self):
        if self.action in ['create', 'update', 'partial_update', 'destroy']:
            permission_classes = [permissions.IsAdminUser]
        else:
            permission_classes = [permissions.IsAuthenticated]
        return [permission() for permission in permission_classes]

    def perform_create(self, serializer):
        serializer.save(created_by=self.request.user)

    @action(detail=True, methods=['post'])
    def start(self, request, pk=None):
        inventory = self.get_object()
        inventory.status_id = 2  # В процессе
        inventory.save()
        return Response({'status': 'inventory started'})

    @action(detail=True, methods=['post'])
    def complete(self, request, pk=None):
        inventory = self.get_object()
        inventory.status_id = 3  # Завершена
        inventory.end_date = timezone.now()
        inventory.conducted_by = request.user
        inventory.save()
        return Response({'status': 'inventory completed'})

    @action(detail=True, methods=['get'])
    def items(self, request, pk=None):
        inventory = self.get_object()
        items = inventory.items.all()
        serializer = InventoryItemSerializer(items, many=True)
        return Response(serializer.data)

    @action(detail=True, methods=['post'])
    def add_item(self, request, pk=None):
        inventory = self.get_object()
        serializer = InventoryItemSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save(inventory=inventory)
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class InventoryItemViewSet(viewsets.ModelViewSet):
    queryset = InventoryItem.objects.all()
    serializer_class = InventoryItemSerializer

    def get_permissions(self):
        permission_classes = [permissions.IsAuthenticated]
        return [permission() for permission in permission_classes]

    def perform_update(self, serializer):
        serializer.save()

    @action(detail=False, methods=['post'])
    def scan_batch(self, request):
        batch_number = request.data.get('batch_number')
        try:
            batch = ProductBatch.objects.get(batch_number=batch_number)
            serializer = ProductBatchSerializer(batch)
            return Response(serializer.data)
        except ProductBatch.DoesNotExist:
            return Response(
                {'error': 'Партия не найдена'},
                status=status.HTTP_404_NOT_FOUND
            )