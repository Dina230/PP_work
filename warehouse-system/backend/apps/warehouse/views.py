from rest_framework import viewsets
from .models import Product, Category, Warehouse, Supplier, ProductBatch, StockMovement, WriteOff
from .serializers import (
    ProductSerializer, CategorySerializer, WarehouseSerializer,
    SupplierSerializer, ProductBatchSerializer, StockMovementSerializer,
    WriteOffSerializer
)

class ProductViewSet(viewsets.ModelViewSet):
    queryset = Product.objects.all()
    serializer_class = ProductSerializer

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

class StockMovementViewSet(viewsets.ModelViewSet):
    queryset = StockMovement.objects.all()
    serializer_class = StockMovementSerializer

class WriteOffViewSet(viewsets.ModelViewSet):
    queryset = WriteOff.objects.all()
    serializer_class = WriteOffSerializer