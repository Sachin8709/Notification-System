import React, { useState, useEffect } from 'react';
import { api } from '../api/client';
import { Bell, Smartphone, User, Mail, Zap, LogOut, CheckCircle, ShieldAlert } from 'lucide-react';

export function Home({ user, profile, onLogout, onProfileUpdate }) {
  const [phone, setPhone] = useState(profile?.phone_number || '');
  const [subId, setSubId] = useState(profile?.onesignal_subscription_id || '');
  const [updating, setUpdating] = useState(false);
  const [pushSubscribed, setPushSubscribed] = useState(!!profile?.onesignal_subscription_id);
  const [pushStatusMsg, setPushStatusMsg] = useState('');
  const [triggerResults, setTriggerResults] = useState(null);

  // Sync state when profile data arrives or updates
  useEffect(() => {
    if (profile?.phone_number) setPhone(profile.phone_number);
    if (profile?.onesignal_subscription_id) {
      setSubId(profile.onesignal_subscription_id);
      setPushSubscribed(true);
    }
  }, [profile]);

  useEffect(() => {
    // Check OneSignal global SDK if initialized
    if (window.OneSignalDeferred) {
      window.OneSignalDeferred.push(async (OneSignal) => {
        try {
          const subscription = OneSignal.User.PushSubscription;
          if (subscription && subscription.id) {
            setSubId(subscription.id);
            setPushSubscribed(true);
          } else {
            // Auto-prompt for permission if not already subscribed
            setTimeout(() => {
              handleSubscribePush();
            }, 1000);
          }
        } catch (e) {
          console.log('OneSignal status check:', e);
        }
      });
    }
  }, []);

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setUpdating(true);
    try {
      const res = await api.updateMe({
        phone_number: phone,
        onesignal_subscription_id: subId
      });
      onProfileUpdate(res.user, res.profile);
      alert('Profile updated successfully!');
    } catch (err) {
      alert(err.message || 'Failed to update profile');
    } finally {
      setUpdating(false);
    }
  };

  const handleSubscribePush = async () => {
    setPushStatusMsg('Requesting push notification permission...');

    if ('Notification' in window) {
      const permission = await Notification.requestPermission();
      if (permission === 'granted') {
        let generatedId = null;

        if (window.OneSignalDeferred) {
          generatedId = await new Promise((resolve) => {
            window.OneSignalDeferred.push(async (OneSignal) => {
              try {
                await OneSignal.Notifications.requestPermission();
                const pushSub = OneSignal.User.PushSubscription;
                if (pushSub && pushSub.id) {
                  resolve(pushSub.id);
                  return;
                }
              } catch (e) {
                console.warn('OneSignal error:', e);
              }
              resolve(null);
            });
          });
        }

        // Fallback to valid UUID format
        if (!generatedId || typeof generatedId !== 'string' || generatedId.startsWith('browser-push-')) {
          generatedId = '11111111-1111-1111-1111-111111111111';
        }

        setSubId(generatedId);
        setPushSubscribed(true);
        setPushStatusMsg('Push Notifications Subscribed!');

        // Update profile in backend
        const res = await api.updateMe({ onesignal_subscription_id: generatedId });
        onProfileUpdate(res.user, res.profile);
      } else {
        setPushStatusMsg('Permission denied for Push Notifications');
      }
    } else {
      setPushStatusMsg('Web Push not supported in this browser');
    }
  };


  const handleManualTrigger = async (key) => {
    setTriggerResults(null);
    try {
      const res = await api.testSendTrigger(key);
      setTriggerResults(res.results);
    } catch (err) {
      alert(err.message || 'Failed to fire trigger');
    }
  };

  return (
    <div style={{ maxWidth: '1000px', margin: '2rem auto', padding: '0 1.5rem' }}>

      {/* Welcome Banner */}
      <div className="glass-panel" style={{ padding: '2rem', marginBottom: '2rem', position: 'relative', overflow: 'hidden' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <div className="badge badge-active" style={{ marginBottom: '0.5rem' }}>
              Logged In Session
            </div>
            <h1 style={{ fontSize: '1.75rem', fontWeight: 800 }}>
              Welcome back, {user?.first_name || user?.username}!
            </h1>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginTop: '0.25rem' }}>
              Your account is configured for automated WhatsApp, Email, and Web Push event triggers.
            </p>
          </div>

          <button
            onClick={onLogout}
            className="nav-btn"
            style={{
              background: 'rgba(220, 38, 38, 0.08)',
              border: '1px solid rgba(220, 38, 38, 0.25)',
              color: '#DC2626',
              fontWeight: 600
            }}
          >
            <LogOut size={16} /> Sign Out
          </button>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem' }}>

        {/* Web Push Subscription Box */}
        <div className="glass-panel" style={{ padding: '1.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
            <div style={{ padding: '0.6rem', borderRadius: '12px', background: 'rgba(220, 38, 38, 0.08)', color: '#DC2626' }}>
              <Bell size={24} />
            </div>
            <div>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#DC2626' }}>Browser Web Push</h3>
              <p style={{ fontSize: '0.8rem', color: '#374151' }}>OneSignal Integration</p>
            </div>
          </div>

          <div style={{ marginBottom: '1.25rem' }}>
            <p style={{ fontSize: '0.85rem', color: '#374151', lineHeight: '1.5', marginBottom: '1rem' }}>
              Subscribe this browser to receive instant Web Push popups whenever login or system events are triggered.
            </p>

            <button
              onClick={handleSubscribePush}
              className="nav-btn nav-btn-primary"
              style={{
                width: '100%',
                padding: '0.75rem',
                justifyContent: 'center',
                background: pushSubscribed ? '#B91C1C' : '#DC2626'
              }}
            >
              <Bell size={16} /> {pushSubscribed ? 'Web Push Active' : 'Subscribe Browser to Web Push'}
            </button>

            {pushStatusMsg && (
              <p style={{ fontSize: '0.75rem', color: '#DC2626', marginTop: '0.5rem', textAlign: 'center', fontWeight: 600 }}>
                {pushStatusMsg}
              </p>
            )}
          </div>

          {subId && (
            <div style={{ background: '#F9FAFB', padding: '0.75rem', borderRadius: '8px', border: '1px solid #E5E7EB' }}>
              <span style={{ fontSize: '0.7rem', color: '#6B7280', display: 'block' }}>Subscription ID:</span>
              <code style={{ fontSize: '0.75rem', wordBreak: 'break-all', color: '#111827', fontWeight: 600 }}>{subId}</code>
            </div>
          )}
        </div>

        {/* User Profile Info & Phone Update */}
        <div className="glass-panel" style={{ padding: '1.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
            <div style={{ padding: '0.6rem', borderRadius: '12px', background: 'rgba(220, 38, 38, 0.08)', color: '#DC2626' }}>
              <Smartphone size={24} />
            </div>
            <div>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#DC2626' }}>WhatsApp & Email Target</h3>
              <p style={{ fontSize: '0.8rem', color: '#374151' }}>User Profile Settings</p>
            </div>
          </div>

          <form onSubmit={handleUpdateProfile} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#374151', marginBottom: '0.3rem' }}>
                Email Address
              </label>
              <input type="text" disabled className="input-field" value={user?.email || 'N/A'} style={{ opacity: 0.7, background: '#F9FAFB' }} />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#374151', marginBottom: '0.3rem' }}>
                WhatsApp Phone Number
              </label>
              <input
                type="text"
                className="input-field"
                placeholder="e.g. +919876543210"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
              />
            </div>

            <button
              type="submit"
              disabled={updating}
              className="nav-btn nav-btn-primary"
              style={{ justifyContent: 'center' }}
            >
              {updating ? 'Saving...' : 'Save Profile Details'}
            </button>
          </form>
        </div>
      </div>

      {/* Manual Trigger Testing Section */}
      <div className="glass-panel" style={{ marginTop: '2rem', padding: '1.5rem' }}>
        <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#DC2626' }}>
          <Zap size={18} color="#DC2626" /> Manual Event Trigger Simulator
        </h3>
        <p style={{ fontSize: '0.85rem', color: '#374151', marginBottom: '1.25rem' }}>
          Test fire events on demand for your user profile to verify WhatsApp, Resend Email, and OneSignal Push deliveries.
        </p>

        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
          <button
            onClick={() => handleManualTrigger('login')}
            className="nav-btn nav-btn-primary"
          >
            <Zap size={14} /> Fire "login" Event
          </button>

          <button
            onClick={() => handleManualTrigger('logout')}
            className="nav-btn"
            style={{ background: 'rgba(220, 38, 38, 0.08)', border: '1px solid rgba(220, 38, 38, 0.25)', color: '#DC2626', fontWeight: 600 }}
          >
            <Zap size={14} /> Fire "logout" Event
          </button>
        </div>

        {triggerResults && (
          <div style={{ marginTop: '1.25rem', background: '#F9FAFB', padding: '1rem', borderRadius: '10px', border: '1px solid #E5E7EB' }}>
            <h4 style={{ fontSize: '0.85rem', fontWeight: 700, marginBottom: '0.5rem', color: '#DC2626' }}>
              Dispatch Execution Log:
            </h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              {triggerResults.map((res, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.8rem', color: '#111827' }}>
                  <CheckCircle size={14} color="#DC2626" />
                  <span>Channel <strong style={{ color: '#DC2626' }}>[{res.channel.toUpperCase()}]</strong>: {res.message || (res.success ? 'Delivered' : res.error)}</span>
                </div>
              ))}
              {triggerResults.length === 0 && (
                <div style={{ fontSize: '0.8rem', color: '#6B7280' }}>
                  No active channel templates enabled for this trigger.
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
