import React, { useState, useEffect } from 'react';
import { X, Save, Tag, MessageSquare, Mail, Bell } from 'lucide-react';

export function TemplateModal({ isOpen, onClose, trigger, channel, template, onSave }) {
  const [subject, setSubject] = useState('');
  const [body, setBody] = useState('');
  const [isActive, setIsActive] = useState(true);
  const [whatsappStatus, setWhatsappStatus] = useState('approved');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (template) {
      setSubject(template.subject || '');
      setBody(template.body || '');
      setIsActive(template.is_active !== undefined ? template.is_active : true);
      setWhatsappStatus(template.whatsapp_approval_status || 'approved');
    } else {
      setSubject('');
      setBody('');
      setIsActive(true);
      setWhatsappStatus(channel === 'whatsapp' ? 'pending' : 'approved');
    }
  }, [template, trigger, channel, isOpen]);

  if (!isOpen) return null;

  const insertVariable = (varName) => {
    setBody((prev) => prev + ` {${varName}}`);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await onSave({
        trigger: trigger.id,
        channel,
        subject,
        body,
        is_active: isActive,
        whatsapp_approval_status: whatsappStatus,
        id: template?.id
      });
      onClose();
    } catch (err) {
      alert(err.message || 'Failed to save template');
    } finally {
      setSaving(false);
    }
  };

  const variables = ['username', 'first_name', 'email', 'phone_number', 'time'];

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
              <span className={`channel-tag ${channel}`}>
                {channel === 'whatsapp' ? <MessageSquare size={12} /> : channel === 'email' ? <Mail size={12} /> : <Bell size={12} />}
                {channel.toUpperCase()}
              </span>
              <span style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>• {trigger?.name}</span>
            </div>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 700 }}>
              {template ? 'Edit Template' : 'Create Template'}
            </h2>
          </div>
          <button
            onClick={onClose}
            style={{
              background: 'var(--bg-glass)',
              border: '1px solid var(--border-glass)',
              color: 'var(--text-secondary)',
              borderRadius: '50%',
              width: '32px',
              height: '32px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer'
            }}
          >
            <X size={16} />
          </button>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          {/* Email Subject / Push Title */}
          {channel !== 'whatsapp' && (
            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.4rem', color: 'var(--text-secondary)' }}>
                {channel === 'email' ? 'Email Subject Line' : 'Push Notification Title'}
              </label>
              <input
                type="text"
                className="input-field"
                placeholder={channel === 'email' ? 'e.g. Welcome back to our platform!' : 'e.g. Login Alert'}
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
              />
            </div>
          )}

          {/* Dynamic Variable Helper Tags */}
          <div>
            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.4rem', color: 'var(--text-secondary)' }}>
              Insert Placeholders
            </label>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem' }}>
              {variables.map((v) => (
                <button
                  key={v}
                  type="button"
                  onClick={() => insertVariable(v)}
                  style={{
                    background: 'rgba(220, 38, 38, 0.08)',
                    border: '1px solid rgba(220, 38, 38, 0.25)',
                    color: '#DC2626',
                    fontSize: '0.75rem',
                    fontWeight: 600,
                    padding: '0.25rem 0.6rem',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.25rem'
                  }}
                >
                  <Tag size={10} color="#DC2626" /> &#123;{v}&#125;
                </button>
              ))}
            </div>
          </div>

          {/* Message Body */}
          <div>
            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.4rem', color: 'var(--text-secondary)' }}>
              Message Template Body *
            </label>
            <textarea
              required
              rows={5}
              className="input-field"
              style={{ resize: 'vertical' }}
              placeholder="Enter message template with placeholders like Hello {first_name}..."
              value={body}
              onChange={(e) => setBody(e.target.value)}
            />
          </div>

          {/* WhatsApp Specific Approval Status */}
          {channel === 'whatsapp' && (
            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.4rem', color: 'var(--text-secondary)' }}>
                Meta WhatsApp Business Approval Status
              </label>
              <select
                className="input-field"
                value={whatsappStatus}
                onChange={(e) => setWhatsappStatus(e.target.value)}
              >
                <option value="approved">Approved (Ready to send)</option>
                <option value="pending">Pending Approval</option>
                <option value="rejected">Rejected</option>
              </select>
            </div>
          )}

          {/* Active Toggle */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.75rem 1rem', background: 'rgba(255,255,255,0.02)', borderRadius: '8px', border: '1px solid var(--border-glass)' }}>
            <div>
              <div style={{ fontWeight: 600, fontSize: '0.875rem' }}>Active Channel Template</div>
              <div style={{ fontSize: '0.775rem', color: 'var(--text-secondary)' }}>Enable automated dispatch for this event</div>
            </div>
            <label className="switch">
              <input
                type="checkbox"
                checked={isActive}
                onChange={(e) => setIsActive(e.target.checked)}
              />
              <span className="slider"></span>
            </label>
          </div>

          {/* Actions */}
          <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end', marginTop: '0.5rem' }}>
            <button
              type="button"
              onClick={onClose}
              className="nav-btn"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="nav-btn nav-btn-primary"
            >
              <Save size={14} /> {saving ? 'Saving...' : 'Save Template'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
