from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    AuditLogViewSet,
    NotificationViewSet,
    DashboardStatsView,
    DashboardMovementsView,
    DashboardCategoriesView,
)

router = DefaultRouter()
router.register('audit-logs', AuditLogViewSet)
router.register('notifications', NotificationViewSet)

urlpatterns = [
    path('', include(router.urls)),
    path('dashboard/stats/', DashboardStatsView.as_view(), name='dashboard-stats'),
    path('dashboard/movements/', DashboardMovementsView.as_view(), name='dashboard-movements'),
    path('dashboard/categories/', DashboardCategoriesView.as_view(), name='dashboard-categories'),
]