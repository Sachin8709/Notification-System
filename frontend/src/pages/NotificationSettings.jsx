import React, { useState, useEffect } from 'react';
import { api } from '../api/client';
import { TriggerTable } from '../components/TriggerTable';
import { TemplateModal } from '../components/TemplateModal';
import { Settings, Zap, CheckCircle2, MessageSquare, Mail, Bell, RefreshCw, Plus, X } from 'lucide-react';

export function NotificationSettings() {
  const [triggers, setTriggers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Modal State
  const [modalOpen, setModalOpen] = useState(false);
  const [activeTrigger, setActiveTrigger] = useState(null);
  const [activeChannel, setActiveChannel] = useState('whatsapp');
  const [activeTemplate, setActiveTemplate] = useState(null);


  // Toast / Test Result Feedback
  const [toastMsg, setToastMsg] = useState(null);

  const fetchTriggers = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await api.getTriggers();
      // Filter out password_reset trigger as requested
      const filteredData = data.filter(t => t.key !== 'password_reset');
      setTriggers(filteredData);
    } catch (err) {
      setError(err.message || 'Failed to load triggers. Make sure backend Django server is running.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTriggers();
  }, []);

  const handleEditTemplate = (trigger, channel, template) => {
    setActiveTrigger(trigger);
    setActiveChannel(channel);
    setActiveTemplate(template);
    setModalOpen(true);
  };

  const handleToggleTemplate = async (templateId, newIsActive, triggerId, channel) => {
    try {
      if (templateId) {
        await api.toggleTemplate(templateId, newIsActive);
      }
      // Refresh matrix
      await fetchTriggers();
    } catch (err) {
      alert(err.message || 'Failed to toggle status');
    }
  };

  const handleTestSendTemplate = async (template) => {
    try {
      const res = await api.testSendTemplate(template.id);
      showToast(`Test send [${template.channel.toUpperCase()}]: ${res.message || (res.success ? 'Sent successfully' : res.error)}`);
    } catch (err) {
      showToast(`Test send failed: ${err.message}`, true);
    }
  };

  const handleTestSendTrigger = async (triggerKey) => {
    try {
      const res = await api.testSendTrigger(triggerKey);
      showToast(`Fired all channels for '${triggerKey}'! ${res.results?.length || 0} channels dispatched.`);
    } catch (err) {
      showToast(`Trigger failed: ${err.message}`, true);
    }
  };

  const handleSaveTemplate = async (templateData) => {
    await api.saveTemplate(templateData);
    await fetchTriggers();
    showToast('Template saved successfully!');
  };


  const showToast = (msg, isError = false) => {
    setToastMsg({ text: msg, isError });
    setTimeout(() => {
      setToastMsg(null);
    }, 4000);
  };

  // Metrics
  const totalTriggers = triggers.length;
  let activeTemplatesCount = 0;
  triggers.forEach((trig) => {
    trig.templates?.forEach((t) => {
      if (t.is_active) activeTemplatesCount++;
    });
  });

  return (
    <div style={{ maxWidth: '1200px', margin: '2rem auto', padding: '0 1.5rem' }}>
      
      {/* Toast Banner */}
      {toastMsg && (
        <div style={{
          position: 'fixed',
          bottom: '2rem',
          right: '2rem',
          background: '#FFFFFF',
          border: `1px solid ${toastMsg.isError ? '#DC2626' : '#DC2626'}`,
          color: toastMsg.isError ? '#DC2626' : '#111827',
          padding: '0.85rem 1.25rem',
          borderRadius: '12px',
          boxShadow: '0 10px 30px rgba(220, 38, 38, 0.18)',
          display: 'flex',
          alignItems: 'center',
          gap: '0.75rem',
          zIndex: 9999,
          fontSize: '0.875rem',
          fontWeight: 600,
          animation: 'slideUp 0.2s ease-out'
        }}>
          <Zap size={16} color="#DC2626" />
          <span>{toastMsg.text}</span>
        </div>
      )}

      {/* Header Title */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#DC2626', fontWeight: 700, fontSize: '0.85rem', marginBottom: '0.25rem' }}>
            <Settings size={16} color="#DC2626" /> ADMIN MANAGEMENT HUB
          </div>
          <h1 style={{ fontSize: '1.85rem', fontWeight: 800, color: '#DC2626' }}>Notification Trigger Settings</h1>
          <p style={{ color: '#374151', fontSize: '0.9rem' }}>
            Configure and toggle multi-channel messaging rules across WhatsApp, Resend Email, and OneSignal Push.
          </p>
        </div>

        <button
          onClick={fetchTriggers}
          className="nav-btn"
          style={{ background: '#FFFFFF', border: '1px solid #E5E7EB', color: '#374151' }}
        >
          <RefreshCw size={14} className={loading ? 'spin' : ''} color="#DC2626" /> Refresh Matrix
        </button>
      </div>

      {/* Analytics KPI Stat Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.25rem', marginBottom: '2rem' }}>
        <div className="glass-panel" style={{ padding: '1.25rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{ width: '46px', height: '46px', borderRadius: '12px', background: 'rgba(220, 38, 38, 0.08)', color: '#DC2626', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Zap size={22} color="#DC2626" />
          </div>
          <div>
            <div style={{ fontSize: '0.75rem', color: '#6B7280', fontWeight: 600, textTransform: 'uppercase' }}>System Triggers</div>
            <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#111827' }}>{totalTriggers}</div>
          </div>
        </div>

        <div className="glass-panel" style={{ padding: '1.25rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{ width: '46px', height: '46px', borderRadius: '12px', background: 'rgba(220, 38, 38, 0.08)', color: '#DC2626', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <CheckCircle2 size={22} color="#DC2626" />
          </div>
          <div>
            <div style={{ fontSize: '0.75rem', color: '#6B7280', fontWeight: 600, textTransform: 'uppercase' }}>Active Channel Routing</div>
            <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#111827' }}>{activeTemplatesCount} Active</div>
          </div>
        </div>

        <div className="glass-panel" style={{ padding: '1.25rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{ width: '46px', height: '46px', borderRadius: '12px', background: 'rgba(220, 38, 38, 0.08)', color: '#DC2626', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Bell size={22} color="#DC2626" />
          </div>
          <div>
            <div style={{ fontSize: '0.75rem', color: '#6B7280', fontWeight: 600, textTransform: 'uppercase' }}>Delivery Channels</div>
            <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#111827' }}>WhatsApp, Email, Push</div>
          </div>
        </div>
      </div>

      {error && (
        <div className="glass-panel" style={{ padding: '1.5rem', color: '#DC2626', border: '1px solid rgba(220, 38, 38, 0.25)', marginBottom: '2rem' }}>
          {error}
        </div>
      )}

      {/* Main Trigger Matrix Table */}
      {loading ? (
        <div style={{ padding: '4rem', textAlign: 'center', color: 'var(--text-secondary)' }}>
          Loading trigger channel matrix...
        </div>
      ) : (
        <TriggerTable
          triggers={triggers}
          onEditTemplate={handleEditTemplate}
          onToggleTemplate={handleToggleTemplate}
          onTestSendTemplate={handleTestSendTemplate}
          onTestSendTrigger={handleTestSendTrigger}
        />
      )}

      {/* Edit / Create Template Modal */}
      <TemplateModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        trigger={activeTrigger}
        channel={activeChannel}
        template={activeTemplate}
        onSave={handleSaveTemplate}
      />


    </div>
  );
}
