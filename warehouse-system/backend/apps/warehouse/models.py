from django.db import models
from apps.accounts.models import User


class Status(models.Model):
    name = models.CharField(max_length=50)
    code = models.CharField(max_length=50, unique=True)
    entity_type = models.CharField(max_length=50)
    color = models.CharField(max_length=7, default='#000000')
    sort_order = models.IntegerField(default=0)

    class Meta:
        ordering = ['sort_order']

    def __str__(self):
        return self.name


class Category(models.Model):
    name = models.CharField(max_length=100)
    parent = models.ForeignKey('self', on_delete=models.CASCADE, null=True, blank=True)
    description = models.TextField(blank=True)
    is_active = models.BooleanField(default=True)

    class Meta:
        verbose_name_plural = 'Categories'

    def __str__(self):
        return self.name


class Warehouse(models.Model):
    name = models.CharField(max_length=100)
    code = models.CharField(max_length=20, unique=True)
    address = models.TextField()
    manager = models.ForeignKey(User, on_delete=models.SET_NULL, null=True)
    phone = models.CharField(max_length=20, blank=True)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.name


class Supplier(models.Model):
    name = models.CharField(max_length=200)
    inn = models.CharField(max_length=12, unique=True)
    contact_person = models.CharField(max_length=100)
    phone = models.CharField(max_length=20)
    email = models.EmailField()
    address = models.TextField()
    is_active = models.BooleanField(default=True)

    def __str__(self):
        return self.name


class Product(models.Model):
    name = models.CharField(max_length=200)
    sku = models.CharField(max_length=50, unique=True)
    barcode = models.CharField(max_length=50, blank=True)
    category = models.ForeignKey(Category, on_delete=models.PROTECT)
    description = models.TextField(blank=True)
    unit = models.CharField(max_length=20)
    min_stock = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    max_stock = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.name


class ProductBatch(models.Model):
    product = models.ForeignKey(Product, on_delete=models.PROTECT)
    batch_number = models.CharField(max_length=50)
    supplier = models.ForeignKey(Supplier, on_delete=models.PROTECT)
    warehouse = models.ForeignKey(Warehouse, on_delete=models.PROTECT)
    quantity = models.DecimalField(max_digits=10, decimal_places=2)
    remaining_quantity = models.DecimalField(max_digits=10, decimal_places=2)
    purchase_price = models.DecimalField(max_digits=10, decimal_places=2)
    selling_price = models.DecimalField(max_digits=10, decimal_places=2)
    production_date = models.DateField()
    expiration_date = models.DateField()
    status = models.ForeignKey(Status, on_delete=models.PROTECT)
    created_at = models.DateTimeField(auto_now_add=True)
    created_by = models.ForeignKey(User, on_delete=models.PROTECT)

    class Meta:
        unique_together = ['product', 'batch_number']

    def __str__(self):
        return f"{self.product.name} - {self.batch_number}"


class StockMovement(models.Model):
    MOVEMENT_TYPES = [
        ('receipt', 'Поступление'),
        ('shipment', 'Отгрузка'),
        ('transfer', 'Перемещение'),
        ('return', 'Возврат'),
    ]

    movement_type = models.CharField(max_length=20, choices=MOVEMENT_TYPES)
    batch = models.ForeignKey(ProductBatch, on_delete=models.PROTECT)
    from_warehouse = models.ForeignKey(Warehouse, on_delete=models.PROTECT, related_name='movements_from', null=True)
    to_warehouse = models.ForeignKey(Warehouse, on_delete=models.PROTECT, related_name='movements_to', null=True)
    quantity = models.DecimalField(max_digits=10, decimal_places=2)
    document_number = models.CharField(max_length=50)
    document_date = models.DateField()
    status = models.ForeignKey(Status, on_delete=models.PROTECT)
    notes = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    created_by = models.ForeignKey(User, on_delete=models.PROTECT)

    def __str__(self):
        return f"{self.get_movement_type_display()} - {self.document_number}"


class WriteOff(models.Model):
    batch = models.ForeignKey(ProductBatch, on_delete=models.PROTECT)
    quantity = models.DecimalField(max_digits=10, decimal_places=2)
    reason = models.TextField()
    document_number = models.CharField(max_length=50)
    document_date = models.DateField()
    status = models.ForeignKey(Status, on_delete=models.PROTECT)
    approved_by = models.ForeignKey(User, on_delete=models.PROTECT, related_name='approved_writeoffs', null=True)
    approved_at = models.DateTimeField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    created_by = models.ForeignKey(User, on_delete=models.PROTECT, related_name='created_writeoffs')

    def __str__(self):
        return f"WriteOff {self.document_number}"