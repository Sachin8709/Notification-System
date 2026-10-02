import React, { useState } from 'react';
import { api } from '../api/client';
import { Shield, Smartphone, Lock, User, Mail, ArrowRight, Zap, CheckCircle2 } from 'lucide-react';

export function Login({ onLoginSuccess }) {
  const [isRegister, setIsRegister] = useState(false);
  const [username, setUsername] = useState('admin');
  const [password, setPassword] = useState('password123');
  const [email, setEmail] = useState('admin@example.com');
  const [phone, setPhone] = useState('');
  const [firstName, setFirstName] = useState('Admin');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [dispatchAlert, setDispatchAlert] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setDispatchAlert(null);

    try {
      let res;
      if (isRegister) {
        res = await api.register({
          username,
          password,
          email,
          phone_number: phone,
          first_name: firstName,
        });
      } else {
        res = await api.login(username, password, phone);
      }

      if (res.dispatch_results && res.dispatch_results.length > 0) {
        setDispatchAlert(res.dispatch_results);
      }

      // Small delay to let user see trigger confirmation before redirect
      setTimeout(() => {
        onLoginSuccess(res.user, res.profile);
      }, 1200);

    } catch (err) {
      setError(err.message || 'Authentication failed. Please check backend server.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: 'calc(100vh - 75px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '2rem 1rem'
    }}>
      <div className="glass-panel" style={{ width: '100%', maxWidth: '440px', padding: '2.5rem' }}>
        
        {/* Logo Icon */}
        <div style={{ textAlign: 'center', marginBottom: '1.75rem' }}>
          <div style={{
            width: '54px',
            height: '54px',
            borderRadius: '16px',
            background: '#DC2626',
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 8px 20px rgba(220, 38, 38, 0.3)',
            marginBottom: '1rem'
          }}>
            <Shield size={28} color="#fff" />
          </div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 800, marginBottom: '0.25rem', color: '#DC2626' }}>
            {isRegister ? 'Create Account' : 'Welcome Back'}
          </h1>
          <p style={{ color: '#374151', fontSize: '0.875rem' }}>
            {isRegister ? 'Register to test multi-channel notification triggers' : 'Log in to trigger automated multi-channel alerts'}
          </p>
        </div>

        {/* Tab Switcher */}
        <div style={{
          display: 'flex',
          background: 'rgba(220, 38, 38, 0.05)',
          borderRadius: '10px',
          padding: '4px',
          marginBottom: '1.5rem',
          border: '1px solid rgba(220, 38, 38, 0.15)'
        }}>
          <button
            type="button"
            onClick={() => setIsRegister(false)}
            style={{
              flex: 1,
              padding: '0.5rem',
              borderRadius: '8px',
              border: 'none',
              background: !isRegister ? '#DC2626' : 'transparent',
              color: !isRegister ? '#ffffff' : '#374151',
              fontWeight: 600,
              fontSize: '0.85rem',
              cursor: 'pointer',
              transition: 'all 0.2s ease'
            }}
          >
            Sign In
          </button>
          <button
            type="button"
            onClick={() => setIsRegister(true)}
            style={{
              flex: 1,
              padding: '0.5rem',
              borderRadius: '8px',
              border: 'none',
              background: isRegister ? '#DC2626' : 'transparent',
              color: isRegister ? '#ffffff' : '#374151',
              fontWeight: 600,
              fontSize: '0.85rem',
              cursor: 'pointer',
              transition: 'all 0.2s ease'
            }}
          >
            Register
          </button>
        </div>

        {error && (
          <div style={{
            background: 'rgba(220, 38, 38, 0.08)',
            border: '1px solid rgba(220, 38, 38, 0.25)',
            color: '#DC2626',
            padding: '0.75rem 1rem',
            borderRadius: '8px',
            fontSize: '0.85rem',
            marginBottom: '1.25rem'
          }}>
            {error}
          </div>
        )}

        {dispatchAlert && (
          <div style={{
            background: 'rgba(220, 38, 38, 0.08)',
            border: '1px solid rgba(220, 38, 38, 0.25)',
            color: '#DC2626',
            padding: '0.75rem 1rem',
            borderRadius: '8px',
            fontSize: '0.85rem',
            marginBottom: '1.25rem'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontWeight: 700, marginBottom: '0.25rem' }}>
              <Zap size={14} /> Fired "login" Trigger!
            </div>
            {dispatchAlert.map((res, i) => (
              <div key={i} style={{ fontSize: '0.75rem', marginTop: '0.2rem' }}>
                • Channel [{res.channel}]: {res.message || (res.success ? 'Notification Sent' : res.error)}
              </div>
            ))}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div>
            <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.35rem' }}>
              Username
            </label>
            <div style={{ position: 'relative' }}>
              <input
                type="text"
                required
                className="input-field"
                style={{ paddingLeft: '2.5rem' }}
                placeholder="Username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
              />
              <User size={16} color="var(--text-muted)" style={{ position: 'absolute', left: '0.85rem', top: '50%', transform: 'translateY(-50%)' }} />
            </div>
          </div>

          {isRegister && (
            <>
              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.35rem' }}>
                  First Name
                </label>
                <input
                  type="text"
                  className="input-field"
                  placeholder="First name"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.35rem' }}>
                  Email Address
                </label>
                <div style={{ position: 'relative' }}>
                  <input
                    type="email"
                    required
                    className="input-field"
                    style={{ paddingLeft: '2.5rem' }}
                    placeholder="name@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                  <Mail size={16} color="var(--text-muted)" style={{ position: 'absolute', left: '0.85rem', top: '50%', transform: 'translateY(-50%)' }} />
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.35rem' }}>
                  WhatsApp Phone Number (E.164)
                </label>
                <div style={{ position: 'relative' }}>
                  <input
                    type="text"
                    className="input-field"
                    style={{ paddingLeft: '2.5rem' }}
                    placeholder="e.g. +919876543210"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                  />
                  <Smartphone size={16} color="var(--text-muted)" style={{ position: 'absolute', left: '0.85rem', top: '50%', transform: 'translateY(-50%)' }} />
                </div>
              </div>
            </>
          )}

          <div>
            <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.35rem' }}>
              Password
            </label>
            <div style={{ position: 'relative' }}>
              <input
                type="password"
                required
                className="input-field"
                style={{ paddingLeft: '2.5rem' }}
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <Lock size={16} color="var(--text-muted)" style={{ position: 'absolute', left: '0.85rem', top: '50%', transform: 'translateY(-50%)' }} />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="nav-btn nav-btn-primary"
            style={{
              width: '100%',
              padding: '0.85rem',
              justifyContent: 'center',
              marginTop: '0.5rem',
              fontSize: '0.95rem'
            }}
          >
            {loading ? 'Processing...' : isRegister ? 'Create Account & Login' : 'Sign In to Account'}
            {!loading && <ArrowRight size={16} />}
          </button>
        </form>
      </div>
    </div>
  );
}


