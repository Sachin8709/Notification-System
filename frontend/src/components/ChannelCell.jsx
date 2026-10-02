import React, { useState } from 'react';
import { Settings, Send, Zap, CheckCircle, Clock, AlertCircle } from 'lucide-react';

export function ChannelCell({ trigger, channel, template, onEdit, onToggle, onTestSend, onTestSendTrigger }) {
  const [loadingToggle, setLoadingToggle] = useState(false);
  const [testingSend, setTestingSend] = useState(false);

  const handleToggle = async (e) => {
    const newState = e.target.checked;
    setLoadingToggle(true);
    try {
      await onToggle(template?.id, newState, trigger.id, channel);
    } finally {
      setLoadingToggle(false);
    }
  };

  const handleTest = async () => {
    if (!template) return;
    setTestingSend(true);
    try {
      await onTestSend(template);
    } finally {
      setTestingSend(false);
    }
  };

  if (!template) {
    return (
      <div style={{
        padding: '1rem',
        borderRadius: '10px',
        border: '1px dashed #D1D5DB',
        textAlign: 'center',
        background: '#FAFAFA'
      }}>
        <p style={{ color: '#6B7280', fontSize: '0.8rem', marginBottom: '0.5rem' }}>
          No template configured
        </p>
        <button
          onClick={() => onEdit(trigger, channel, null)}
          style={{
            padding: '0.35rem 0.75rem',
            fontSize: '0.75rem',
            borderRadius: '6px',
            background: '#FFFFFF',
            border: '1px solid #D1D5DB',
            color: '#DC2626',
            cursor: 'pointer',
            fontWeight: 700
          }}
        >
          + Create Template
        </button>
      </div>
    );
  }

  const renderApprovalBadge = () => {
    if (channel !== 'whatsapp') return null;
    const status = template.whatsapp_approval_status || 'approved';
    if (status === 'approved') {
      return <span className="badge badge-approved"><CheckCircle size={10} /> Approved</span>;
    } else if (status === 'pending') {
      return <span className="badge badge-pending"><Clock size={10} /> Pending</span>;
    } else {
      return <span className="badge badge-rejected"><AlertCircle size={10} /> Rejected</span>;
    }
  };

  return (
    <div style={{
      background: template.is_active ? '#FFFFFF' : '#F9FAFB',
      border: `1px solid ${template.is_active ? 'rgba(220, 38, 38, 0.25)' : '#E5E7EB'}`,
      borderRadius: '12px',
      padding: '1rem',
      display: 'flex',
      flexDirection: 'column',
      gap: '0.75rem',
      position: 'relative',
      opacity: template.is_active ? 1 : 0.65,
      boxShadow: template.is_active ? '0 4px 12px rgba(220, 38, 38, 0.05)' : 'none',
      transition: 'all 0.2s ease'
    }}>
      {/* Top Header: Channel + Status + Toggle */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <span className={`channel-tag ${channel}`}>
            {channel === 'whatsapp' ? 'WhatsApp' : channel === 'email' ? 'Email' : 'Web Push'}
          </span>
          {renderApprovalBadge()}
        </div>

        <label className="switch" title={template.is_active ? "Deactivate Channel" : "Activate Channel"}>
          <input
            type="checkbox"
            checked={template.is_active}
            onChange={handleToggle}
            disabled={loadingToggle}
          />
          <span className="slider"></span>
        </label>
      </div>

      {/* Body / Subject snippet */}
      <div style={{ fontSize: '0.85rem' }}>
        {template.subject && (
          <div style={{ fontWeight: 700, color: '#111827', marginBottom: '0.25rem' }}>
            {template.subject}
          </div>
        )}
        <div style={{
          color: '#374151',
          fontSize: '0.8rem',
          display: '-webkit-box',
          WebkitLineClamp: 2,
          WebkitBoxOrient: 'vertical',
          overflow: 'hidden',
          lineHeight: '1.4'
        }}>
          {template.body}
        </div>
      </div>

      {/* Action Buttons: Edit, Send, Trigger */}
      <div className="table-actions-group" style={{ paddingTop: '0.5rem', borderTop: '1px solid #E5E7EB', marginTop: 'auto' }}>
        <button
          type="button"
          onClick={() => onEdit(trigger, channel, template)}
          className="action-btn edit-btn"
          title="Edit Template"
        >
          <Settings size={13} color="#DC2626" /> Edit
        </button>

        <button
          type="button"
          onClick={handleTest}
          disabled={testingSend || !template.is_active}
          className="action-btn send-btn"
          title="Test Send Notification"
        >
          <Send size={12} color={template.is_active ? '#FFFFFF' : '#9CA3AF'} />
          {testingSend ? 'Sending...' : 'Send'}
        </button>

      </div>
    </div>
  );
}

