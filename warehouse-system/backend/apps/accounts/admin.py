from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from .models import User, Role

# Простая регистрация модели User
admin.site.register(User, UserAdmin)

# Регистрация модели Role
@admin.register(Role)
class RoleAdmin(admin.ModelAdmin):
    list_display = ('id', 'name', 'code')