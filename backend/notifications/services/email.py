import requests
import logging
from django.conf import settings
from django.core.mail import send_mail

logger = logging.getLogger(__name__)

def send_email_notification(recipient_email, subject, message_body):
    """
    Sends an email notification via Resend REST API, with fallback to standard Django mail or simulation.
    """
    api_key = getattr(settings, 'RESEND_API_KEY', '')
    from_email = getattr(settings, 'RESEND_FROM_EMAIL', 'onboarding@resend.dev')

    if not recipient_email:
        return {
            'success': False,
            'channel': 'email',
            'error': 'No recipient email address provided.'
        }

    # Check if Resend API key is dummy or missing
    if not api_key or api_key.startswith('your-'):
        logger.info(f"[SIMULATED EMAIL] To: {recipient_email} | Subject: {subject} | Body: {message_body}")
        try:
            send_mail(
                subject=subject or 'Notification System Update',
                message=message_body,
                from_email=from_email,
                recipient_list=[recipient_email],
                fail_silently=True,
            )
        except Exception:
            pass

        return {
            'success': True,
            'simulated': True,
            'channel': 'email',
            'recipient': recipient_email,
            'message': 'Email simulated / logged (Resend API key not configured in .env).'
        }

    url = "https://api.resend.com/emails"
    headers = {
        "Authorization": f"Bearer {api_key}",
        "Content-Type": "application/json"
    }
    
    # Ensure recipient format for Resend API is a list and lowercase (Resend is case-sensitive)
    if isinstance(recipient_email, str):
        recipients = [recipient_email.lower()]
    else:
        recipients = [email.lower() for email in recipient_email]

    payload = {
        "from": from_email,
        "to": recipients,
        "subject": subject or "Notification System Alert",
        "html": f"<div><p>{message_body.replace(chr(10), '<br>')}</p></div>",
        "text": message_body
    }

    try:
        response = requests.post(url, json=payload, headers=headers, timeout=10)
        data = response.json()
        if response.status_code in (200, 201) and 'id' in data:
            logger.info(f"Resend email delivered successfully. ID: {data.get('id')}")
            return {
                'success': True,
                'channel': 'email',
                'recipient': recipient_email,
                'message_id': data.get('id'),
                'response': data
            }
        else:
            error_msg = data.get('message') or data.get('name') or str(data)
            logger.error(f"Resend Email Error: {error_msg} (HTTP {response.status_code})")
            return {
                'success': False,
                'channel': 'email',
                'error': error_msg,
                'status_code': response.status_code
            }
    except Exception as e:
        logger.exception("Resend Email Request Failed")
        return {
            'success': False,
            'channel': 'email',
            'error': str(e)
        }

