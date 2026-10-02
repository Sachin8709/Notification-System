import React, { useState, useEffect, useRef } from 'react';
import { api } from './api/client';
import { Login } from './pages/Login';
import { Home } from './pages/Home';
import { NotificationSettings } from './pages/NotificationSettings';
import { Bell, Home as HomeIcon, Settings, LogOut, User } from 'lucide-react';

export function App() {
  const [user, setUser] = useState(() => {
    const u = localStorage.getItem('user');
    return u ? JSON.parse(u) : null;
  });

  const [profile, setProfile] = useState(() => {
    const p = localStorage.getItem('profile');
    return p ? JSON.parse(p) : null;
  });

  const [currentPage, setCurrentPage] = useState(() => {
    return localStorage.getItem('token') ? 'home' : 'login';
  });

  // State for profile dropdown
  const [accountDropdownOpen, setAccountDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setAccountDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Verify auth on mount if token exists
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      api.getMe()
        .then((res) => {
          setUser(res.user);
          setProfile(res.profile);
          localStorage.setItem('user', JSON.stringify(res.user));
          localStorage.setItem('profile', JSON.stringify(res.profile));
        })
        .catch((err) => {
          // Only log out if it's an explicit authentication error (401/403)
          if (err.status === 401 || err.status === 403) {
            localStorage.removeItem('token');
            setUser(null);
            setProfile(null);
            setCurrentPage('login');
          } else {
            console.error('Non-auth error checking profile:', err);
          }
        });
    }
  }, []);

  const handleLoginSuccess = async (userObj, profileObj) => {
    // Show immediate optimistic UI state
    setUser(userObj);
    setProfile(profileObj);
    setCurrentPage('home');

    // Make an immediate background request to fetch absolute latest DB state
    try {
      const res = await api.getMe();
      setUser(res.user);
      setProfile(res.profile);
      localStorage.setItem('user', JSON.stringify(res.user));
      localStorage.setItem('profile', JSON.stringify(res.profile));
    } catch (e) {
      console.warn('Failed to fetch fresh user data immediately after login', e);
    }
  };

  const handleLogout = async () => {
    setAccountDropdownOpen(false);
    try {
      await api.logout();
    } catch (e) {
      console.error(e);
    }
    setUser(null);
    setProfile(null);
    setCurrentPage('login');
  };

  const handleProfileUpdate = (updatedUser, updatedProfile) => {
    setUser(updatedUser);
    setProfile(updatedProfile);
    localStorage.setItem('user', JSON.stringify(updatedUser));
    localStorage.setItem('profile', JSON.stringify(updatedProfile));
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      
      {/* Top Header Navigation */}
      <header className="app-header">
        {/* Brand Logo */}
        <div className="brand-logo" style={{ cursor: 'pointer' }} onClick={() => setCurrentPage(user ? 'home' : 'login')}>
          <div style={{
            width: '36px',
            height: '36px',
            borderRadius: '10px',
            background: '#DC2626',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 4px 12px rgba(220, 38, 38, 0.3)'
          }}>
            <Bell size={18} color="#fff" />
          </div>
          <span style={{ color: '#DC2626', fontWeight: 800, fontSize: '1.15rem' }}>Notification System</span>
        </div>

        {/* Right Nav & Account Group */}
        {user ? (
          <div className="header-right-nav">
            <nav className="nav-links-row">
              <button
                onClick={() => setCurrentPage('home')}
                className={`nav-btn ${currentPage === 'home' ? 'active' : ''}`}
              >
                <HomeIcon size={16} /> Home
              </button>

              <button
                onClick={() => setCurrentPage('settings')}
                className={`nav-btn ${currentPage === 'settings' ? 'active' : ''}`}
              >
                <Settings size={16} /> Template Settings
              </button>
            </nav>

            <div className="account-dropdown-container" ref={dropdownRef}>
              <button
                type="button"
                className="avatar-btn"
                onClick={() => setAccountDropdownOpen(!accountDropdownOpen)}
                title="Account Profile"
              >
                {user.username.charAt(0).toUpperCase()}
              </button>

              {/* Profile Popover Dropdown - ONLY Name, Email, and Sign Out */}
              {accountDropdownOpen && (
                <div className="account-dropdown-menu">
                  <div className="dropdown-user-header">
                    <div className="user-avatar" style={{ width: '38px', height: '38px', fontSize: '1rem' }}>
                      {user.username.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <div style={{ fontWeight: 700, fontSize: '0.95rem', color: '#111827' }}>
                        {user.first_name || user.username}
                      </div>
                      <div style={{ fontSize: '0.75rem', color: '#6B7280', wordBreak: 'break-all' }}>
                        {user.email}
                      </div>
                    </div>
                  </div>

                  <button
                    className="dropdown-item danger"
                    onClick={handleLogout}
                  >
                    <LogOut size={16} /> Sign Out
                  </button>
                </div>
              )}
            </div>
          </div>
        ) : (
          <button
            onClick={() => setCurrentPage('login')}
            className="nav-btn nav-btn-primary"
          >
            <User size={16} /> Sign In
          </button>
        )}
      </header>

      {/* Main Content Area */}
      <main style={{ flex: 1 }}>
        {!user ? (
          <Login onLoginSuccess={handleLoginSuccess} />
        ) : (
          <>
            {(currentPage === 'home' || currentPage === 'login') && (
              <Home
                user={user}
                profile={profile}
                onLogout={handleLogout}
                onProfileUpdate={handleProfileUpdate}
              />
            )}
            {currentPage === 'settings' && <NotificationSettings />}
          </>
        )}
      </main>
    </div>
  );
}
