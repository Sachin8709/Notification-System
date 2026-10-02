from rest_framework import serializers
from .models import Trigger, Template

class TemplateSerializer(serializers.ModelSerializer):
    trigger_key = serializers.CharField(source='trigger.key', read_only=True)

    class Meta:
        model = Template
        fields = [
            'id',
            'trigger',
            'trigger_key',
            'channel',
            'subject',
            'body',
            'variable_mappings',
            'is_active',
            'whatsapp_approval_status',
            'created_at',
            'updated_at',
        ]

class TriggerSerializer(serializers.ModelSerializer):
    templates = TemplateSerializer(many=True, read_only=True)

    class Meta:
        model = Trigger
        fields = [
            'id',
            'name',
            'key',
            'description',
            'templates',
        ]
