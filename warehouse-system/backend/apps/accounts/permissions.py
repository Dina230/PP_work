from rest_framework import permissions


class IsAdminRoleOrSuperuser(permissions.BasePermission):
    """
    Доступ: суперпользователь Django или пользователь с ролью code='admin'.
    """

    def has_permission(self, request, view):
        user = request.user
        if not user.is_authenticated:
            return False
        if user.is_superuser:
            return True
        role = getattr(user, 'role', None)
        return bool(role and getattr(role, 'code', None) == 'admin')
