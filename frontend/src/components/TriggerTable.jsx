import React from 'react';
import { ChannelCell } from './ChannelCell';
import { Zap, MessageSquare, Mail, Bell } from 'lucide-react';

export function TriggerTable({ triggers, onEditTemplate, onToggleTemplate, onTestSendTemplate, onTestSendTrigger }) {
  const channels = [
    { key: 'whatsapp', label: 'WhatsApp', icon: <MessageSquare size={15} /> },
    { key: 'email', label: 'Email (Resend)', icon: <Mail size={15} /> },
    { key: 'webpush', label: 'Web Push (OneSignal)', icon: <Bell size={15} /> },
  ];

  if (!triggers || triggers.length === 0) {
    return (
      <div className="glass-panel" style={{ padding: '4rem', textAlign: 'center', color: '#6B7280' }}>
        No triggers created yet. Wait for a system event to generate a trigger.
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {triggers.map((trig) => {
        const getTemplate = (channelKey) => trig.templates?.find((t) => t.channel === channelKey);

        return (
          <div key={trig.id} className="glass-panel" style={{ overflow: 'hidden' }}>
            
            {/* Trigger Header */}
            <div style={{ 
              padding: '1.25rem 1.5rem', 
              background: '#FAFAFA', 
              borderBottom: '1px solid #E5E7EB',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: '1rem'
            }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
                  <Zap size={18} color="#DC2626" />
                  <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#111827', margin: 0 }}>
                    {trig.name}
                  </h3>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
                  <span style={{
                    fontSize: '0.75rem',
                    fontFamily: 'monospace',
                    padding: '0.15rem 0.4rem',
                    borderRadius: '4px',
                    background: 'rgba(220, 38, 38, 0.08)',
                    color: '#DC2626',
                    border: '1px solid rgba(220, 38, 38, 0.2)'
                  }}>
                    key: {trig.key}
                  </span>
                  {trig.description && (
                    <span style={{ fontSize: '0.85rem', color: '#6B7280' }}>
                      {trig.description}
                    </span>
                  )}
                </div>
              </div>
              
              <button
                onClick={() => onTestSendTrigger(trig.key)}
                className="action-btn trigger-btn"
                style={{ padding: '0.5rem 1rem' }}
              >
                <Zap size={14} /> Fire Global Trigger
              </button>
            </div>

            {/* Channels Grid */}
            <div style={{ 
              padding: '1.5rem', 
              display: 'grid', 
              gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', 
              gap: '1.25rem' 
            }}>
              {channels.map((ch) => {
                const template = getTemplate(ch.key);
                return (
                  <div key={ch.key} style={{ 
                    background: '#FFFFFF',
                    border: '1px solid #E5E7EB',
                    borderRadius: '12px',
                    padding: '1.25rem',
                    boxShadow: '0 2px 4px rgba(0,0,0,0.02)'
                  }}>
                    <div style={{ 
                      display: 'flex', 
                      alignItems: 'center', 
                      gap: '0.5rem', 
                      color: '#DC2626',
                      fontWeight: 700,
                      marginBottom: '1rem',
                      paddingBottom: '0.75rem',
                      borderBottom: '1px dashed #E5E7EB'
                    }}>
                      {ch.icon} {ch.label}
                    </div>
                    
                    <ChannelCell
                      trigger={trig}
                      channel={ch.key}
                      template={template}
                      onEdit={onEditTemplate}
                      onToggle={onToggleTemplate}
                      onTestSend={onTestSendTemplate}
                      onTestSendTrigger={onTestSendTrigger}
                    />
                  </div>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
}
