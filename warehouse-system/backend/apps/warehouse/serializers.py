from rest_framework import serializers
from .models import Product, Category, Warehouse, Supplier, ProductBatch, StockMovement, WriteOff
from apps.accounts.models import User


class CategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = Category
        fields = ['id', 'name', 'parent', 'description', 'is_active']


class WarehouseSerializer(serializers.ModelSerializer):
    manager_name = serializers.CharField(source='manager.username', read_only=True)

    class Meta:
        model = Warehouse
        fields = ['id', 'name', 'code', 'address', 'manager', 'manager_name',
                  'phone', 'is_active', 'created_at']


class SupplierSerializer(serializers.ModelSerializer):
    # Делаем необязательные поля по умолчанию пустыми строками,
    # чтобы не падать при их отсутствии в запросе
    contact_person = serializers.CharField(
        required=False, allow_blank=True, default=''
    )
    phone = serializers.CharField(
        required=False, allow_blank=True, default=''
    )
    email = serializers.EmailField(
        required=False, allow_blank=True, default=''
    )
    address = serializers.CharField(
        required=False, allow_blank=True, default=''
    )

    class Meta:
        model = Supplier
        fields = ['id', 'name', 'inn', 'contact_person', 'phone', 'email',
                  'address', 'is_active']


class ProductSerializer(serializers.ModelSerializer):
    category_name = serializers.CharField(source='category.name', read_only=True)
    quantity = serializers.DecimalField(
        max_digits=10,
        decimal_places=2,
        read_only=True,
        help_text='Суммарный остаток по всем партиям товара',
    )

    class Meta:
        model = Product
        fields = ['id', 'name', 'sku', 'barcode', 'category', 'category_name',
                  'description', 'unit', 'min_stock', 'max_stock', 'is_active',
                  'created_at', 'updated_at', 'quantity']


class ProductBatchSerializer(serializers.ModelSerializer):
    product_name = serializers.CharField(source='product.name', read_only=True)
    product_sku = serializers.CharField(source='product.sku', read_only=True)
    warehouse_name = serializers.CharField(source='warehouse.name', read_only=True)
    supplier_name = serializers.CharField(source='supplier.name', read_only=True)
    status_name = serializers.CharField(source='status.name', read_only=True)
    created_by_name = serializers.CharField(source='created_by.username', read_only=True)

    class Meta:
        model = ProductBatch
        fields = ['id', 'product', 'product_name', 'product_sku', 'batch_number',
                  'supplier', 'supplier_name', 'warehouse', 'warehouse_name',
                  'quantity', 'remaining_quantity', 'purchase_price', 'selling_price',
                  'production_date', 'expiration_date', 'status', 'status_name',
                  'created_at', 'created_by', 'created_by_name']
        extra_kwargs = {
            'status': {'read_only': True},
            'created_by': {'read_only': True},
            'remaining_quantity': {'required': False},
        }


class StockMovementSerializer(serializers.ModelSerializer):
    batch_number = serializers.CharField(source='batch.batch_number', read_only=True)
    product_name = serializers.CharField(source='batch.product.name', read_only=True)
    from_warehouse_name = serializers.CharField(source='from_warehouse.name', read_only=True)
    to_warehouse_name = serializers.CharField(source='to_warehouse.name', read_only=True)
    status_name = serializers.CharField(source='status.name', read_only=True)
    created_by_name = serializers.CharField(source='created_by.username', read_only=True)

    class Meta:
        model = StockMovement
        fields = ['id', 'movement_type', 'batch', 'batch_number', 'product_name',
                  'from_warehouse', 'from_warehouse_name', 'to_warehouse', 'to_warehouse_name',
                  'quantity', 'document_number', 'document_date', 'status', 'status_name',
                  'notes', 'created_at', 'created_by', 'created_by_name']
        extra_kwargs = {
            'status': {'read_only': True},
            'created_by': {'read_only': True},
            'document_date': {'required': False},
        }


class WriteOffSerializer(serializers.ModelSerializer):
    batch_number = serializers.CharField(source='batch.batch_number', read_only=True)
    product_name = serializers.CharField(source='batch.product.name', read_only=True)
    status_name = serializers.CharField(source='status.name', read_only=True)
    created_by_name = serializers.CharField(source='created_by.username', read_only=True)
    approved_by_name = serializers.CharField(source='approved_by.username', read_only=True)

    class Meta:
        model = WriteOff
        fields = ['id', 'batch', 'batch_number', 'product_name', 'quantity', 'reason',
                  'document_number', 'document_date', 'status', 'status_name',
                  'approved_by', 'approved_by_name', 'approved_at', 'created_at',
                  'created_by', 'created_by_name']
        extra_kwargs = {
            'status': {'read_only': True},
            'created_by': {'read_only': True},
            'approved_by': {'read_only': True},
            'approved_at': {'read_only': True},
            'document_date': {'required': False},
        }