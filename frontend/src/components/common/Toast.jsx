import React from 'react';
import { CheckCircle2, AlertTriangle, XCircle, X } from 'lucide-react';

export default function Toast({ toast, message, type, onClose }) {
  const activeToast = toast || (message ? { message, type: type || 'success' } : null);
  if (!activeToast) return null;

  const icons = {
    success: <CheckCircle2 size={18} color="var(--success)" style={{ flexShrink: 0 }} />,
    error: <XCircle size={18} color="var(--danger)" style={{ flexShrink: 0 }} />,
    warning: <AlertTriangle size={18} color="var(--warning)" style={{ flexShrink: 0 }} />,
  };

  const borders = {
    success: 'rgba(16, 185, 129, 0.4)',
    error: 'rgba(239, 68, 68, 0.4)',
    warning: 'rgba(245, 158, 11, 0.4)',
  };

  return (
    <div
      className="toast-notification"
      style={{
        position: 'fixed',
        bottom: '20px',
        right: '20px',
        zIndex: 200,
        backgroundColor: '#111827',
        border: `1px solid ${borders[activeToast.type] || borders.success}`,
        borderRadius: 'var(--radius-md)',
        padding: '12px 16px',
        boxShadow: '0 10px 30px -5px rgba(0, 0, 0, 0.7), 0 0 15px rgba(99, 102, 241, 0.1)',
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        maxWidth: 'min(440px, calc(100vw - 32px))',
        animation: 'fadeIn 0.25s ease forwards',
      }}
    >
      {icons[activeToast.type] || icons.success}
      <div style={{ flex: 1, fontSize: '0.875rem', color: 'var(--text-primary)', wordBreak: 'break-word', lineHeight: 1.4 }}>
        {activeToast.message}
      </div>
      <button
        onClick={onClose}
        className="btn-ghost"
        style={{ padding: '4px', borderRadius: 'var(--radius-sm)', color: 'var(--text-muted)', flexShrink: 0 }}
        title="Dismiss notification"
      >
        <X size={15} />
      </button>
    </div>
  );
}

