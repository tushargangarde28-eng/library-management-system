import React, { useState, useEffect } from 'react';
import Modal from '../../components/common/Modal';
import {
  BookOpen,
  Calendar,
  Clock,
  IndianRupee,
  CheckCircle2,
  AlertTriangle,
  Loader2,
  ShieldAlert,
  Info
} from 'lucide-react';
import { loanService } from '../../api/loanService';

export default function StudentBorrowModal({
  isOpen,
  onClose,
  book,
  studentMemberId,
  studentName,
  activeLoansCount = 0,
  onSuccess,
}) {
  const [loading, setLoading] = useState(false);
  const [serverError, setServerError] = useState(null);
  const [config, setConfig] = useState(loanService.getActiveConfig());

  useEffect(() => {
    if (isOpen) {
      setServerError(null);
      loanService.getLoanConfiguration().then((cfg) => {
        if (cfg) setConfig(cfg);
      });
    }
  }, [isOpen]);

  if (!book) return null;

  const borrowingLimit = config.borrowingLimit || 3;
  const periodDays = config.periodDays || 8;
  const finePerDay = Number(config.finePerDay || 5).toFixed(2);

  const isLimitReached = activeLoansCount >= borrowingLimit;
  const isOutOfStock = (book.availableCopies ?? 0) <= 0;

  const today = new Date();
  const dueDate = new Date();
  dueDate.setDate(today.getDate() + periodDays);

  const handleConfirmBorrow = async () => {
    if (isLimitReached || isOutOfStock) return;

    setLoading(true);
    setServerError(null);

    try {
      const response = await loanService.borrowBook({
        memberId: studentMemberId,
        bookId: book.bookId,
      });

      if (onSuccess) {
        onSuccess(response);
      }
      onClose();
    } catch (err) {
      console.error('[StudentBorrowModal] Error checking out book:', err);
      const msg = err.friendlyMessage || err.message || 'Failed to borrow book. Please try again.';
      setServerError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Borrow Book / Instant Checkout"
      subtitle={`Self-service campus loan for Record #${book.bookId}`}
      maxWidth="540px"
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
        {/* Server Error Alert */}
        {serverError && (
          <div
            style={{
              padding: '12px 16px',
              borderRadius: 'var(--radius-md)',
              backgroundColor: 'rgba(239, 68, 68, 0.12)',
              border: '1px solid rgba(239, 68, 68, 0.35)',
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              color: '#f87171',
              fontSize: '0.85rem',
            }}
          >
            <AlertTriangle size={18} style={{ flexShrink: 0 }} />
            <span>{serverError}</span>
          </div>
        )}

        {/* Limit Warning Alert */}
        {isLimitReached && (
          <div
            style={{
              padding: '14px 16px',
              borderRadius: 'var(--radius-md)',
              backgroundColor: 'rgba(245, 158, 11, 0.12)',
              border: '1px solid rgba(245, 158, 11, 0.35)',
              display: 'flex',
              alignItems: 'flex-start',
              gap: '12px',
              color: '#fbbf24',
            }}
          >
            <ShieldAlert size={20} style={{ flexShrink: 0, marginTop: '2px' }} />
            <div>
              <div style={{ fontWeight: 700, fontSize: '0.875rem' }}>Borrowing Limit Reached</div>
              <div style={{ fontSize: '0.8rem', color: '#fef3c7', marginTop: '2px', lineHeight: 1.4 }}>
                You currently have <strong>{activeLoansCount}</strong> active borrowed books, which is the institutional maximum ({borrowingLimit} books). Please return an active book before borrowing another.
              </div>
            </div>
          </div>
        )}

        {/* Book Summary Card */}
        <div
          style={{
            backgroundColor: 'var(--bg-surface-elevated)',
            border: '1px solid var(--border-subtle)',
            borderRadius: 'var(--radius-md)',
            padding: '16px 18px',
            display: 'flex',
            gap: '14px',
            alignItems: 'flex-start',
          }}
        >
          <div
            style={{
              width: '44px',
              height: '44px',
              borderRadius: 'var(--radius-md)',
              background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.2) 0%, rgba(6, 182, 212, 0.2) 100%)',
              border: '1px solid rgba(99, 102, 241, 0.3)',
              color: 'var(--primary)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}
          >
            <BookOpen size={22} />
          </div>

          <div style={{ flex: 1, minWidth: 0 }}>
            <h3 style={{ fontSize: '1rem', fontWeight: 800, color: 'var(--text-primary)', margin: 0, lineHeight: 1.3 }}>
              {book.title}
            </h3>
            <p style={{ fontSize: '0.825rem', color: 'var(--text-secondary)', margin: '4px 0 8px' }}>
              By <strong>{book.author}</strong> • ISBN: <code className="font-mono">{book.isbn}</code>
            </p>
            <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
              <span className={`badge ${book.availableCopies > 0 ? 'badge-active' : 'badge-inactive'}`}>
                {book.availableCopies > 0 ? `${book.availableCopies} Copies Available` : 'Out of Stock'}
              </span>
              <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                Total Stock: {book.totalCopies}
              </span>
            </div>
          </div>
        </div>

        {/* Loan Policy & Terms Dockets */}
        <div
          style={{
            backgroundColor: 'rgba(15, 23, 42, 0.65)',
            border: '1px solid var(--border-subtle)',
            borderRadius: 'var(--radius-md)',
            padding: '14px 18px',
            display: 'flex',
            flexDirection: 'column',
            gap: '10px',
            fontSize: '0.825rem',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px dashed var(--border-subtle)', paddingBottom: '8px' }}>
            <span style={{ color: 'var(--text-muted)' }}>Student Patron:</span>
            <strong style={{ color: 'var(--text-primary)' }}>{studentName} (ID #{studentMemberId})</strong>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ color: 'var(--text-muted)' }}>Borrow Date (Issue Date):</span>
            <span style={{ color: 'var(--text-primary)' }}>
              {today.toLocaleDateString('en-IN', { month: 'short', day: 'numeric', year: 'numeric' })}
            </span>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ color: 'var(--text-muted)' }}>Return Deadline:</span>
            <strong style={{ color: '#34d399' }}>
              {dueDate.toLocaleDateString('en-IN', { month: 'short', day: 'numeric', year: 'numeric' })} ({periodDays} Days)
            </strong>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ color: 'var(--text-muted)' }}>Late Penalty Policy:</span>
            <span style={{ color: '#fbbf24' }}>
              ₹{finePerDay} / day past due date
            </span>
          </div>
        </div>

        {/* Footer Actions */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '6px' }}>
          <button
            type="button"
            className="btn btn-secondary"
            onClick={onClose}
            disabled={loading}
          >
            Cancel
          </button>

          <button
            type="button"
            className="btn btn-primary"
            onClick={handleConfirmBorrow}
            disabled={loading || isLimitReached || isOutOfStock}
            style={{
              opacity: isLimitReached || isOutOfStock ? 0.5 : 1,
              cursor: isLimitReached || isOutOfStock ? 'not-allowed' : 'pointer',
            }}
          >
            {loading ? (
              <>
                <Loader2 size={16} className="animate-spin" />
                <span>Processing Checkout...</span>
              </>
            ) : (
              <>
                <CheckCircle2 size={16} />
                <span>Confirm & Checkout Book</span>
              </>
            )}
          </button>
        </div>
      </div>
    </Modal>
  );
}

