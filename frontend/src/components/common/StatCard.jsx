import React from 'react';

export default function StatCard({
  title,
  value,
  subtitle,
  icon: Icon,
  color = 'primary', // 'primary' | 'success' | 'warning' | 'info' | 'danger'
  loading = false,
  badgeText = null,
  onClick = null,
}) {
  const colorMap = {
    primary: {
      bg: 'rgba(99, 102, 241, 0.12)',
      text: '#818cf8',
      border: 'rgba(99, 102, 241, 0.25)',
      glow: '0 4px 20px -2px rgba(99, 102, 241, 0.2)',
    },
    success: {
      bg: 'rgba(16, 185, 129, 0.12)',
      text: '#34d399',
      border: 'rgba(16, 185, 129, 0.25)',
      glow: '0 4px 20px -2px rgba(16, 185, 129, 0.2)',
    },
    warning: {
      bg: 'rgba(245, 158, 11, 0.12)',
      text: '#fbbf24',
      border: 'rgba(245, 158, 11, 0.25)',
      glow: '0 4px 20px -2px rgba(245, 158, 11, 0.2)',
    },
    info: {
      bg: 'rgba(6, 182, 212, 0.12)',
      text: '#38bdf8',
      border: 'rgba(6, 182, 212, 0.25)',
      glow: '0 4px 20px -2px rgba(6, 182, 212, 0.2)',
    },
    danger: {
      bg: 'rgba(239, 68, 68, 0.12)',
      text: '#f87171',
      border: 'rgba(239, 68, 68, 0.25)',
      glow: '0 4px 20px -2px rgba(239, 68, 68, 0.2)',
    },
  };

  const scheme = colorMap[color] || colorMap.primary;

  return (
    <div
      className="glass-card"
      onClick={onClick}
      style={{
        padding: '24px',
        position: 'relative',
        overflow: 'hidden',
        cursor: onClick ? 'pointer' : 'default',
        transition: 'all var(--transition-base)',
      }}
      onMouseEnter={(e) => {
        if (onClick) {
          e.currentTarget.style.transform = 'translateY(-2px)';
          e.currentTarget.style.boxShadow = scheme.glow;
        }
      }}
      onMouseLeave={(e) => {
        if (onClick) {
          e.currentTarget.style.transform = 'translateY(0)';
          e.currentTarget.style.boxShadow = 'var(--shadow-md)';
        }
      }}
    >
      {/* Background soft ambient glow */}
      <div
        style={{
          position: 'absolute',
          top: '-20%',
          right: '-10%',
          width: '120px',
          height: '120px',
          background: scheme.bg,
          filter: 'blur(40px)',
          borderRadius: '50%',
          pointerEvents: 'none',
        }}
      />

      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '14px' }}>
        <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)' }}>
          {title}
        </span>

        {Icon && (
          <div
            style={{
              width: '42px',
              height: '42px',
              borderRadius: 'var(--radius-md)',
              backgroundColor: scheme.bg,
              border: `1px solid ${scheme.border}`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: scheme.text,
              flexShrink: 0,
            }}
          >
            <Icon size={22} />
          </div>
        )}
      </div>

      <div style={{ display: 'flex', alignItems: 'baseline', gap: '10px' }}>
        {loading ? (
          <div className="skeleton" style={{ width: '90px', height: '36px', marginBottom: '6px' }} />
        ) : (
          <div style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.03em' }}>
            {value}
          </div>
        )}

        {badgeText && !loading && (
          <span
            style={{
              fontSize: '0.75rem',
              fontWeight: 600,
              padding: '2px 8px',
              borderRadius: 'var(--radius-full)',
              backgroundColor: scheme.bg,
              color: scheme.text,
              border: `1px solid ${scheme.border}`,
            }}
          >
            {badgeText}
          </span>
        )}
      </div>

      {subtitle && (
        <div style={{ marginTop: '8px', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
          {loading ? (
            <div className="skeleton" style={{ width: '130px', height: '14px' }} />
          ) : (
            subtitle
          )}
        </div>
      )}
    </div>
  );
}
