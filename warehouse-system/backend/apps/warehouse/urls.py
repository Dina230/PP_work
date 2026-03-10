from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    ProductViewSet, CategoryViewSet, WarehouseViewSet,
    SupplierViewSet, ProductBatchViewSet, StockMovementViewSet,
    WriteOffViewSet
)

router = DefaultRouter()
router.register('products', ProductViewSet)
router.register('categories', CategoryViewSet)
router.register('warehouses', WarehouseViewSet)
router.register('suppliers', SupplierViewSet)
router.register('batches', ProductBatchViewSet)
router.register('movements', StockMovementViewSet)
router.register('writeoffs', WriteOffViewSet)

urlpatterns = [
    path('', include(router.urls)),
]