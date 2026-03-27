from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response
from django.contrib.auth import get_user_model
from .models import Role
from .serializers import UserSerializer, RoleSerializer, UserRegisterSerializer
from .permissions import IsAdminRoleOrSuperuser

User = get_user_model()


class UserViewSet(viewsets.ModelViewSet):
    queryset = User.objects.all().select_related('role')
    serializer_class = UserSerializer

    def get_permissions(self):
        if self.action == 'register':
            permission_classes = [permissions.AllowAny]
        elif self.action == 'me':
            permission_classes = [permissions.IsAuthenticated]
        else:
            permission_classes = [IsAdminRoleOrSuperuser]
        return [permission() for permission in permission_classes]

    @action(detail=False, methods=['post'], permission_classes=[permissions.AllowAny])
    def register(self, request):
        """Регистрация с ролью user (по умолчанию)."""
        serializer = UserRegisterSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        role_user, _ = Role.objects.get_or_create(
            code='user',
            defaults={
                'name': 'Пользователь',
                'description': 'Базовый доступ после регистрации',
            },
        )
        data = serializer.validated_data
        user = User.objects.create_user(
            username=data['username'],
            email=data.get('email') or '',
            password=data['password'],
            first_name=data.get('first_name') or '',
            last_name=data.get('last_name') or '',
            role=role_user,
            is_active=True,
        )
        return Response(UserSerializer(user).data, status=status.HTTP_201_CREATED)

    @action(detail=False, methods=['get', 'put', 'patch'])
    def me(self, request):
        """Получение и обновление текущего пользователя"""
        user = request.user

        if request.method == 'GET':
            serializer = self.get_serializer(user)
            return Response(serializer.data)

        # Разрешаем частичное обновление и для PUT, чтобы
        # можно было отправлять только изменяемые поля профиля
        elif request.method in ['PUT', 'PATCH']:
            serializer = self.get_serializer(
                user,
                data=request.data,
                partial=True
            )
            if serializer.is_valid():
                serializer.save()
                return Response(serializer.data)
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class RoleViewSet(viewsets.ModelViewSet):
    queryset = Role.objects.all()
    serializer_class = RoleSerializer
    permission_classes = [IsAdminRoleOrSuperuser]