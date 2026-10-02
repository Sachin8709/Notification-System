from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status, permissions
from django.shortcuts import get_object_or_404
from .models import Trigger, Template
from .serializers import TriggerSerializer, TemplateSerializer
from .dispatcher import fire_trigger
from .services.whatsapp import send_whatsapp_notification
from .services.email import send_email_notification
from .services.webpush import send_webpush_notification
from accounts.models import Profile

def ensure_exact_triggers():
    """
    Enforces that ONLY the 5 user-requested triggers exist:
    1. Login - User signs in on the website
    2. Logout - User signs out
    3. Not logged in for 1 day - User has not visited the website for 24 hours
    4. Not logged in for 1 week - User has not visited for 7 days
    5. Password reset - User asks to reset password
    All other extra triggers are removed.
    """
    REQUIRED_TRIGGERS = [
        {
            'key': 'login',
            'name': 'Login',
            'description': 'User signs in on the website',
            'templates': {
                'whatsapp': ('Login Alert', 'Hi {first_name}! You signed in on the website at {time}.'),
                'email': ('Welcome Back, {first_name} - Sign In Alert', 'Hello {first_name},\n\nYou signed in to your account at {time}.\n\nIf this was not you, please contact support.'),
                'webpush': ('Successful Sign In', 'Welcome back {first_name}! You are now signed in.')
            }
        },
        {
            'key': 'logout',
            'name': 'Logout',
            'description': 'User signs out',
            'templates': {
                'whatsapp': ('Logout Notice', 'Goodbye {first_name}. You signed out of your session at {time}.'),
                'email': ('Session Ended', 'Hello {first_name},\n\nYou signed out of your account at {time}.'),
                'webpush': ('Signed Out', 'You have signed out of your account.')
            }
        },
        {
            'key': 'inactive_1_day',
            'name': 'Not logged in for 1 day',
            'description': 'User has not visited the website for 24 hours',
            'templates': {
                'whatsapp': ('Inactivity Alert (1 Day)', 'Hi {first_name}! You have not visited the website in 24 hours.'),
                'email': ('We Miss You (24 Hours)', 'Hello {first_name},\n\nWe noticed you have not visited the website for 24 hours. Check back in for new updates!'),
                'webpush': ('Inactivity Alert (1 Day)', 'We miss you {first_name}! Come back to check updates.')
            }
        },
        {
            'key': 'inactive_1_week',
            'name': 'Not logged in for 1 week',
            'description': 'User has not visited for 7 days',
            'templates': {
                'whatsapp': ('Inactivity Alert (1 Week)', 'Hello {first_name}! You have not visited for 7 days. Log in to check your activity.'),
                'email': ('Weekly Inactivity Reminder', 'Hello {first_name},\n\nIt has been 7 days since your last visit. We saved your progress!'),
                'webpush': ('Inactivity Alert (1 Week)', 'Haven\'t seen you in 7 days! Log back in now.')
            }
        },
        {
            'key': 'password_reset',
            'name': 'Password reset',
            'description': 'User asks to reset password',
            'templates': {
                'whatsapp': ('Password Reset Verification', 'Security Alert: Password reset requested for account {username} at {time}.'),
                'email': ('Password Reset Request', 'Hello {first_name},\n\nA password reset was requested for your account ({username}).\n\nIf you initiated this, please reset your password on the site.'),
                'webpush': ('Password Reset Alert', 'Password reset requested for your account.')
            }
        }
    ]

    allowed_keys = [t['key'] for t in REQUIRED_TRIGGERS]
    # Delete any extra triggers not in allowed list
    Trigger.objects.exclude(key__in=allowed_keys).delete()

    for item in REQUIRED_TRIGGERS:
        trigger, _ = Trigger.objects.get_or_create(
            key=item['key'],
            defaults={
                'name': item['name'],
                'description': item['description']
            }
        )
        # Update name and description if they were modified
        if trigger.name != item['name'] or trigger.description != item['description']:
            trigger.name = item['name']
            trigger.description = item['description']
            trigger.save()

        # Seed templates for 3 channels
        for channel_key, (subj, body) in item['templates'].items():
            Template.objects.get_or_create(
                trigger=trigger,
                channel=channel_key,
                defaults={
                    'subject': subj,
                    'body': body,
                    'is_active': True,
                    'whatsapp_approval_status': 'approved' if channel_key == 'whatsapp' else 'n_a'
                }
            )


class TriggerListCreateView(APIView):
    """
    GET: List all triggers with their templates.
    POST: Create a new trigger.
    """
    permission_classes = [permissions.AllowAny]

    def get(self, request):
        ensure_exact_triggers()
        triggers = Trigger.objects.all().prefetch_related('templates')
        serializer = TriggerSerializer(triggers, many=True)
        return Response(serializer.data)

    def post(self, request):
        serializer = TriggerSerializer(data=request.data)
        if serializer.is_valid():
            trigger = serializer.save()
            for channel in ['whatsapp', 'email', 'webpush']:
                Template.objects.get_or_create(
                    trigger=trigger,
                    channel=channel,
                    defaults={
                        'subject': f"{trigger.name} Notification",
                        'body': f"Hello {{first_name}}, this is a notification for {trigger.name}.",
                        'is_active': True,
                        'whatsapp_approval_status': 'approved' if channel != 'whatsapp' else 'pending'
                    }
                )
            return Response(TriggerSerializer(trigger).data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)



class TriggerDetailView(APIView):
    """
    GET, PUT, DELETE for individual trigger.
    """
    permission_classes = [permissions.AllowAny]

    def get(self, request, pk):
        trigger = get_object_or_404(Trigger, pk=pk)
        return Response(TriggerSerializer(trigger).data)

    def put(self, request, pk):
        trigger = get_object_or_404(Trigger, pk=pk)
        serializer = TriggerSerializer(trigger, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def delete(self, request, pk):
        trigger = get_object_or_404(Trigger, pk=pk)
        trigger.delete()
        return Response({'message': 'Trigger deleted successfully.'}, status=status.HTTP_204_NO_CONTENT)


class TemplateCreateUpdateView(APIView):
    """
    POST: Create or update a template.
    PUT: Update a template by PK.
    """
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        trigger_id = request.data.get('trigger')
        channel = request.data.get('channel')
        
        template = Template.objects.filter(trigger_id=trigger_id, channel=channel).first()
        if template:
            serializer = TemplateSerializer(template, data=request.data, partial=True)
        else:
            serializer = TemplateSerializer(data=request.data)

        if serializer.is_valid():
            saved_template = serializer.save()
            return Response(TemplateSerializer(saved_template).data, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def put(self, request, pk):
        template = get_object_or_404(Template, pk=pk)
        serializer = TemplateSerializer(template, data=request.data, partial=True)
        if serializer.is_valid():
            saved = serializer.save()
            return Response(TemplateSerializer(saved).data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class TemplateToggleView(APIView):
    """
    POST: Toggle on/off the is_active state of a template.
    """
    permission_classes = [permissions.AllowAny]

    def post(self, request, pk):
        template = get_object_or_404(Template, pk=pk)
        is_active = request.data.get('is_active', not template.is_active)
        template.is_active = is_active
        template.save()
        return Response({
            'id': template.id,
            'channel': template.channel,
            'is_active': template.is_active,
            'message': f"Template {'activated' if template.is_active else 'deactivated'} successfully."
        })


class TestSendView(APIView):
    """
    POST: Test send a notification template to specific recipient data or logged in user.
    """
    permission_classes = [permissions.AllowAny]

    def post(self, request, pk=None):
        template_id = pk or request.data.get('template_id')
        custom_recipient = request.data.get('recipient')
        custom_subject = request.data.get('subject')
        custom_body = request.data.get('body')

        user = request.user if request.user.is_authenticated else None
        
        # If template ID provided, send that specific template
        if template_id:
            template = get_object_or_404(Template, pk=template_id)
            channel = template.channel
            subject = custom_subject or template.subject or "Test Notification"
            body = custom_body or template.body or "This is a test notification message."

            # Determine recipient
            if channel == 'whatsapp':
                phone = custom_recipient or (user.profile.phone_number if user and hasattr(user, 'profile') else '+14155552671')
                res = send_whatsapp_notification(phone, body, template_obj=template)
            elif channel == 'email':
                email_addr = custom_recipient or (user.email if user and user.email else 'testuser@example.com')
                res = send_email_notification(email_addr, subject, body)
            elif channel == 'webpush':
                user_sub = getattr(getattr(user, 'profile', None), 'onesignal_subscription_id', None)
                sub_id = custom_recipient or user_sub or '11111111-1111-1111-1111-111111111111'
                res = send_webpush_notification(sub_id, subject, body)


            else:
                return Response({'error': f'Invalid channel {channel}'}, status=status.HTTP_400_BAD_REQUEST)

            return Response(res, status=status.HTTP_200_OK)

        # Otherwise trigger fire_trigger for a key
        trigger_key = request.data.get('trigger_key', 'login')
        if user:
            results = fire_trigger(trigger_key, user)
        else:
            # Fallback mock user if unauthenticated test
            from django.contrib.auth.models import User
            demo_user, _ = User.objects.get_or_create(username='demo_tester', defaults={'email': 'demo@example.com', 'first_name': 'Demo'})
            profile, _ = Profile.objects.get_or_create(user=demo_user)
            if not profile.phone_number:
                profile.phone_number = '+14155552671'
                profile.save()
            results = fire_trigger(trigger_key, demo_user)

        return Response({
            'message': f"Fired trigger '{trigger_key}' test send.",
            'results': results
        }, status=status.HTTP_200_OK)
