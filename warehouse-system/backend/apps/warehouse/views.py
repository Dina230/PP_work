from rest_framework import viewsets
from django.db.models import Sum
from django.utils import timezone
from .models import Product, Category, Warehouse, Supplier, ProductBatch, StockMovement, WriteOff, Status
from .serializers import (
    ProductSerializer, CategorySerializer, WarehouseSerializer,
    SupplierSerializer, ProductBatchSerializer, StockMovementSerializer,
    WriteOffSerializer
)

class ProductViewSet(viewsets.ModelViewSet):
    queryset = Product.objects.all()
    serializer_class = ProductSerializer

    def get_queryset(self):
        # Аннотируем товары суммарным остатком по партиям
        return self.queryset.annotate(
            quantity=Sum('productbatch__remaining_quantity')
        )

class CategoryViewSet(viewsets.ModelViewSet):
    queryset = Category.objects.all()
    serializer_class = CategorySerializer

class WarehouseViewSet(viewsets.ModelViewSet):
    queryset = Warehouse.objects.all()
    serializer_class = WarehouseSerializer

class SupplierViewSet(viewsets.ModelViewSet):
    queryset = Supplier.objects.all()
    serializer_class = SupplierSerializer

class ProductBatchViewSet(viewsets.ModelViewSet):
    queryset = ProductBatch.objects.all()
    serializer_class = ProductBatchSerializer

    def perform_create(self, serializer):
        # Статус по умолчанию для новых партий
        status = Status.objects.filter(entity_type='batch').order_by('sort_order').first()
        if status is None:
            # Если статусов ещё нет в базе – создаём дефолтный
            status = Status.objects.create(
                name='Новая партия',
                code='batch_new',
                entity_type='batch',
                color='#1976d2',
                sort_order=0,
            )
        serializer.save(
            created_by=self.request.user,
            status=status,
        )

class StockMovementViewSet(viewsets.ModelViewSet):
    queryset = StockMovement.objects.all()
    serializer_class = StockMovementSerializer

    def perform_create(self, serializer):
        # Статус по умолчанию для движений
        status = Status.objects.filter(entity_type='movement').order_by('sort_order').first()
        if status is None:
            status = Status.objects.create(
                name='Новое движение',
                code='movement_new',
                entity_type='movement',
                color='#2e7d32',
                sort_order=0,
            )
        # Если дата документа не передана, ставим сегодняшнюю
        document_date = serializer.validated_data.get('document_date') or timezone.now().date()
        serializer.save(
            created_by=self.request.user,
            status=status,
            document_date=document_date,
        )

class WriteOffViewSet(viewsets.ModelViewSet):
    queryset = WriteOff.objects.all()
    serializer_class = WriteOffSerializer

    def perform_create(self, serializer):
        # Статус по умолчанию для списаний
        status = Status.objects.filter(entity_type='writeoff').order_by('sort_order').first()
        if status is None:
            status = Status.objects.create(
                name='Новое списание',
                code='writeoff_new',
                entity_type='writeoff',
                color='#d32f2f',
                sort_order=0,
            )
        document_date = serializer.validated_data.get('document_date') or timezone.now().date()
        serializer.save(
            created_by=self.request.user,
            status=status,
            document_date=document_date,
        )