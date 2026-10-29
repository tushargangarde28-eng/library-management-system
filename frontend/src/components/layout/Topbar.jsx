import React, { useState, useRef, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { 
  Menu,
  RefreshCw,
  LogOut,
  User,
  Shield,
  ChevronDown
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export default function Topbar({ onRefresh, isRefreshing, apiStatus, onMobileToggle }) {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [profileOpen, setProfileOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setProfileOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/login', { replace: true });
  };

  const getPageInfo = () => {
    switch (location.pathname) {
      case '/books':
        return { title: 'Book Inventory', subtitle: 'Manage library catalog, ISBNs, and stock' };
      case '/members':
        return { title: 'Members Directory', subtitle: 'Manage library users, roles, and membership status' };
      case '/loans':
        return { title: 'Circulation & Loans', subtitle: 'Live book checkout, return processing, and patron loan tracking' };
      case '/reports':
        return { title: 'Overdue Audit & Penalties', subtitle: 'Real-time compliance monitoring, overdue fines and patron liability audit' };
      default:
        return { title: 'Executive Overview', subtitle: 'Real-time library metrics, inventory health & quick actions' };
    }
  };

  const { title, subtitle } = getPageInfo();

  // Compute display initials
  const initials = user?.name
    ? user.name
        .split(' ')
        .map((n) => n[0])
        .slice(0, 2)
        .join('')
        .toUpperCase()
    : 'AD';

  const userRole = user?.role || 'ADMIN';
  const userName = user?.name || 'Administrator';
  const userEmail = user?.email || 'admin@library.com';

  return (
    <header
      className="topbar-header"
      style={{
        height: 'var(--topbar-height)',
        backgroundColor: 'var(--bg-glass-strong)',
        backdropFilter: 'blur(12px)',
        WebkitBackdropFilter: 'blur(12px)',
        borderBottom: '1px solid var(--border-subtle)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 24px',
        position: 'sticky',
        top: 0,
        zIndex: 30,
        gap: '12px',
      }}
    >
      {/* Left: Mobile Hamburger & Page Title */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '14px', minWidth: 0 }}>
        {/* Hamburger Menu Toggle (Mobile / Tablet) */}
        <button
          onClick={onMobileToggle}
          className="btn-ghost topbar-hamburger"
          style={{
            padding: '8px',
            borderRadius: 'var(--radius-md)',
            color: 'var(--text-primary)',
          }}
          title="Open navigation menu"
        >
          <Menu size={22} />
        </button>

        <div style={{ overflow: 'hidden' }}>
          <h1 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-primary)', lineHeight: 1.2, margin: 0, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
            {title}
          </h1>
          <p className="topbar-subtitle" style={{ fontSize: '0.75rem', color: 'var(--text-muted)', margin: '2px 0 0', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
            {subtitle}
          </p>
        </div>
      </div>

      {/* Right Controls */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexShrink: 0 }}>
        {/* Backend Connectivity Status */}
        <div
          className="topbar-status-chip"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '5px 10px',
            borderRadius: 'var(--radius-full)',
            backgroundColor: 'var(--bg-surface-elevated)',
            border: '1px solid var(--border-subtle)',
            fontSize: '0.75rem',
            color: 'var(--text-secondary)',
          }}
          title="Spring Boot /api status"
        >
          <span
            style={{
              width: '8px',
              height: '8px',
              borderRadius: '50%',
              backgroundColor: apiStatus === 'online' ? 'var(--success)' : apiStatus === 'error' ? 'var(--danger)' : 'var(--warning)',
              boxShadow: apiStatus === 'online' ? '0 0 8px var(--success)' : 'none',
              flexShrink: 0,
            }}
          />
          <span className="topbar-status-text" style={{ fontWeight: 500 }}>
            {apiStatus === 'online' ? 'Live' : apiStatus === 'error' ? 'Offline' : '...'}
          </span>
        </div>

        {/* Global Sync Trigger */}
        {onRefresh && (
          <button
            onClick={onRefresh}
            disabled={isRefreshing}
            className="btn btn-secondary"
            style={{
              padding: '6px 10px',
              fontSize: '0.8rem',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
            }}
            title="Refresh metrics from backend"
          >
            <RefreshCw size={14} className={isRefreshing ? 'animate-spin' : ''} />
            <span className="topbar-sync-label">Sync</span>
          </button>
        )}

        <div style={{ width: '1px', height: '22px', backgroundColor: 'var(--border-subtle)' }} />

        {/* User Profile Dropdown */}
        <div ref={dropdownRef} style={{ position: 'relative' }}>
          <button
            onClick={() => setProfileOpen((prev) => !prev)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '4px 8px 4px 4px',
              borderRadius: 'var(--radius-full)',
              background: profileOpen ? 'var(--bg-surface-hover)' : 'transparent',
              border: '1px solid',
              borderColor: profileOpen ? 'var(--border-medium)' : 'transparent',
              transition: 'all var(--transition-fast)',
              cursor: 'pointer',
            }}
            title={`Logged in as ${userName} (${userRole})`}
          >
            <div
              style={{
                width: '34px',
                height: '34px',
                borderRadius: '50%',
                background: userRole === 'ADMIN' 
                  ? 'linear-gradient(135deg, #4f46e5 0%, #06b6d4 100%)' 
                  : 'linear-gradient(135deg, #059669 0%, #10b981 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 700,
                fontSize: '0.8rem',
                color: '#ffffff',
                boxShadow: '0 2px 6px rgba(99, 102, 241, 0.3)',
                flexShrink: 0,
              }}
            >
              {initials}
            </div>
            <div className="topbar-admin-details" style={{ display: 'flex', flexDirection: 'column', textAlign: 'left' }}>
              <span style={{ fontSize: '0.825rem', fontWeight: 600, color: 'var(--text-primary)', lineHeight: 1.2 }}>
                {userName}
              </span>
              <span style={{ fontSize: '0.68rem', color: userRole === 'ADMIN' ? '#818cf8' : '#34d399', fontWeight: 600 }}>
                {userRole}
              </span>
            </div>
            <ChevronDown size={14} style={{ color: 'var(--text-muted)', marginLeft: '2px' }} />
          </button>

          {/* Floating Dropdown Menu */}
          {profileOpen && (
            <div
              className="glass-card animate-fade-in"
              style={{
                position: 'absolute',
                top: 'calc(100% + 8px)',
                right: 0,
                width: '240px',
                padding: '12px',
                backgroundColor: 'var(--bg-surface-elevated)',
                border: '1px solid var(--border-medium)',
                boxShadow: 'var(--shadow-lg)',
                borderRadius: 'var(--radius-md)',
                zIndex: 60,
              }}
            >
              <div style={{ paddingBottom: '10px', borderBottom: '1px solid var(--border-subtle)', marginBottom: '8px' }}>
                <div style={{ fontSize: '0.875rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                  {userName}
                </div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {userEmail}
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '6px' }}>
                  <span
                    className={`badge ${userRole === 'ADMIN' ? 'badge-info' : 'badge-active'}`}
                    style={{ fontSize: '0.68rem', padding: '2px 8px' }}
                  >
                    <Shield size={10} />
                    {userRole}
                  </span>
                  {user?.memberId && (
                    <span style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>
                      ID #{user.memberId}
                    </span>
                  )}
                </div>
              </div>

              <button
                onClick={handleLogout}
                className="btn btn-ghost"
                style={{
                  width: '100%',
                  justifyContent: 'flex-start',
                  color: 'var(--danger)',
                  padding: '8px 10px',
                  borderRadius: 'var(--radius-sm)',
                  fontSize: '0.825rem',
                }}
              >
                <LogOut size={15} />
                <span>Sign Out of Portal</span>
              </button>
            </div>
          )}
        </div>
      </div>

      <style>{`
        @media (max-width: 1024px) {
          .topbar-hamburger {
            display: flex !important;
          }
        }
        @media (min-width: 1025px) {
          .topbar-hamburger {
            display: none !important;
          }
        }
        @media (max-width: 640px) {
          .topbar-subtitle {
            display: none !important;
          }
          .topbar-admin-details {
            display: none !important;
          }
          .topbar-sync-label {
            display: none !important;
          }
          .topbar-header {
            padding: 0 14px !important;
          }
        }
      `}</style>
    </header>
  );
}
