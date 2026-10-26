import React, { useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';

export default function Modal({
  isOpen,
  onClose,
  title,
  subtitle,
  children,
  footer = null,
  maxWidth = '560px',
}) {
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.body.style.overflow = 'unset';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const modalNode = (
    <div
      className="modal-backdrop-wrap"
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 1000,
        backgroundColor: 'rgba(5, 8, 15, 0.82)',
        backdropFilter: 'blur(8px)',
        WebkitBackdropFilter: 'blur(8px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '24px 16px',
        overflowY: 'auto',
        animation: 'fadeIn 0.2s ease forwards',
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        className="glass-card modal-container"
        style={{
          width: '100%',
          maxWidth: `min(calc(100vw - 32px), ${maxWidth})`,
          maxHeight: 'min(90vh, 760px)',
          margin: 'auto',
          display: 'flex',
          flexDirection: 'column',
          backgroundColor: '#111927',
          border: '1px solid var(--border-medium)',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.85), 0 0 35px rgba(99, 102, 241, 0.15)',
          borderRadius: 'var(--radius-xl)',
          overflow: 'hidden',
          animation: 'modalSlideUp 0.25s cubic-bezier(0.16, 1, 0.3, 1) forwards',
          flexShrink: 0,
        }}
      >
        {/* Modal Header */}
        <div
          className="modal-header-section"
          style={{
            padding: '16px 22px',
            borderBottom: '1px solid var(--border-subtle)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            backgroundColor: 'rgba(15, 23, 42, 0.95)',
            flexShrink: 0,
            gap: '12px',
          }}
        >
          <div style={{ minWidth: 0, flex: 1 }}>
            <h3 style={{ fontSize: 'clamp(1rem, 2.5vw, 1.15rem)', fontWeight: 700, color: '#ffffff', margin: 0, letterSpacing: '-0.01em', lineHeight: 1.3 }}>
              {title}
            </h3>
            {subtitle && (
              <p style={{ fontSize: 'clamp(0.72rem, 1.8vw, 0.8rem)', color: 'var(--text-muted)', margin: '4px 0 0', lineHeight: 1.35, wordBreak: 'break-word' }}>
                {subtitle}
              </p>
            )}
          </div>

          <button
            onClick={onClose}
            className="btn-ghost"
            style={{
              padding: '8px',
              borderRadius: 'var(--radius-sm)',
              color: 'var(--text-secondary)',
              flexShrink: 0,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              transition: 'background var(--transition-fast), color var(--transition-fast)',
            }}
            title="Close dialog"
            aria-label="Close dialog"
          >
            <X size={18} />
          </button>
        </div>

        {/* Modal Scrollable Body */}
        <div
          className="modal-body-section"
          style={{
            padding: '20px 22px',
            overflowY: 'auto',
            flex: '1 1 auto',
            minHeight: 0,
            WebkitOverflowScrolling: 'touch',
          }}
        >
          {children}
        </div>

        {/* Optional Sticky Footer */}
        {footer && (
          <div
            className="modal-footer-section"
            style={{
              padding: '12px 22px',
              borderTop: '1px solid var(--border-subtle)',
              backgroundColor: 'rgba(15, 23, 42, 0.95)',
              display: 'flex',
              justifyContent: 'flex-end',
              gap: '10px',
              flexShrink: 0,
              flexWrap: 'wrap',
            }}
          >
            {footer}
          </div>
        )}
      </div>
    </div>
  );

  return createPortal(modalNode, document.body);
}
