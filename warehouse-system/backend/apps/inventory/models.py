from django.db import models
from apps.warehouse.models import Warehouse, Product, ProductBatch
from apps.accounts.models import User
from django.utils import timezone


class Inventory(models.Model):
    warehouse = models.ForeignKey(Warehouse, on_delete=models.PROTECT)
    inventory_number = models.CharField(max_length=50, unique=True)
    start_date = models.DateTimeField(default=timezone.now)
    end_date = models.DateTimeField(null=True, blank=True)
    status = models.ForeignKey('warehouse.Status', on_delete=models.PROTECT, null=True)
    created_by = models.ForeignKey(User, on_delete=models.PROTECT, related_name='created_inventories')
    conducted_by = models.ForeignKey(User, on_delete=models.PROTECT, related_name='conducted_inventories', null=True)
    notes = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Inventory {self.inventory_number}"

    class Meta:
        verbose_name_plural = "Inventories"


class InventoryItem(models.Model):
    inventory = models.ForeignKey(Inventory, on_delete=models.CASCADE, related_name='items')
    product = models.ForeignKey(Product, on_delete=models.PROTECT)
    batch = models.ForeignKey(ProductBatch, on_delete=models.PROTECT, null=True, blank=True)
    expected_quantity = models.DecimalField(max_digits=10, decimal_places=2)
    actual_quantity = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
    difference = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
    notes = models.TextField(blank=True)

    def save(self, *args, **kwargs):
        if self.actual_quantity is not None:
            self.difference = self.actual_quantity - self.expected_quantity
        super().save(*args, **kwargs)

    def __str__(self):
        return f"{self.product.name} in {self.inventory.inventory_number}"