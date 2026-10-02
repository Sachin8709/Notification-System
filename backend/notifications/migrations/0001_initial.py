from django.db import migrations, models
import django.db.models.deletion

class Migration(migrations.Migration):

    initial = True

    dependencies = [
    ]

    operations = [
        migrations.CreateModel(
            name='Trigger',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('name', models.CharField(help_text='Display name for trigger (e.g., User Login)', max_length=100)),
                ('key', models.CharField(help_text='System key for trigger (e.g., login, logout)', max_length=50, unique=True)),
                ('description', models.TextField(blank=True, default='')),
            ],
        ),
        migrations.CreateModel(
            name='Template',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('channel', models.CharField(choices=[('whatsapp', 'WhatsApp'), ('email', 'Email'), ('webpush', 'Web Push')], max_length=20)),
                ('subject', models.CharField(blank=True, default='', help_text='Subject for Email or Title for Web Push', max_length=255)),
                ('body', models.TextField(help_text='Notification body content with placeholders like {username}, {first_name}, {email}')),
                ('variable_mappings', models.JSONField(blank=True, default=dict, help_text='Optional JSON dictionary mapping dynamic placeholders')),
                ('is_active', models.BooleanField(default=True)),
                ('whatsapp_approval_status', models.CharField(choices=[('n_a', 'N/A'), ('pending', 'Pending Approval'), ('approved', 'Approved'), ('rejected', 'Rejected')], default='approved', max_length=20)),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('updated_at', models.DateTimeField(auto_now=True)),
                ('trigger', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='templates', to='notifications.trigger')),
            ],
            options={
                'unique_together': {('trigger', 'channel')},
            },
        ),
    ]
