import React, { useState, useEffect, useCallback } from 'react';
import { 
  BookmarkCheck, 
  Receipt, 
  Search, 
  Clock, 
  AlertTriangle, 
  AlertCircle,
  CheckCircle2, 
  BookOpen, 
  Calendar,
  Info,
  RotateCcw,
  Loader2
} from 'lucide-react';
import { loanService } from '../../api/loanService';
import { useAuth } from '../../context/AuthContext';
import LoanReceiptModal from '../loans/LoanReceiptModal';
import Modal from '../../components/common/Modal';
import Toast from '../../components/common/Toast';

export default function StudentLoansPage() {
  const { user } = useAuth();
  const [loans, setLoans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState('ALL'); // 'ALL' | 'ACTIVE' | 'RETURNED'
  const [search, setSearch] = useState('');

  // Receipt Modal
  const [selectedReceiptLoan, setSelectedReceiptLoan] = useState(null);
  const [receiptModalOpen, setReceiptModalOpen] = useState(false);
  const [isReceiptReturnMode, setIsReceiptReturnMode] = useState(false);

  // Self-Service Return Modal
  const [loanToReturn, setLoanToReturn] = useState(null);
  const [isReturnConfirmOpen, setIsReturnConfirmOpen] = useState(false);
  const [isReturning, setIsReturning] = useState(false);
  const [returnError, setReturnError] = useState(null);

  // Toast feedback
  const [toast, setToast] = useState(null);

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => {
      setToast(null);
    }, 4500);
  };

  const fetchStudentLoans = useCallback(async () => {
    setLoading(true);
    try {
      const studentLoans = await loanService.getMyLoans();
      setLoans(Array.isArray(studentLoans) ? studentLoans : []);
    } catch (err) {
      console.error('[StudentLoansPage] Error fetching loans from GET /api/loans/myloans:', err);
      showToast('Failed to sync loan history with backend.', 'error');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStudentLoans();
  }, [fetchStudentLoans]);

  const filteredLoans = loans.filter((l) => {
    if (tab === 'ACTIVE' && l.status !== 'ACTIVE') return false;
    if (tab === 'RETURNED' && l.status !== 'RETURNED') return false;

    if (search.trim()) {
      const q = search.toLowerCase();
      const matchTitle = l.bookTitle && l.bookTitle.toLowerCase().includes(q);
      const matchId = String(l.loanId).includes(q);
      return matchTitle || matchId;
    }
    return true;
  });

  const handleOpenReceipt = (loan) => {
    setSelectedReceiptLoan(loan);
    setIsReceiptReturnMode(loan.status === 'RETURNED');
    setReceiptModalOpen(true);
  };

  const handleInitiateReturn = (loan) => {
    setLoanToReturn(loan);
    setReturnError(null);
    setIsReturnConfirmOpen(true);
  };

  const handleConfirmReturn = async () => {
    if (!loanToReturn) return;
    setIsReturning(true);
    setReturnError(null);

    try {
      const returnedLoan = await loanService.returnBook(loanToReturn.loanId);
      setIsReturnConfirmOpen(false);
      showToast(`Successfully returned "${loanToReturn.bookTitle}". Book copy returned to circulation.`, 'success');

      // Refresh data from backend
      await fetchStudentLoans();

      // Show Return Receipt Slip
      setSelectedReceiptLoan(returnedLoan || { ...loanToReturn, status: 'RETURNED', returnDate: new Date().toISOString().split('T')[0] });
      setIsReceiptReturnMode(true);
      setReceiptModalOpen(true);
    } catch (err) {
      console.error('[StudentLoansPage] Error returning book:', err);
      const msg = err.friendlyMessage || err.message || 'Failed to process return. Please contact library staff.';
      setReturnError(msg);
    } finally {
      setIsReturning(false);
    }
  };

  const activeCount = loans.filter((l) => l.status === 'ACTIVE').length;
  const returnedCount = loans.filter((l) => l.status === 'RETURNED').length;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Toast Feedback */}
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}

      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h1 className="page-title" style={{ margin: 0 }}>
            My Borrowing History
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', margin: '4px 0 0' }}>
            Complete historical record of books borrowed, active loan return deadlines, and official slips.
          </p>
        </div>

        {/* Member ID info chip */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '8px 14px',
            borderRadius: 'var(--radius-full)',
            background: 'var(--bg-surface-elevated)',
            border: '1px solid var(--border-subtle)',
            fontSize: '0.8rem',
            color: 'var(--text-secondary)',
          }}
        >
          <span>Member:</span>
          <strong style={{ color: 'var(--text-primary)' }}>{user?.name}</strong>
          <span>(ID #{user?.memberId})</span>
        </div>
      </div>

      {/* Self-Service Advisory Notice */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          padding: '12px 16px',
          background: 'rgba(6, 182, 212, 0.08)',
          border: '1px solid rgba(6, 182, 212, 0.25)',
          borderRadius: 'var(--radius-md)',
          fontSize: '0.825rem',
          color: '#7dd3fc',
        }}
      >
        <Info size={18} style={{ color: 'var(--accent-cyan)', flexShrink: 0 }} />
        <div>
          <strong>Self-Service Library Circulation:</strong> You can borrow available titles directly from the Catalog and return active items below anytime. Official receipt slips are recorded live in the Librix database.
        </div>
      </div>

      {/* Controls Bar */}
      <div
        className="glass-card"
        style={{
          padding: '16px 20px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '14px',
        }}
      >
        {/* Search */}
        <div style={{ position: 'relative', flex: 1, minWidth: '240px' }}>
          <Search size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
          <input
            type="text"
            placeholder="Search records by book title or loan ID..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="input-field"
            style={{ paddingLeft: '38px', height: '40px' }}
          />
        </div>

        {/* Status Filter Tabs */}
        <div className="scroll-tabs">
          <button
            type="button"
            onClick={() => setTab('ALL')}
            className="btn-ghost"
            style={{
              padding: '6px 14px',
              borderRadius: 'var(--radius-sm)',
              fontSize: '0.8rem',
              fontWeight: 600,
              color: tab === 'ALL' ? '#ffffff' : 'var(--text-secondary)',
              backgroundColor: tab === 'ALL' ? 'var(--bg-surface-hover)' : 'transparent',
            }}
          >
            All History ({loans.length})
          </button>
          <button
            type="button"
            onClick={() => setTab('ACTIVE')}
            className="btn-ghost"
            style={{
              padding: '6px 14px',
              borderRadius: 'var(--radius-sm)',
              fontSize: '0.8rem',
              fontWeight: 600,
              color: tab === 'ACTIVE' ? '#34d399' : 'var(--text-secondary)',
              backgroundColor: tab === 'ACTIVE' ? 'var(--bg-surface-hover)' : 'transparent',
            }}
          >
            Active Checked Out ({activeCount})
          </button>
          <button
            type="button"
            onClick={() => setTab('RETURNED')}
            className="btn-ghost"
            style={{
              padding: '6px 14px',
              borderRadius: 'var(--radius-sm)',
              fontSize: '0.8rem',
              fontWeight: 600,
              color: tab === 'RETURNED' ? '#a5b4fc' : 'var(--text-secondary)',
              backgroundColor: tab === 'RETURNED' ? 'var(--bg-surface-hover)' : 'transparent',
            }}
          >
            Returned ({returnedCount})
          </button>
        </div>
      </div>

      {/* History Table */}
      {loading ? (
        <div className="glass-card" style={{ padding: '40px', textAlign: 'center', color: 'var(--text-secondary)' }}>
          Loading your borrowing history...
        </div>
      ) : filteredLoans.length === 0 ? (
        <div
          className="glass-card"
          style={{
            padding: '48px 24px',
            textAlign: 'center',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '12px',
          }}
        >
          <BookmarkCheck size={40} style={{ color: 'var(--text-muted)' }} />
          <h3 style={{ fontSize: '1.1rem', fontWeight: 700, margin: 0, color: 'var(--text-primary)' }}>
            No History Records Found
          </h3>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', margin: 0 }}>
            {search ? `No loans match search query "${search}".` : 'No loan activity recorded under this filter.'}
          </p>
        </div>
      ) : (
        <div className="table-container">
          <table className="custom-table" style={{ minWidth: '720px' }}>
            <thead>
              <tr>
                <th>Loan ID</th>
                <th>Book Title</th>
                <th>Issue Date</th>
                <th>Due Date</th>
                <th>Return Date</th>
                <th>Status</th>
                <th>Fine Accrued</th>
                <th style={{ textAlign: 'right' }}>Official Docket</th>
              </tr>
            </thead>
            <tbody>
              {filteredLoans.map((loan) => {
                const isActive = loan.status === 'ACTIVE';
                const isOverdue = loan.isOverdue;

                return (
                  <tr key={loan.loanId}>
                    <td className="font-mono" style={{ fontWeight: 600, color: 'var(--text-secondary)' }}>
                      #{loan.loanId}
                    </td>

                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <div
                          style={{
                            width: '32px',
                            height: '32px',
                            borderRadius: 'var(--radius-sm)',
                            background: isActive ? 'rgba(16, 185, 129, 0.12)' : 'rgba(255, 255, 255, 0.04)',
                            color: isActive ? 'var(--success)' : 'var(--text-muted)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            flexShrink: 0,
                          }}
                        >
                          <BookOpen size={16} />
                        </div>
                        <div>
                          <div style={{ fontWeight: 700, color: 'var(--text-primary)' }}>
                            {loan.bookTitle}
                          </div>
                          <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                            Book ID: #{loan.bookId}
                          </div>
                        </div>
                      </div>
                    </td>

                    <td style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                      {loan.issueDate || '—'}
                    </td>

                    <td style={{ fontSize: '0.85rem' }}>
                      <span style={{ color: isOverdue ? 'var(--danger)' : 'var(--text-primary)', fontWeight: isOverdue ? 700 : 500 }}>
                        {loan.dueDate || '—'}
                      </span>
                    </td>

                    <td style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                      {loan.returnDate || '—'}
                    </td>

                    <td>
                      {isOverdue ? (
                        <span className="badge badge-inactive">
                          {loan.daysOverdue}d Overdue
                        </span>
                      ) : isActive ? (
                        <span className="badge badge-active">
                          Checked Out
                        </span>
                      ) : (
                        <span className="badge badge-info" style={{ background: 'rgba(255, 255, 255, 0.06)', color: 'var(--text-secondary)', border: '1px solid var(--border-subtle)' }}>
                          Returned
                        </span>
                      )}
                    </td>

                    <td>
                      <span
                        style={{
                          fontWeight: 700,
                          color: loan.fine > 0 ? 'var(--danger)' : 'var(--text-muted)',
                        }}
                      >
                        {loan.fine > 0 ? `₹${Number(loan.fine).toFixed(2)}` : '₹0.00'}
                      </span>
                    </td>

                    <td style={{ textAlign: 'right' }}>
                      <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', justifyContent: 'flex-end', flexWrap: 'wrap' }}>
                        {isActive && (
                          <button
                            type="button"
                            onClick={() => handleInitiateReturn(loan)}
                            className="btn btn-secondary"
                            style={{
                              padding: '5px 12px',
                              fontSize: '0.78rem',
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '6px',
                              borderColor: isOverdue ? 'rgba(239, 68, 68, 0.4)' : 'rgba(16, 185, 129, 0.4)',
                              color: isOverdue ? '#f87171' : '#34d399',
                            }}
                            title="Return this book to library"
                          >
                            <RotateCcw size={14} />
                            <span>Return</span>
                          </button>
                        )}
                        <button
                          type="button"
                          onClick={() => handleOpenReceipt(loan)}
                          className="btn btn-secondary"
                          style={{ padding: '5px 12px', fontSize: '0.78rem', display: 'inline-flex', alignItems: 'center', gap: '6px' }}
                          title="View or print official loan receipt"
                        >
                          <Receipt size={14} />
                          <span>View Slip</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Return Confirmation Modal */}
      {isReturnConfirmOpen && loanToReturn && (
        <Modal
          isOpen={isReturnConfirmOpen}
          onClose={() => {
            if (!isReturning) {
              setIsReturnConfirmOpen(false);
              setLoanToReturn(null);
            }
          }}
          title="Confirm Book Return"
          subtitle={`PUT /api/loans/${loanToReturn.loanId}/return — Return item to campus collection`}
          maxWidth="520px"
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {returnError && (
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
                <div>
                  <strong style={{ display: 'block', marginBottom: '2px', color: '#ffffff' }}>Return Failed</strong>
                  <span>{returnError}</span>
                </div>
              </div>
            )}

            {/* Book Info Card */}
            <div
              style={{
                padding: '14px 16px',
                borderRadius: 'var(--radius-md)',
                backgroundColor: 'var(--bg-surface-elevated)',
                border: '1px solid var(--border-medium)',
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
              }}
            >
              <div
                style={{
                  width: '44px',
                  height: '44px',
                  borderRadius: 'var(--radius-sm)',
                  backgroundColor: 'rgba(99, 102, 241, 0.15)',
                  color: 'var(--primary-light)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                }}
              >
                <BookOpen size={22} />
              </div>
              <div style={{ minWidth: 0, flex: 1 }}>
                <h4 style={{ margin: '0 0 4px', fontSize: '0.95rem', fontWeight: 700, color: '#ffffff' }}>
                  {loanToReturn.bookTitle}
                </h4>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                  Loan #{loanToReturn.loanId} • Book ID: #{loanToReturn.bookId}
                </div>
              </div>
            </div>

            {/* Schedule details */}
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 140px), 1fr))',
                gap: '10px',
              }}
            >
              <div style={{ padding: '10px 12px', backgroundColor: 'var(--bg-surface-elevated)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-subtle)' }}>
                <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', display: 'block' }}>Borrowed Date</span>
                <strong style={{ fontSize: '0.85rem', color: 'var(--text-primary)' }}>{loanToReturn.issueDate || '—'}</strong>
              </div>
              <div style={{ padding: '10px 12px', backgroundColor: 'var(--bg-surface-elevated)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-subtle)' }}>
                <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', display: 'block' }}>Return Due Date</span>
                <strong style={{ fontSize: '0.85rem', color: loanToReturn.isOverdue ? 'var(--danger)' : 'var(--text-primary)' }}>{loanToReturn.dueDate || '—'}</strong>
              </div>
            </div>

            {/* Overdue Warning & Fine Alert */}
            {loanToReturn.isOverdue ? (
              <div
                style={{
                  padding: '12px 14px',
                  borderRadius: 'var(--radius-md)',
                  backgroundColor: 'rgba(239, 68, 68, 0.12)',
                  border: '1px solid rgba(239, 68, 68, 0.3)',
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '10px',
                }}
              >
                <AlertTriangle size={18} style={{ color: 'var(--danger)', flexShrink: 0, marginTop: '2px' }} />
                <div style={{ fontSize: '0.825rem' }}>
                  <div style={{ fontWeight: 700, color: '#f87171', marginBottom: '2px' }}>
                    Overdue Notice ({loanToReturn.daysOverdue} days past deadline)
                  </div>
                  <div style={{ color: 'var(--text-secondary)' }}>
                    Accrued Late Penalty: <strong style={{ color: '#ffffff' }}>₹{Number(loanToReturn.fine || (loanToReturn.daysOverdue * 5)).toFixed(2)}</strong>.
                    This penalty will be assessed to your student account upon return.
                  </div>
                </div>
              </div>
            ) : (
              <div
                style={{
                  padding: '10px 14px',
                  borderRadius: 'var(--radius-md)',
                  backgroundColor: 'rgba(16, 185, 129, 0.08)',
                  border: '1px solid rgba(16, 185, 129, 0.25)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  fontSize: '0.825rem',
                  color: '#6ee7b7',
                }}
              >
                <CheckCircle2 size={16} style={{ flexShrink: 0, color: 'var(--success)' }} />
                <span>On-time return. No late fees or penalties apply to this transaction.</span>
              </div>
            )}

            {/* Actions */}
            <div
              style={{
                display: 'flex',
                justifyContent: 'flex-end',
                gap: '10px',
                paddingTop: '12px',
                borderTop: '1px solid var(--border-subtle)',
              }}
            >
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => {
                  setIsReturnConfirmOpen(false);
                  setLoanToReturn(null);
                }}
                disabled={isReturning}
              >
                Cancel
              </button>
              <button
                type="button"
                className="btn btn-primary"
                onClick={handleConfirmReturn}
                disabled={isReturning}
                style={{
                  background: 'linear-gradient(135deg, #059669 0%, #10b981 100%)',
                  boxShadow: '0 4px 14px rgba(16, 185, 129, 0.35)',
                  minWidth: '150px',
                }}
              >
                {isReturning ? (
                  <>
                    <Loader2 size={16} className="animate-spin" />
                    <span>Processing Return...</span>
                  </>
                ) : (
                  <>
                    <RotateCcw size={16} />
                    <span>Confirm Book Return</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* Printable Receipt Modal */}
      <LoanReceiptModal
        isOpen={receiptModalOpen}
        onClose={() => {
          setReceiptModalOpen(false);
          setSelectedReceiptLoan(null);
          setIsReceiptReturnMode(false);
        }}
        loan={selectedReceiptLoan}
        isReturn={isReceiptReturnMode}
      />
    </div>
  );
}
