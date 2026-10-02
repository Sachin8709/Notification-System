from django.db import migrations

def seed_defaults(apps, schema_editor):
    Trigger = apps.get_model('notifications', 'Trigger')
    Template = apps.get_model('notifications', 'Template')

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

    for item in REQUIRED_TRIGGERS:
        trigger, _ = Trigger.objects.get_or_create(
            key=item['key'],
            defaults={
                'name': item['name'],
                'description': item['description']
            }
        )
        if trigger.name != item['name'] or trigger.description != item['description']:
            trigger.name = item['name']
            trigger.description = item['description']
            trigger.save()

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

def reverse_seed(apps, schema_editor):
    Trigger = apps.get_model('notifications', 'Trigger')
    Trigger.objects.filter(key__in=['login', 'logout', 'inactive_1_day', 'inactive_1_week', 'password_reset']).delete()

class Migration(migrations.Migration):

    dependencies = [
        ('notifications', '0001_initial'),
    ]

    operations = [
        migrations.RunPython(seed_defaults, reverse_seed),
    ]

