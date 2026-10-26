import React, { useState, useEffect } from 'react';
import Modal from '../../components/common/Modal';
import { 
  RotateCcw, 
  AlertCircle, 
  CheckCircle2, 
  BookOpen, 
  Users, 
  Loader2,
  Info
} from 'lucide-react';
import { loanService } from '../../api/loanService';

export default function ReturnBookModal({
  isOpen,
  onClose,
  loanToReturn = null,
  activeLoans = [],
  onSuccess,
}) {
  const [loanId, setLoanId] = useState('');
  const [availableLoans, setAvailableLoans] = useState(activeLoans || []);
  const [loadingActive, setLoadingActive] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [serverError, setServerError] = useState(null);
  const [clientErrors, setClientErrors] = useState({});

  useEffect(() => {
    if (isOpen) {
      setLoanId(loanToReturn?.loanId ? String(loanToReturn.loanId) : '');
      setServerError(null);
      setClientErrors({});
      setLoadingActive(true);

      // Fetch all active circulating loans from the backend across all pages
      loanService
        .getAllActiveLoans()
        .then((list) => {
          if (Array.isArray(list) && list.length > 0) {
            setAvailableLoans(list);
          } else if (activeLoans && activeLoans.length > 0) {
            setAvailableLoans(activeLoans);
          }
        })
        .catch((err) => {
          console.warn('[ReturnBookModal] Could not fetch active loans:', err);
          if (activeLoans && activeLoans.length > 0) {
            setAvailableLoans(activeLoans);
          }
        })
        .finally(() => {
          setLoadingActive(false);
        });
    }
  }, [isOpen, loanToReturn]);

  // Find loan details from available active loans, loanToReturn, or local cache
  const matchedLoan =
    (loanToReturn && String(loanToReturn.loanId) === String(loanId))
      ? loanToReturn
      : availableLoans.find((l) => String(l.loanId) === String(loanId)) ||
        activeLoans.find((l) => String(l.loanId) === String(loanId)) ||
        loanService.getRecordedLoanById(loanId);

  const validate = () => {
    const errs = {};
    if (!loanId || !String(loanId).trim()) {
      errs.loanId = 'Please enter or select a valid Loan ID';
    } else if (Number(loanId) <= 0 || isNaN(Number(loanId))) {
      errs.loanId = 'Loan ID must be a positive integer';
    }
    setClientErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e) => {
    if (e) e.preventDefault();
    setServerError(null);

    if (!validate()) return;

    setIsSubmitting(true);
    try {
      const response = await loanService.returnBook(Number(loanId));
      if (onSuccess) {
        onSuccess(response);
      }
      onClose();
    } catch (err) {
      console.error('[ReturnBookModal Submit Error]:', err);
      const msg = err.friendlyMessage || err.message || 'Failed to process return. Please verify Loan ID.';
      setServerError(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Return Book / Close Loan"
      subtitle="PUT /api/loans/{id}/return — Process return and restore available book stock"
      maxWidth="560px"
    >
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        {/* Backend Error Alert */}
        {serverError && (
          <div
            style={{
              padding: '12px 14px',
              borderRadius: 'var(--radius-md)',
              backgroundColor: 'var(--danger-light)',
              border: '1px solid rgba(239, 68, 68, 0.35)',
              color: '#f87171',
              fontSize: '0.85rem',
              display: 'flex',
              alignItems: 'flex-start',
              gap: '10px',
            }}
          >
            <AlertCircle size={18} style={{ flexShrink: 0, marginTop: '2px', color: 'var(--danger)' }} />
            <div style={{ flex: 1 }}>
              <strong style={{ display: 'block', marginBottom: '2px', color: '#ffffff' }}>
                Return Processing Error
              </strong>
              <span>{serverError}</span>
            </div>
          </div>
        )}

        {/* Loan Selection or Manual Input */}
        <div>
          <label
            style={{
              display: 'block',
              fontSize: '0.85rem',
              fontWeight: 600,
              color: 'var(--text-primary)',
              marginBottom: '6px',
            }}
          >
            Loan ID to Return <span style={{ color: 'var(--danger)' }}>*</span>
          </label>

          {loadingActive ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '6px 0', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
              <Loader2 size={14} className="animate-spin" />
              <span>Loading active loans from database...</span>
            </div>
          ) : availableLoans.length > 0 ? (
            <div style={{ marginBottom: '8px' }}>
              <select
                className="input-field"
                value={loanId}
                onChange={(e) => {
                  setLoanId(e.target.value);
                  setClientErrors({});
                  setServerError(null);
                }}
                style={{ padding: '8px 12px', fontSize: '0.85rem' }}
              >
                <option value="">-- Choose from active circulating loans ({availableLoans.length}) --</option>
                {availableLoans.map((l) => (
                  <option key={l.loanId} value={l.loanId}>
                    Loan #{l.loanId}: "{l.bookTitle}" &rarr; {l.memberName} (Due: {l.dueDate})
                  </option>
                ))}
              </select>
            </div>
          ) : null}

          <input
            type="number"
            placeholder="Or type Loan ID # directly..."
            className="input-field"
            value={loanId}
            onChange={(e) => {
              setLoanId(e.target.value);
              setClientErrors({});
              setServerError(null);
            }}
            min="1"
            style={{
              fontSize: '0.95rem',
              fontWeight: 600,
              padding: '8px 12px',
            }}
          />

          {clientErrors.loanId && (
            <p style={{ fontSize: '0.75rem', color: 'var(--danger)', marginTop: '4px' }}>
              {clientErrors.loanId}
            </p>
          )}
        </div>

        {/* Matched Loan Summary Card */}
        {matchedLoan ? (
          <div
            style={{
              padding: '14px',
              borderRadius: 'var(--radius-md)',
              backgroundColor: 'rgba(99, 102, 241, 0.08)',
              border: '1px solid rgba(99, 102, 241, 0.25)',
              display: 'flex',
              flexDirection: 'column',
              gap: '10px',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span
                style={{
                  fontSize: '0.72rem',
                  fontWeight: 700,
                  textTransform: 'uppercase',
                  letterSpacing: '0.06em',
                  color: 'var(--primary)',
                }}
              >
                Active Loan Record Verified
              </span>
              <span className="badge badge-active" style={{ fontSize: '0.7rem' }}>Loan #{matchedLoan.loanId}</span>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 180px), 1fr))', gap: '10px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', minWidth: 0 }}>
                <BookOpen size={16} style={{ color: 'var(--accent-cyan)', flexShrink: 0 }} />
                <div style={{ minWidth: 0, overflow: 'hidden' }}>
                  <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>Book Title</div>
                  <strong style={{ fontSize: '0.82rem', color: '#ffffff', display: 'block', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {matchedLoan.bookTitle}
                  </strong>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', minWidth: 0 }}>
                <Users size={16} style={{ color: 'var(--primary)', flexShrink: 0 }} />
                <div style={{ minWidth: 0, overflow: 'hidden' }}>
                  <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>Borrower</div>
                  <strong style={{ fontSize: '0.82rem', color: '#ffffff', display: 'block', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {matchedLoan.memberName}
                  </strong>
                </div>
              </div>
            </div>

            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 140px), 1fr))',
                gap: '8px',
                paddingTop: '8px',
                borderTop: '1px solid rgba(255, 255, 255, 0.08)',
                fontSize: '0.75rem',
              }}
            >
              <div>
                <span style={{ color: 'var(--text-muted)' }}>Issue Date: </span>
                <span style={{ color: 'var(--text-primary)', fontWeight: 600 }}>{matchedLoan.issueDate}</span>
              </div>
              <div>
                <span style={{ color: 'var(--text-muted)' }}>Due Date: </span>
                <span
                  style={{
                    color: matchedLoan.isOverdue ? 'var(--warning)' : 'var(--text-primary)',
                    fontWeight: 600,
                  }}
                >
                  {matchedLoan.dueDate} {matchedLoan.isOverdue ? '(Overdue)' : ''}
                </span>
              </div>
            </div>
          </div>
        ) : (
          <div
            style={{
              padding: '10px 12px',
              borderRadius: 'var(--radius-md)',
              backgroundColor: 'rgba(15, 23, 42, 0.6)',
              border: '1px dashed var(--border-medium)',
              fontSize: '0.75rem',
              color: 'var(--text-muted)',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
            }}
          >
            <Info size={15} style={{ color: 'var(--text-secondary)', flexShrink: 0 }} />
            <span>
              Enter any active Loan ID. The Spring Boot backend checks the database, marks status as <strong>RETURNED</strong>, and increases the available book copies (+1) automatically.
            </span>
          </div>
        )}

        {/* Action Confirmation Banner */}
        <div
          style={{
            padding: '10px 12px',
            borderRadius: 'var(--radius-md)',
            backgroundColor: 'rgba(16, 185, 129, 0.08)',
            border: '1px solid rgba(16, 185, 129, 0.2)',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            fontSize: '0.78rem',
            color: '#34d399',
          }}
        >
          <RotateCcw size={15} style={{ flexShrink: 0 }} />
          <span>
            Upon return, +1 copy will be credited back to catalog inventory immediately.
          </span>
        </div>

        {/* Form Buttons */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'flex-end',
            gap: '10px',
            paddingTop: '8px',
            borderTop: '1px solid var(--border-subtle)',
            flexWrap: 'wrap',
          }}
        >
          <button
            type="button"
            className="btn btn-secondary"
            onClick={onClose}
            disabled={isSubmitting}
            style={{ padding: '8px 16px', fontSize: '0.85rem', flex: '1 1 100px' }}
          >
            Cancel
          </button>
          <button
            type="submit"
            className="btn btn-primary"
            disabled={isSubmitting || !loanId}
            style={{
              background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
              boxShadow: '0 2px 10px rgba(16, 185, 129, 0.3)',
              minWidth: '150px',
              flex: '1 1 150px',
              padding: '8px 18px',
              fontSize: '0.85rem',
            }}
          >
            {isSubmitting ? (
              <>
                <Loader2 size={15} className="animate-spin" />
                <span>Processing...</span>
              </>
            ) : (
              <>
                <CheckCircle2 size={15} />
                <span>Confirm Return</span>
              </>
            )}
          </button>
        </div>
      </form>
    </Modal>
  );
}
