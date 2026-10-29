import React from 'react';
import { NavLink } from 'react-router-dom';
import { 
  LayoutDashboard, 
  BookOpen, 
  Users, 
  ArrowLeftRight,
  Library, 
  ChevronLeft, 
  ChevronRight,
  Server,
  X,
  AlertTriangle
} from 'lucide-react';

export default function Sidebar({ collapsed, onToggle, mobileOpen, onMobileClose }) {
  const navItems = [
    {
      to: '/',
      label: 'Dashboard',
      icon: LayoutDashboard,
      badge: null,
    },
    {
      to: '/books',
      label: 'Book Inventory',
      icon: BookOpen,
      badge: 'Catalog',
    },
    {
      to: '/members',
      label: 'Members Directory',
      icon: Users,
      badge: 'Directory',
    },
    {
      to: '/loans',
      label: 'Circulation & Loans',
      icon: ArrowLeftRight,
      badge: 'Active',
    },
    {
      to: '/reports',
      label: 'Overdue Reports',
      icon: AlertTriangle,
      badge: 'Audit',
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
              background: 'linear-gradient(135deg, #6366f1 0%, #3b82f6 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#ffffff',
              boxShadow: '0 0 16px rgba(99, 102, 241, 0.4)',
              flexShrink: 0,
            }}
          >
            <Library size={20} />
          </div>

          {!collapsed && (
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <span style={{ fontWeight: 900, fontSize: '1.2rem', letterSpacing: '-0.03em', color: '#ffffff', display: 'flex', alignItems: 'center' }}>
                Libri<span style={{ background: 'linear-gradient(135deg, #818cf8 0%, #38bdf8 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>x</span>
              </span>
              <span style={{ fontSize: '0.62rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 700 }}>
                Enterprise LMS
              </span>
            </div>
          )}
        </div>

        {/* Close Button on Mobile Drawer, Collapse button on Desktop */}
        <div style={{ display: 'flex', alignItems: 'center' }}>
          {/* Mobile Close Button */}
          <button
            onClick={onMobileClose}
            className="btn-ghost mobile-close-btn"
            style={{
              padding: '6px',
              borderRadius: 'var(--radius-sm)',
              color: 'var(--text-secondary)',
            }}
            title="Close navigation"
          >
            <X size={20} />
          </button>

          {/* Desktop Collapse Button */}
          {!collapsed && (
            <button
              onClick={onToggle}
              className="btn-ghost desktop-collapse-btn"
              style={{
                padding: '6px',
                borderRadius: 'var(--radius-sm)',
                color: 'var(--text-secondary)',
              }}
              title="Collapse sidebar"
            >
              <ChevronLeft size={18} />
            </button>
          )}
        </div>
      </div>

      {/* Main Navigation */}
      <div style={{ flex: 1, padding: '16px 10px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
        {!collapsed && (
          <span
            style={{
              fontSize: '0.7rem',
              fontWeight: 700,
              textTransform: 'uppercase',
              letterSpacing: '0.06em',
              color: 'var(--text-muted)',
              padding: '0 12px 6px',
            }}
          >
            Management
          </span>
        )}

        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === '/'}
              onClick={onMobileClose}
              style={({ isActive }) => ({
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                padding: collapsed ? '12px 0' : '10px 14px',
                justifyContent: collapsed ? 'center' : 'flex-start',
                borderRadius: 'var(--radius-md)',
                color: isActive ? '#ffffff' : 'var(--text-secondary)',
                backgroundColor: isActive ? 'var(--primary-light)' : 'transparent',
                border: isActive ? '1px solid rgba(99, 102, 241, 0.3)' : '1px solid transparent',
                fontWeight: isActive ? 600 : 500,
                fontSize: '0.875rem',
                transition: 'all var(--transition-fast)',
                position: 'relative',
              })}
              title={collapsed ? item.label : undefined}
            >
              {({ isActive }) => (
                <>
                  <Icon
                    size={20}
                    style={{
                      color: isActive ? '#818cf8' : 'currentColor',
                      flexShrink: 0,
                    }}
                  />

                  {!collapsed && (
                    <span style={{ flex: 1, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {item.label}
                    </span>
                  )}

                  {!collapsed && item.badge && !isActive && (
                    <span
                      style={{
                        fontSize: '0.65rem',
                        fontWeight: 600,
                        padding: '2px 6px',
                        borderRadius: 'var(--radius-sm)',
                        backgroundColor: 'rgba(255, 255, 255, 0.05)',
                        color: 'var(--text-muted)',
                      }}
                    >
                      {item.badge}
                    </span>
                  )}

                  {isActive && (
                    <div
                      style={{
                        position: 'absolute',
                        right: 0,
                        top: '15%',
                        bottom: '15%',
                        width: '3px',
                        borderRadius: '4px 0 0 4px',
                        backgroundColor: 'var(--primary)',
                        boxShadow: '0 0 8px var(--primary)',
                      }}
                    />
                  )}
                </>
              )}
            </NavLink>
          );
        })}
      </div>

      {/* Expand Button for Desktop Collapsed State */}
      {collapsed && (
        <div style={{ padding: '12px', display: 'flex', justifyContent: 'center' }}>
          <button
            onClick={onToggle}
            className="btn-ghost desktop-collapse-btn"
            style={{
              padding: '8px',
              borderRadius: 'var(--radius-md)',
              color: 'var(--text-secondary)',
            }}
            title="Expand sidebar"
          >
            <ChevronRight size={18} />
          </button>
        </div>
      )}

      {/* System Status Footnote */}
      <div
        style={{
          padding: collapsed ? '12px 6px' : '16px',
          borderTop: '1px solid var(--border-subtle)',
          backgroundColor: 'rgba(10, 14, 23, 0.4)',
        }}
      >
        {collapsed ? (
          <div style={{ display: 'flex', justifyContent: 'center' }} title="Spring Boot REST API Connected">
            <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: 'var(--success)' }} />
          </div>
        ) : (
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div
              style={{
                width: '32px',
                height: '32px',
                borderRadius: 'var(--radius-sm)',
                backgroundColor: 'rgba(16, 185, 129, 0.12)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'var(--success)',
                flexShrink: 0,
              }}
            >
              <Server size={16} />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', minWidth: 0 }}>
              <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-primary)', whiteSpace: 'nowrap' }}>
                REST Backend
              </span>
              <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>
                Spring Boot :8080
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Mobile-specific styles applied directly */}
      <style>{`
        @media (max-width: 1024px) {
          .sidebar-nav {
            position: fixed !important;
            top: 0 !important;
            left: 0 !important;
            bottom: 0 !important;
            height: 100vh !important;
            width: 260px !important;
            z-index: 50 !important;
            transform: translateX(-100%);
            box-shadow: 0 0 30px rgba(0, 0, 0, 0.7);
          }
          .sidebar-nav.mobile-open {
            transform: translateX(0) !important;
          }
          .desktop-collapse-btn {
            display: none !important;
          }
          .mobile-close-btn {
            display: block !important;
          }
        }
        @media (min-width: 1025px) {
          .mobile-close-btn {
            display: none !important;
          }
          .desktop-collapse-btn {
            display: block !important;
          }
        }
      `}</style>
    </aside>
  );
}
