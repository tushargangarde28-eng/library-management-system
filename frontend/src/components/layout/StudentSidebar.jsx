import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, 
  BookOpen, 
  BookmarkCheck, 
  GraduationCap, 
  LogOut, 
  ChevronLeft, 
  ChevronRight,
  Server,
  X,
  User,
  ShieldAlert
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export default function StudentSidebar({ collapsed, onToggle, mobileOpen, onMobileClose }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login', { replace: true });
  };

  const navItems = [
    {
      to: '/student/dashboard',
      label: 'My Dashboard',
      icon: LayoutDashboard,
      badge: 'Home',
    },
    {
      to: '/student/books',
      label: 'Search Books',
      icon: BookOpen,
      badge: 'Catalog',
    },
    {
      to: '/student/loans',
      label: 'Borrowing History',
      icon: BookmarkCheck,
      badge: 'History',
    },
  ];

  return (
    <aside
      className={`sidebar-nav ${mobileOpen ? 'mobile-open' : ''}`}
      style={{
        width: collapsed ? 'var(--sidebar-collapsed-width)' : 'var(--sidebar-width)',
        minHeight: '100vh',
        backgroundColor: 'var(--bg-sidebar)',
        borderRight: '1px solid var(--border-subtle)',
        display: 'flex',
        flexDirection: 'column',
        transition: 'width var(--transition-base), transform var(--transition-base)',
        position: 'sticky',
        top: 0,
        zIndex: 40,
      }}
    >
      {/* Brand Header */}
      <div
        style={{
          height: 'var(--topbar-height)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: collapsed ? 'center' : 'space-between',
          padding: collapsed ? '0' : '0 20px',
          borderBottom: '1px solid var(--border-subtle)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', overflow: 'hidden' }}>
          <div
            style={{
              width: '38px',
              height: '38px',
              borderRadius: 'var(--radius-md)',
              background: 'linear-gradient(135deg, #059669 0%, #10b981 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#ffffff',
              boxShadow: '0 0 16px rgba(16, 185, 129, 0.4)',
              flexShrink: 0,
            }}
          >
            <GraduationCap size={22} />
          </div>

          {!collapsed && (
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <span style={{ fontWeight: 800, fontSize: '1.05rem', letterSpacing: '-0.02em', color: '#ffffff' }}>
                Libri<span style={{ color: '#34d399' }}>Campus</span>
              </span>
              <span style={{ fontSize: '0.65rem', color: '#10b981', textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 700 }}>
                Student Portal
              </span>
            </div>
          )}
        </div>

        {/* Mobile close button */}
        {mobileOpen && (
          <button
            onClick={onMobileClose}
            className="mobile-close-btn btn-ghost"
            style={{ padding: '6px', color: 'var(--text-secondary)' }}
            title="Close menu"
          >
            <X size={20} />
          </button>
        )}
      </div>

      {/* Navigation Links */}
      <nav style={{ flex: 1, padding: '16px 10px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
        <div
          style={{
            fontSize: '0.68rem',
            fontWeight: 700,
            color: 'var(--text-muted)',
            textTransform: 'uppercase',
            letterSpacing: '0.08em',
            padding: collapsed ? '0' : '6px 12px 4px',
            textAlign: collapsed ? 'center' : 'left',
          }}
        >
          {collapsed ? '•••' : 'Patron Workspace'}
        </div>

        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            onClick={() => {
              if (mobileOpen) onMobileClose();
            }}
            style={({ isActive }) => ({
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              padding: collapsed ? '12px 0' : '10px 14px',
              justifyContent: collapsed ? 'center' : 'flex-start',
              borderRadius: 'var(--radius-md)',
              color: isActive ? '#34d399' : 'var(--text-secondary)',
              backgroundColor: isActive ? 'rgba(16, 185, 129, 0.12)' : 'transparent',
              border: isActive ? '1px solid rgba(16, 185, 129, 0.25)' : '1px solid transparent',
              fontWeight: isActive ? 700 : 500,
              fontSize: '0.875rem',
              transition: 'all var(--transition-fast)',
              position: 'relative',
            })}
            title={collapsed ? item.label : undefined}
          >
            {({ isActive }) => (
              <>
                <item.icon size={19} style={{ flexShrink: 0, color: isActive ? '#34d399' : 'inherit' }} />
                {!collapsed && (
                  <span style={{ flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {item.label}
                  </span>
                )}
                {!collapsed && item.badge && (
                  <span
                    style={{
                      fontSize: '0.65rem',
                      padding: '2px 6px',
                      borderRadius: 'var(--radius-full)',
                      backgroundColor: isActive ? 'rgba(16, 185, 129, 0.25)' : 'rgba(255, 255, 255, 0.06)',
                      color: isActive ? '#a7f3d0' : 'var(--text-muted)',
                      fontWeight: 600,
                    }}
                  >
                    {item.badge}
                  </span>
                )}
              </>
            )}
          </NavLink>
        ))}
      </nav>

      {/* Student Session Card in Sidebar */}
      {!collapsed && (
        <div
          style={{
            margin: '0 10px 12px',
            padding: '12px',
            background: 'var(--bg-surface-elevated)',
            border: '1px solid var(--border-subtle)',
            borderRadius: 'var(--radius-md)',
            display: 'flex',
            flexDirection: 'column',
            gap: '8px',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div
              style={{
                width: '32px',
                height: '32px',
                borderRadius: '50%',
                background: 'linear-gradient(135deg, #059669 0%, #10b981 100%)',
                color: '#ffffff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 700,
                fontSize: '0.78rem',
                flexShrink: 0,
              }}
            >
              {user?.name ? user.name.slice(0, 2).toUpperCase() : 'ST'}
            </div>
            <div style={{ minWidth: 0, flex: 1 }}>
              <div style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-primary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {user?.name || 'Student Patron'}
              </div>
              <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>
                ID #{user?.memberId || 'N/A'} • Student
              </div>
            </div>
          </div>

          <button
            onClick={handleLogout}
            className="btn btn-ghost"
            style={{
              padding: '6px 8px',
              fontSize: '0.75rem',
              color: 'var(--danger)',
              justifyContent: 'flex-start',
              width: '100%',
              borderRadius: 'var(--radius-sm)',
            }}
          >
            <LogOut size={14} />
            <span>Sign Out</span>
          </button>
        </div>
      )}

      {/* Collapse Toggle for Desktop */}
      <div
        className="desktop-collapse-btn"
        style={{
          padding: '10px 14px',
          borderTop: '1px solid var(--border-subtle)',
          display: 'flex',
          justifyContent: collapsed ? 'center' : 'flex-end',
        }}
      >
        <button
          onClick={onToggle}
          className="btn-ghost"
          style={{
            padding: '6px',
            borderRadius: 'var(--radius-sm)',
            color: 'var(--text-secondary)',
          }}
          title={collapsed ? 'Expand menu' : 'Collapse menu'}
        >
          {collapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
        </button>
      </div>

      {/* Backend Status Footnote */}
      <div
        style={{
          padding: collapsed ? '10px 6px' : '12px 16px',
          borderTop: '1px solid var(--border-subtle)',
          backgroundColor: 'rgba(10, 14, 23, 0.4)',
        }}
      >
        {collapsed ? (
          <div style={{ display: 'flex', justifyContent: 'center' }} title="Student Portal Connected">
            <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: 'var(--success)' }} />
          </div>
        ) : (
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: 'var(--success)', boxShadow: '0 0 8px var(--success)', flexShrink: 0 }} />
            <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
              Spring Boot API :8080 Live
            </span>
          </div>
        )}
      </div>
    </aside>
  );
}
