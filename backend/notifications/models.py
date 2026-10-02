from django.db import models

class Trigger(models.Model):
    name = models.CharField(max_length=100, help_text="Display name for trigger (e.g., User Login)")
    key = models.CharField(max_length=50, unique=True, help_text="System key for trigger (e.g., login, logout)")
    description = models.TextField(blank=True, default='')

    def __str__(self):
        return f"{self.name} ({self.key})"


class Template(models.Model):
    CHANNEL_CHOICES = [
        ('whatsapp', 'WhatsApp'),
        ('email', 'Email'),
        ('webpush', 'Web Push'),
    ]

    APPROVAL_CHOICES = [
        ('n_a', 'N/A'),
        ('pending', 'Pending Approval'),
        ('approved', 'Approved'),
        ('rejected', 'Rejected'),
    ]

    trigger = models.ForeignKey(Trigger, on_delete=models.CASCADE, related_name='templates')
    channel = models.CharField(max_length=20, choices=CHANNEL_CHOICES)
    subject = models.CharField(max_length=255, blank=True, default='', help_text="Subject for Email or Title for Web Push")
    body = models.TextField(help_text="Notification body content with placeholders like {username}, {first_name}, {email}")
    variable_mappings = models.JSONField(default=dict, blank=True, help_text="Optional JSON dictionary mapping dynamic placeholders")
    is_active = models.BooleanField(default=True)
    whatsapp_approval_status = models.CharField(max_length=20, choices=APPROVAL_CHOICES, default='approved')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        unique_together = ('trigger', 'channel')

    def __str__(self):
        return f"{self.trigger.key} - {self.channel} ({'Active' if self.is_active else 'Inactive'})"
