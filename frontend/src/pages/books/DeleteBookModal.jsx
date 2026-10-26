import React, { useState } from 'react';
import Modal from '../../components/common/Modal';
import { AlertTriangle, Loader2 } from 'lucide-react';

export default function DeleteBookModal({ isOpen, onClose, book, onConfirm, isDeleting }) {
  const [deleteError, setDeleteError] = useState(null);

  if (!book) return null;

  const handleDelete = async () => {
    setDeleteError(null);
    try {
      await onConfirm(book.bookId);
    } catch (err) {
      console.error('[DeleteBookModal Error]:', err);
      setDeleteError(err.message || 'Unable to delete book record.');
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Delete Book Record"
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
            <AlertTriangle size={22} />
          </div>

          <div>
            <p style={{ fontSize: '0.925rem', color: 'var(--text-primary)', fontWeight: 600, margin: 0 }}>
              Are you sure you want to remove this book?
            </p>
            <p style={{ fontSize: '0.825rem', color: 'var(--text-secondary)', marginTop: '6px', lineHeight: 1.5 }}>
              You are about to permanently delete <strong style={{ color: '#ffffff' }}>"{book.title}"</strong> (ISBN: {book.isbn}).
              This action cannot be undone.
            </p>
          </div>
        </div>

        {deleteError && (
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
            {deleteError}
          </div>
        )}

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '8px' }}>
          <button
            type="button"
            onClick={onClose}
            disabled={isDeleting}
            className="btn btn-secondary"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleDelete}
            disabled={isDeleting}
            className="btn btn-danger"
            style={{ minWidth: '110px' }}
          >
            {isDeleting ? (
              <>
                <Loader2 size={16} className="animate-spin" style={{ animation: 'spin 1s linear infinite' }} />
                <span>Deleting...</span>
              </>
            ) : (
              <span>Confirm Delete</span>
            )}
          </button>
        </div>
      </div>
    </Modal>
  );
}
