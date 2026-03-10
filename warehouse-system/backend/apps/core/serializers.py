from rest_framework import serializers
from .models import AuditLog, Notification


class AuditLogSerializer(serializers.ModelSerializer):
    user_name = serializers.CharField(source='user.username', read_only=True)
    content_type_name = serializers.CharField(source='content_type.model', read_only=True)

    class Meta:
        model = AuditLog
        fields = ['id', 'user', 'user_name', 'action', 'content_type', 'content_type_name',
                  'object_id', 'field_name', 'old_value', 'new_value',
                  'ip_address', 'user_agent', 'created_at']


class NotificationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Notification
        fields = ['id', 'user', 'type', 'title', 'message', 'link',
                  'is_read', 'created_at']