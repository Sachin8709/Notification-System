import os
import re
import logging
import requests
from django.conf import settings

logger = logging.getLogger(__name__)

GRAPH_API_VERSION = getattr(settings, 'WHATSAPP_API_VERSION', 'v25.0')
DEFAULT_COUNTRY_CODE = getattr(settings, 'WHATSAPP_DEFAULT_COUNTRY_CODE', '91')
TEMPLATE_NAME = getattr(settings, 'WHATSAPP_TEMPLATE_NAME', 'hello_world')
TEMPLATE_LANG = getattr(settings, 'WHATSAPP_TEMPLATE_LANG', 'en_US')


def _clean_phone(raw):
    """Digits only, with country code (e.g. 918709795744)."""
    digits = re.sub(r'\D', '', raw or '')
    if len(digits) == 10:
        digits = DEFAULT_COUNTRY_CODE + digits
    return digits


def _post(url, headers, payload):
    response = requests.post(url, json=payload, headers=headers, timeout=10)
    try:
        data = response.json()
    except ValueError:
        data = {'raw': response.text}
    return response, data


def send_whatsapp_notification(recipient_phone, message_body, template_obj=None):
    """
    Sends a WhatsApp message using Meta WhatsApp Cloud API.
    1) Tries a normal text message (works inside the 24-hour window).
    2) If Meta says the window is closed (error 131047) or the recipient
       hasn't opted in, falls back to the approved template.
    """
    from dotenv import dotenv_values
    env_file = os.path.join(settings.BASE_DIR, '.env')
    file_vals = dotenv_values(env_file) if os.path.exists(env_file) else {}

    file_token = (file_vals.get('WHATSAPP_ACCESS_TOKEN') or '').strip()
    file_id = (file_vals.get('PHONE_NUMBER_ID') or '').strip()

    env_token = os.getenv('WHATSAPP_ACCESS_TOKEN', '').strip()
    env_id = os.getenv('PHONE_NUMBER_ID', '').strip()

    access_token = file_token or env_token or str(getattr(settings, 'WHATSAPP_ACCESS_TOKEN', '') or '').strip()
    phone_number_id = file_id or env_id or str(getattr(settings, 'PHONE_NUMBER_ID', '') or '').strip()


    if not recipient_phone:
        return {
            'success': False,
            'channel': 'whatsapp',
            'error': 'No recipient phone number provided in user profile.'
        }

    clean_phone = _clean_phone(recipient_phone)
    if not clean_phone:
        return {
            'success': False,
            'channel': 'whatsapp',
            'error': f'Invalid phone number: {recipient_phone}'
        }

    # Placeholder / missing credentials -> simulate (same behaviour as before)
    dummy_tokens = ('your_whatsapp_access_token', 'EAAG...your_whatsapp_access_token')
    dummy_ids = ('100000000000000', 'your_test_phone_number_id')
    if (not access_token or access_token in dummy_tokens or access_token.startswith('your_')
            or not phone_number_id or phone_number_id in dummy_ids
            or phone_number_id.startswith('your_')):
        logger.warning("[SIMULATED WHATSAPP] Credentials missing or placeholder. To: %s", clean_phone)
        return {
            'success': True,
            'simulated': True,
            'channel': 'whatsapp',
            'recipient': clean_phone,
            'message': 'WhatsApp message simulated successfully (sandbox credentials not set in .env).'
        }

    url = f"https://graph.facebook.com/{GRAPH_API_VERSION}/{phone_number_id}/messages"
    headers = {
        "Authorization": f"Bearer {access_token}",
        "Content-Type": "application/json"
    }

    text_payload = {
        "messaging_product": "whatsapp",
        "recipient_type": "individual",
        "to": clean_phone,
        "type": "text",
        "text": {"preview_url": False, "body": message_body}
    }

    template_payload = {
        "messaging_product": "whatsapp",
        "recipient_type": "individual",
        "to": clean_phone,
        "type": "template",
        "template": {"name": TEMPLATE_NAME, "language": {"code": TEMPLATE_LANG}}
    }

    try:
        response, data = _post(url, headers, text_payload)

        # Text failed because the 24-hour window is closed -> send template instead
        error_code = (data.get('error') or {}).get('code') if isinstance(data, dict) else None
        if response.status_code not in (200, 201) and error_code in (131047, 131051):
            logger.info("Text blocked (code %s), retrying with template.", error_code)
            response, data = _post(url, headers, template_payload)

        if response.status_code in (200, 201):
            return {
                'success': True,
                'channel': 'whatsapp',
                'recipient': clean_phone,
                'response': data
            }

        err = data.get('error', {}) if isinstance(data, dict) else {}
        logger.error("WhatsApp API error %s: %s", response.status_code, data)
        return {
            'success': False,
            'channel': 'whatsapp',
            'error': err.get('message', str(data)),
            'error_code': err.get('code'),
            'status_code': response.status_code
        }
    except Exception as e:
        logger.exception("WhatsApp API Request Failed")
        return {
            'success': False,
            'channel': 'whatsapp',
            'error': str(e)
        }