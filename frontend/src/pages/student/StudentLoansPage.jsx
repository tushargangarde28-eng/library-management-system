import React, { useState, useEffect, useCallback } from 'react';
import { 
  BookmarkCheck, 
  Receipt, 
  Search, 
  Clock, 
  AlertTriangle, 
  CheckCircle2, 
  BookOpen, 
  Calendar,
  Info
} from 'lucide-react';
import { loanService } from '../../api/loanService';
import { useAuth } from '../../context/AuthContext';
import LoanReceiptModal from '../loans/LoanReceiptModal';

export default function StudentLoansPage() {
  const { user } = useAuth();
  const [loans, setLoans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState('ALL'); // 'ALL' | 'ACTIVE' | 'RETURNED'
  const [search, setSearch] = useState('');

  // Receipt Modal
  const [selectedReceiptLoan, setSelectedReceiptLoan] = useState(null);
  const [receiptModalOpen, setReceiptModalOpen] = useState(false);

  const fetchStudentLoans = useCallback(async () => {
    setLoading(true);
    try {
      const studentLoans = await loanService.getMyLoans();
      setLoans(Array.isArray(studentLoans) ? studentLoans : []);
    } catch (err) {
      console.error('[StudentLoansPage] Error fetching loans from GET /api/loans/myloans:', err);
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
    setReceiptModalOpen(true);
  };

  const activeCount = loans.filter((l) => l.status === 'ACTIVE').length;
  const returnedCount = loans.filter((l) => l.status === 'RETURNED').length;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
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

      {/* Circulation Desk Advisory Notice */}
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
          <strong>Note:</strong> Book checkouts and returns are recorded by library staff at the circulation desk. This portal displays your official personal record.
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
          <table className="custom-table">
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
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Printable Receipt Modal */}
      <LoanReceiptModal
        isOpen={receiptModalOpen}
        onClose={() => {
          setReceiptModalOpen(false);
          setSelectedReceiptLoan(null);
        }}
        loan={selectedReceiptLoan}
      />
    </div>
  );
}
