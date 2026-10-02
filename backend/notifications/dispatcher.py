import logging
from datetime import datetime
from .models import Trigger, Template
from .services.whatsapp import send_whatsapp_notification
from .services.email import send_email_notification
from .services.webpush import send_webpush_notification

logger = logging.getLogger(__name__)

def render_template_string(template_str, context):
    """
    Replaces {variable_name} or {{variable_name}} placeholders in template_str with values from context dict.
    """
    if not template_str:
        return ""
    rendered = template_str
    for key, value in context.items():
        val_str = str(value if value is not None else '')
        # Support {{var}}
        rendered = rendered.replace(f"{{{{{key}}}}}", val_str)
        # Support {var}
        rendered = rendered.replace(f"{{{key}}}", val_str)
    return rendered



def fire_trigger(key, user, extra_context=None):
    """
    Finds the active templates for trigger `key`, fills in dynamic variables,
    and dispatches notifications to appropriate channel services.
    """
    results = []

    try:
        trigger = Trigger.objects.get(key=key)
    except Trigger.DoesNotExist:
        logger.warning(f"Trigger key '{key}' does not exist in database.")
        return results

    # Get active templates for this trigger
    active_templates = Template.objects.filter(trigger=trigger, is_active=True)
    if not active_templates.exists():
        logger.info(f"No active templates configured for trigger '{key}'.")
        return results

    # Build context from user profile
    profile = getattr(user, 'profile', None)
    context = {
        'username': user.username,
        'first_name': user.first_name or user.username,
        'last_name': user.last_name or '',
        'email': user.email or '',
        'phone_number': profile.phone_number if profile else '',
        'onesignal_subscription_id': profile.onesignal_subscription_id if profile else '',
        'time': datetime.now().strftime("%Y-%m-%d %H:%M:%S UTC"),
        'trigger_key': key,
        'trigger_name': trigger.name,
    }

    if extra_context and isinstance(extra_context, dict):
        context.update(extra_context)

    for template in active_templates:
        rendered_subject = render_template_string(template.subject, context)
        rendered_body = render_template_string(template.body, context)

        channel_res = None
        if template.channel == 'whatsapp':
            phone = context.get('phone_number')
            channel_res = send_whatsapp_notification(phone, rendered_body, template_obj=template)

        elif template.channel == 'email':
            user_email = context.get('email')
            channel_res = send_email_notification(user_email, rendered_subject, rendered_body)

        elif template.channel == 'webpush':
            sub_id = context.get('onesignal_subscription_id')
            channel_res = send_webpush_notification(sub_id, rendered_subject, rendered_body)

        if channel_res:
            channel_res['template_id'] = template.id
            channel_res['trigger_key'] = key
            results.append(channel_res)

    return results
