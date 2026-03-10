from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import InventoryViewSet, InventoryItemViewSet

router = DefaultRouter()
router.register('inventories', InventoryViewSet)
router.register('inventory-items', InventoryItemViewSet)

urlpatterns = [
    path('', include(router.urls)),
]