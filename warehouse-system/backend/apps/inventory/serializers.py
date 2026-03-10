from rest_framework import serializers
from .models import Inventory, InventoryItem
from apps.warehouse.models import Product, ProductBatch


class InventoryItemSerializer(serializers.ModelSerializer):
    product_name = serializers.CharField(source='product.name', read_only=True)
    product_sku = serializers.CharField(source='product.sku', read_only=True)
    batch_number = serializers.CharField(source='batch.batch_number', read_only=True)

    class Meta:
        model = InventoryItem
        fields = ['id', 'inventory', 'product', 'product_name', 'product_sku',
                  'batch', 'batch_number', 'expected_quantity', 'actual_quantity',
                  'difference', 'notes']


class InventorySerializer(serializers.ModelSerializer):
    warehouse_name = serializers.CharField(source='warehouse.name', read_only=True)
    status_name = serializers.CharField(source='status.name', read_only=True)
    created_by_name = serializers.CharField(source='created_by.username', read_only=True)
    conducted_by_name = serializers.CharField(source='conducted_by.username', read_only=True)
    items = InventoryItemSerializer(many=True, read_only=True)

    class Meta:
        model = Inventory
        fields = ['id', 'warehouse', 'warehouse_name', 'inventory_number',
                  'start_date', 'end_date', 'status', 'status_name',
                  'created_by', 'created_by_name', 'conducted_by', 'conducted_by_name',
                  'notes', 'created_at', 'items']