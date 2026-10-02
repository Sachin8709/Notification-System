import requests
import logging
from django.conf import settings

logger = logging.getLogger(__name__)

def send_webpush_notification(subscription_id, title, message_body):
    """
    Sends a browser web push notification via OneSignal REST API.
    """
    app_id = getattr(settings, 'ONESIGNAL_APP_ID', '')
    rest_api_key = getattr(settings, 'ONESIGNAL_REST_API_KEY', '')

    import re
    uuid_pattern = re.compile(r'^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$')
    if not subscription_id or not uuid_pattern.match(str(subscription_id)):
        subscription_id = '11111111-1111-1111-1111-111111111111'


    # Simulation check
    if not app_id or app_id == 'your-onesignal-app-id-here' or not rest_api_key or rest_api_key == 'your-onesignal-rest-api-key-here':
        logger.info(f"[SIMULATED WEBPUSH] SubID: {subscription_id} | Title: {title} | Body: {message_body}")
        return {
            'success': True,
            'simulated': True,
            'channel': 'webpush',
            'subscription_id': subscription_id,
            'message': 'Web Push simulated successfully (OneSignal credentials not set in .env).'
        }

    url = "https://onesignal.com/api/v1/notifications"
    auth_prefix = "Key" if rest_api_key.startswith("os_v2_") else "Basic"
    headers = {
        "Authorization": f"{auth_prefix} {rest_api_key}",
        "Content-Type": "application/json; charset=utf-8"
    }

    payload = {
        "app_id": app_id,
        "include_subscription_ids": [subscription_id],
        "headings": {"en": title or "New Notification"},
        "contents": {"en": message_body}
    }

    try:
        response = requests.post(url, json=payload, headers=headers, timeout=10)
        data = response.json()
        if response.status_code in (200, 201) and 'id' in data and not data.get('errors'):
            return {
                'success': True,
                'channel': 'webpush',
                'subscription_id': subscription_id,
                'response': data
            }
        else:
            errors = data.get('errors', str(data))
            return {
                'success': False,
                'channel': 'webpush',
                'error': f"OneSignal response: {errors}. (Please ensure your browser is subscribed on the User Portal page).",
                'status_code': response.status_code,
                'response': data
            }
    except Exception as e:
        logger.exception("OneSignal Web Push Request Failed")
        return {
            'success': False,
            'channel': 'webpush',
            'error': f"Connection/Request failed: {str(e)}"
        }

