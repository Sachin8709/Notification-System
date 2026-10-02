from django.urls import path
from .views import (
    TriggerListCreateView, TriggerDetailView,
    TemplateCreateUpdateView, TemplateToggleView,
    TestSendView
)

urlpatterns = [
    path('triggers/', TriggerListCreateView.as_view(), name='trigger-list-create'),
    path('triggers/<int:pk>/', TriggerDetailView.as_view(), name='trigger-detail'),
    path('templates/', TemplateCreateUpdateView.as_view(), name='template-create'),
    path('templates/<int:pk>/', TemplateCreateUpdateView.as_view(), name='template-update'),
    path('templates/<int:pk>/toggle/', TemplateToggleView.as_view(), name='template-toggle'),
    path('templates/<int:pk>/test-send/', TestSendView.as_view(), name='template-test-send'),
    path('test-send/', TestSendView.as_view(), name='generic-test-send'),
]
