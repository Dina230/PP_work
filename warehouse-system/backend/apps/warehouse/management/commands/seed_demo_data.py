from decimal import Decimal
from datetime import date, timedelta

from django.core.management import call_command
from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model
from django.db import transaction
from django.utils import timezone

from apps.accounts.models import Role
from apps.warehouse.models import (
    Status,
    Category,
    Warehouse,
    Supplier,
    Product,
    ProductBatch,
    StockMovement,
    WriteOff,
)
from apps.inventory.models import Inventory, InventoryItem
from apps.core.models import Notification

User = get_user_model()


def _ensure_status(code, name, entity_type, sort_order=0, color='#1976d2'):
    obj, created = Status.objects.get_or_create(
        code=code,
        defaults={
            'name': name,
            'entity_type': entity_type,
            'color': color,
            'sort_order': sort_order,
        },
    )
    return obj, created


class Command(BaseCommand):
    help = 'Заполняет БД демо-данными: роли, пользователи, склады, товары, партии, движения'

    def add_arguments(self, parser):
        parser.add_argument(
            '--reset',
            action='store_true',
            help='Очистить складские данные перед заполнением (осторожно)',
        )

    @transaction.atomic
    def handle(self, *args, **options):
        call_command('seed_roles_users')

        admin_user = User.objects.filter(username='admin').first()
        manager_user = User.objects.filter(username='manager').first()
        actor = admin_user or User.objects.filter(is_superuser=True).first() or User.objects.first()
        if not actor:
            self.stderr.write(self.style.ERROR('Нет пользователя admin — создайте вручную'))
            return

        if options['reset']:
            InventoryItem.objects.all().delete()
            Inventory.objects.all().delete()
            WriteOff.objects.all().delete()
            StockMovement.objects.all().delete()
            ProductBatch.objects.all().delete()
            Product.objects.all().delete()
            Supplier.objects.all().delete()
            Warehouse.objects.all().delete()
            Category.objects.all().delete()
            self.stdout.write(self.style.WARNING('Складские таблицы очищены'))

        # Статусы (code уникален глобально)
        status_specs = [
            ('pending', 'Ожидает', 'generic', 0, '#9e9e9e'),
            ('in_progress', 'В процессе', 'generic', 1, '#ed6c02'),
            ('completed', 'Завершено', 'generic', 2, '#2e7d32'),
            ('approved', 'Утверждено', 'generic', 3, '#2e7d32'),
            ('rejected', 'Отклонено', 'generic', 4, '#d32f2f'),
            ('batch_new', 'Новая партия', 'batch', 0, '#1976d2'),
            ('batch_active', 'Активна', 'batch', 1, '#2e7d32'),
            ('movement_new', 'Новое движение', 'movement', 0, '#2e7d32'),
            ('movement_done', 'Проведено', 'movement', 1, '#1565c0'),
            ('writeoff_new', 'Списание (новое)', 'writeoff', 0, '#ed6c02'),
            ('inventory_new', 'Инвентаризация (новая)', 'inventory', 0, '#0288d1'),
        ]
        status_by_code = {}
        for code, name, et, so, col in status_specs:
            st, cr = _ensure_status(code, name, et, so, col)
            status_by_code[code] = st
            if cr:
                self.stdout.write(f'  статус: {code}')

        # Категории
        cat_food, _ = Category.objects.get_or_create(
            name='Продукты питания',
            defaults={'description': 'Сухие и охлаждённые', 'is_active': True},
        )
        cat_tools, _ = Category.objects.get_or_create(
            name='Инструмент',
            defaults={'description': 'Ручной инструмент', 'is_active': True},
        )

        # Склады
        wh1, _ = Warehouse.objects.get_or_create(
            code='WH-MSK',
            defaults={
                'name': 'Склад Москва',
                'address': 'г. Москва, ул. Складская, 1',
                'manager': manager_user or actor,
                'phone': '+74951234567',
                'is_active': True,
            },
        )
        wh2, _ = Warehouse.objects.get_or_create(
            code='WH-SPB',
            defaults={
                'name': 'Склад СПб',
                'address': 'г. Санкт-Петербург, пр. Индустриальный, 10',
                'manager': manager_user or actor,
                'phone': '+78125554433',
                'is_active': True,
            },
        )

        # Поставщики
        sup1, _ = Supplier.objects.get_or_create(
            inn='770123456789',
            defaults={
                'name': 'ООО «Поставка Плюс»',
                'contact_person': 'Иванов И.И.',
                'phone': '+74951112233',
                'email': 'zakaz@postavka-plus.ru',
                'address': 'Москва, ул. Торговая, 5',
                'is_active': True,
            },
        )
        sup2, _ = Supplier.objects.get_or_create(
            inn='780987654321',
            defaults={
                'name': 'ИП Сидоров',
                'contact_person': 'Сидоров П.П.',
                'phone': '+79219998877',
                'email': 'sidorov@example.com',
                'address': 'СПб, Невский пр., 100',
                'is_active': True,
            },
        )

        today = timezone.now().date()

        # Товары
        products_data = [
            ('SKU-001', 'Мука пшеничная 50кг', cat_food, 'меш', Decimal('20'), Decimal('200')),
            ('SKU-002', 'Сахар 1кг', cat_food, 'шт', Decimal('100'), Decimal('500')),
            ('SKU-003', 'Молоток слесарный', cat_tools, 'шт', Decimal('5'), Decimal('30')),
        ]
        products = []
        for sku, name, cat, unit, mn, mx in products_data:
            p, cr = Product.objects.get_or_create(
                sku=sku,
                defaults={
                    'name': name,
                    'category': cat,
                    'unit': unit,
                    'min_stock': mn,
                    'max_stock': mx,
                    'description': f'Демо-товар {sku}',
                    'is_active': True,
                },
            )
            products.append(p)
            if cr:
                self.stdout.write(self.style.SUCCESS(f'  товар: {sku}'))

        # Партии
        batches = []
        batch_specs = [
            (products[0], 'BATCH-2026-001', wh1, sup1, Decimal('100'), Decimal('85'), Decimal('1200'), Decimal('1500')),
            (products[1], 'BATCH-2026-002', wh1, sup1, Decimal('500'), Decimal('500'), Decimal('50'), Decimal('75')),
            (products[2], 'BATCH-2026-003', wh2, sup2, Decimal('40'), Decimal('40'), Decimal('300'), Decimal('450')),
        ]
        for prod, bnum, wh, sup, qty, rem, pprice, sprice in batch_specs:
            st = status_by_code.get('batch_active') or status_by_code['batch_new']
            pb, cr = ProductBatch.objects.get_or_create(
                product=prod,
                batch_number=bnum,
                defaults={
                    'supplier': sup,
                    'warehouse': wh,
                    'quantity': qty,
                    'remaining_quantity': rem,
                    'purchase_price': pprice,
                    'selling_price': sprice,
                    'production_date': today - timedelta(days=30),
                    'expiration_date': today + timedelta(days=180),
                    'status': st,
                    'created_by': actor,
                },
            )
            batches.append(pb)
            if cr:
                self.stdout.write(self.style.SUCCESS(f'  партия: {bnum}'))

        st_move = status_by_code.get('movement_done') or status_by_code['movement_new']
        if batches:
            sm, cr = StockMovement.objects.get_or_create(
                document_number='MV-2026-001',
                defaults={
                    'movement_type': 'receipt',
                    'batch': batches[0],
                    'from_warehouse': None,
                    'to_warehouse': wh1,
                    'quantity': Decimal('15'),
                    'document_date': today,
                    'status': st_move,
                    'notes': 'Демо поступление',
                    'created_by': actor,
                },
            )
            if cr:
                self.stdout.write(self.style.SUCCESS('  движение: MV-2026-001'))

        st_wo = status_by_code.get('approved') or status_by_code['writeoff_new']
        if len(batches) > 1:
            wo, cr = WriteOff.objects.get_or_create(
                document_number='WO-2026-001',
                defaults={
                    'batch': batches[1],
                    'quantity': Decimal('2'),
                    'reason': 'Порча упаковки (демо)',
                    'document_date': today,
                    'status': st_wo,
                    'created_by': actor,
                    'approved_by': admin_user or actor,
                    'approved_at': timezone.now(),
                },
            )
            if cr:
                self.stdout.write(self.style.SUCCESS('  списание: WO-2026-001'))

        st_inv = status_by_code.get('in_progress') or status_by_code['pending']
        inv, cr = Inventory.objects.get_or_create(
            inventory_number='INV-DEMO-2026',
            defaults={
                'warehouse': wh1,
                'status': st_inv,
                'created_by': actor,
                'notes': 'Демо-инвентаризация',
            },
        )
        if cr:
            self.stdout.write(self.style.SUCCESS('  инвентаризация: INV-DEMO-2026'))
            if batches:
                InventoryItem.objects.get_or_create(
                    inventory=inv,
                    product=products[0],
                    batch=batches[0],
                    defaults={
                        'expected_quantity': batches[0].remaining_quantity,
                        'actual_quantity': None,
                    },
                )

        # Уведомление один раз
        if not Notification.objects.filter(
            user=actor, title='Демо-данные загружены'
        ).exists():
            Notification.objects.create(
                user=actor,
                type='success',
                title='Демо-данные загружены',
                message='База заполнена тестовыми складами, товарами и партиями.',
                link='/dashboard',
                is_read=False,
            )

        self.stdout.write(self.style.SUCCESS('Готово. Логины: admin/manager/user1, пароль demo123'))
