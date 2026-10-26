import React, { useState } from 'react';
import Modal from '../../components/common/Modal';
import { UserX, Loader2 } from 'lucide-react';

export default function DeactivateMemberModal({ isOpen, onClose, member, onConfirm, isSubmitting }) {
  const [error, setError] = useState(null);

  if (!member) return null;

  const handleDeactivate = async () => {
    setError(null);
    try {
      await onConfirm(member.memberId);
    } catch (err) {
      console.error('[DeactivateMemberModal Error]:', err);
      setError(err.message || 'Unable to deactivate member account.');
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Deactivate Patron Account"
      maxWidth="480px"
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <div style={{ display: 'flex', gap: '14px', alignItems: 'flex-start' }}>
          <div
            style={{
              width: '40px',
              height: '40px',
              borderRadius: 'var(--radius-md)',
              backgroundColor: 'var(--danger-light)',
              color: 'var(--danger)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}
          >
            <UserX size={22} />
          </div>

          <div>
            <p style={{ fontSize: '0.925rem', color: 'var(--text-primary)', fontWeight: 600, margin: 0 }}>
              Confirm Deactivation of {member.name}?
            </p>
            <p style={{ fontSize: '0.825rem', color: 'var(--text-secondary)', marginTop: '6px', lineHeight: 1.5 }}>
              The account for <strong style={{ color: '#ffffff' }}>"{member.email}"</strong> will be marked as{' '}
              <strong style={{ color: 'var(--danger)' }}>INACTIVE</strong>.
              The patron will no longer be eligible to borrow books until reinstated by an administrator.
            </p>
          </div>
        </div>

        {error && (
          <div
            style={{
              padding: '10px 14px',
              borderRadius: 'var(--radius-md)',
              backgroundColor: 'var(--danger-light)',
              border: '1px solid rgba(239, 68, 68, 0.3)',
              color: 'var(--danger)',
              fontSize: '0.8rem',
            }}
          >
            {error}
          </div>
        )}

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '8px' }}>
          <button
            type="button"
            onClick={onClose}
            disabled={isSubmitting}
            className="btn btn-secondary"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleDeactivate}
            disabled={isSubmitting}
            className="btn btn-danger"
            style={{ minWidth: '130px' }}
          >
            {isSubmitting ? (
              <>
                <Loader2 size={16} className="animate-spin" style={{ animation: 'spin 1s linear infinite' }} />
                <span>Deactivating...</span>
              </>
            ) : (
              <span>Deactivate Account</span>
            )}
          </button>
        </div>
      </div>
    </Modal>
  );
}
