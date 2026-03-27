from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model
from apps.accounts.models import Role

User = get_user_model()

DEFAULT_PASSWORD = 'demo123'  # сменить в продакшене


class Command(BaseCommand):
    help = 'Создаёт роли admin/manager/user и демо-пользователей (если их ещё нет)'

    def handle(self, *args, **options):
        roles_spec = [
            ('admin', 'Администратор', 'Полный доступ, управление пользователями'),
            ('manager', 'Менеджер', 'Операции склада, без управления пользователями'),
            ('user', 'Пользователь', 'Базовые операции и просмотр'),
        ]
        roles_by_code = {}
        for code, name, desc in roles_spec:
            role, _ = Role.objects.get_or_create(
                code=code,
                defaults={'name': name, 'description': desc},
            )
            roles_by_code[code] = role

        users_spec = [
            ('admin', 'admin@example.com', 'admin', True, True),
            ('manager', 'manager@example.com', 'manager', False, False),
            ('user1', 'user1@example.com', 'user', False, False),
        ]

        for username, email, role_code, is_staff, is_super in users_spec:
            if User.objects.filter(username=username).exists():
                self.stdout.write(self.style.WARNING(f'Пользователь {username} уже существует — пропуск'))
                continue
            User.objects.create_user(
                username=username,
                email=email,
                password=DEFAULT_PASSWORD,
                role=roles_by_code[role_code],
                is_staff=is_staff,
                is_superuser=is_super,
            )
            self.stdout.write(self.style.SUCCESS(f'Создан пользователь {username} / пароль: {DEFAULT_PASSWORD}'))

        self.stdout.write(self.style.SUCCESS('Готово. Роли: admin, manager, user'))
