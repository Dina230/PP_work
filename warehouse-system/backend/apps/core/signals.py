from django.contrib.contenttypes.models import ContentType
from django.db.models.signals import post_save, post_delete
from django.dispatch import receiver

from .models import AuditLog
from .audit_context import get_current_request


EXCLUDED_MODELS = {
    'auditlog',
}


def _serialize_instance(instance):
    data = {}
    for field in instance._meta.fields:
        value = getattr(instance, field.name, None)
        data[field.name] = str(value) if value is not None else None
    return data


def _create_audit_log(instance, action, old_value='', new_value=''):
    model_name = instance._meta.model_name
    if model_name in EXCLUDED_MODELS:
        return

    request = get_current_request()
    user = getattr(request, 'user', None) if request else None
    if user is not None and not getattr(user, 'is_authenticated', False):
        user = None

    ip_address = None
    user_agent = ''
    if request is not None:
        ip_address = request.META.get('REMOTE_ADDR')
        user_agent = request.META.get('HTTP_USER_AGENT', '')

    AuditLog.objects.create(
        user=user,
        action=action,
        content_type=ContentType.objects.get_for_model(instance.__class__),
        object_id=instance.pk,
        old_value=old_value,
        new_value=new_value,
        ip_address=ip_address,
        user_agent=user_agent,
    )


@receiver(post_save)
def audit_post_save(sender, instance, created, **kwargs):
    # Пропускаем системные и core-модели, кроме нужных бизнес-сущностей
    app_label = sender._meta.app_label
    if app_label not in {'warehouse', 'inventory', 'accounts'}:
        return

    if sender._meta.model_name in EXCLUDED_MODELS:
        return

    action = 'create' if created else 'update'
    new_value = str(_serialize_instance(instance))
    _create_audit_log(instance, action=action, new_value=new_value)


@receiver(post_delete)
def audit_post_delete(sender, instance, **kwargs):
    app_label = sender._meta.app_label
    if app_label not in {'warehouse', 'inventory', 'accounts'}:
        return

    if sender._meta.model_name in EXCLUDED_MODELS:
        return

    old_value = str(_serialize_instance(instance))
    _create_audit_log(instance, action='delete', old_value=old_value)

