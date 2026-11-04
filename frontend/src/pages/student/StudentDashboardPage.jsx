import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  BookOpen, 
  BookmarkCheck, 
  Clock, 
  AlertTriangle, 
  CheckCircle2, 
  ArrowRight, 
  Sparkles, 
  GraduationCap,
  Calendar,
  AlertCircle,
  Search,
  Info,
  RotateCcw,
  Loader2
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { loanService, BORROWING_LIMIT, LOAN_PERIOD_DAYS } from '../../api/loanService';
import { bookService } from '../../api/bookService';
import Modal from '../../components/common/Modal';
import Toast from '../../components/common/Toast';
import LoanReceiptModal from '../loans/LoanReceiptModal';

export default function StudentDashboardPage({ refreshTrigger, onApiStatusChange }) {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [myLoans, setMyLoans] = useState([]);
  const [activeLoans, setActiveLoans] = useState([]);
  const [availableBooks, setAvailableBooks] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loanConfig, setLoanConfig] = useState(() => loanService.getActiveConfig());

  // Return Book modal state
  const [loanToReturn, setLoanToReturn] = useState(null);
  const [isReturnModalOpen, setIsReturnModalOpen] = useState(false);
  const [isReturning, setIsReturning] = useState(false);
  const [returnError, setReturnError] = useState(null);

  // Return receipt slip modal
  const [receiptModalOpen, setReceiptModalOpen] = useState(false);
  const [receiptLoan, setReceiptLoan] = useState(null);

  // Toast feedback
  const [toast, setToast] = useState(null);

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => {
      setToast(null);
    }, 4500);
  };

  const fetchStudentData = useCallback(async () => {
    setLoading(true);
    try {
      const [studentLoans, booksRes, configRes] = await Promise.all([
        loanService.getMyLoans(),
        bookService.getBooks({ page: 0, size: 6, sortBy: 'bookId', direction: 'desc' }).catch(() => ({ content: [] })),
        loanService.getLoanConfiguration().catch(() => loanService.getActiveConfig()),
      ]);

      if (onApiStatusChange) onApiStatusChange('online');

      const loansList = Array.isArray(studentLoans) ? studentLoans : [];
      setMyLoans(loansList);
      setActiveLoans(loansList.filter((l) => l.status === 'ACTIVE'));
      setAvailableBooks(booksRes?.content || []);
      if (configRes) {
        setLoanConfig(configRes);
      }
    } catch (err) {
      console.error('[StudentDashboard] Error fetching data:', err);
      if (onApiStatusChange) onApiStatusChange('error');
    } finally {
      setLoading(false);
    }
  }, [onApiStatusChange]);

  useEffect(() => {
    fetchStudentData();
  }, [fetchStudentData, refreshTrigger]);

  const borrowingLimit = loanConfig?.borrowingLimit || BORROWING_LIMIT;
  const periodDays = loanConfig?.periodDays || LOAN_PERIOD_DAYS;
  const finePerDay = loanConfig?.finePerDay !== undefined ? loanConfig.finePerDay : 5;

  const activeCount = activeLoans.length;
  const overdueLoans = activeLoans.filter((l) => l.isOverdue);
  const totalFines = activeLoans.reduce((sum, l) => sum + (Number(l.fine) || 0), 0);
  const quotaPercentage = Math.min(100, Math.round((activeCount / borrowingLimit) * 100));

  const handleInitiateReturn = (loan) => {
    setLoanToReturn(loan);
    setReturnError(null);
    setIsReturnModalOpen(true);
  };

  const handleConfirmReturn = async () => {
    if (!loanToReturn) return;
    setIsReturning(true);
    setReturnError(null);

    try {
      const returnedLoan = await loanService.returnBook(loanToReturn.loanId);
      setIsReturnModalOpen(false);
      showToast(`Successfully returned "${loanToReturn.bookTitle}". Book copy returned to circulation.`, 'success');

      // Refresh data
      await fetchStudentData();

      // Show return receipt slip
      setReceiptLoan(returnedLoan || { ...loanToReturn, status: 'RETURNED', returnDate: new Date().toISOString().split('T')[0] });
      setReceiptModalOpen(true);
    } catch (err) {
      console.error('[StudentDashboard] Error returning book:', err);
      const msg = err.friendlyMessage || err.message || 'Failed to process return. Please contact library staff.';
      setReturnError(msg);
    } finally {
      setIsReturning(false);
    }
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/student/books?search=${encodeURIComponent(searchQuery.trim())}`);
    } else {
      navigate('/student/books');
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>
      {/* Student Welcome Header Card */}
      <div
        className="glass-card"
        style={{
          padding: '28px',
          background: 'radial-gradient(circle at 10% 20%, rgba(16, 185, 129, 0.12) 0%, transparent 50%), radial-gradient(circle at 90% 80%, rgba(6, 182, 212, 0.08) 0%, transparent 40%), var(--bg-surface)',
          border: '1px solid var(--border-medium)',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '4px 12px', borderRadius: 'var(--radius-full)', background: 'rgba(16, 185, 129, 0.15)', border: '1px solid rgba(16, 185, 129, 0.3)', color: '#34d399', fontSize: '0.75rem', fontWeight: 700, marginBottom: '12px' }}>
              <GraduationCap size={14} />
              <span>LIBRIX STUDENT CAMPUS</span>
            </div>
            <h1 style={{ fontSize: 'clamp(1.5rem, 3vw, 2rem)', fontWeight: 800, color: '#ffffff', margin: 0, letterSpacing: '-0.02em', lineHeight: 1.2 }}>
              Welcome back, {user?.name || 'Member'}!
            </h1>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', margin: '8px 0 0', maxWidth: '650px', lineHeight: 1.5 }}>
              View your personal borrowing history, check return deadlines, and search the campus book catalog.
            </p>
          </div>

          {/* Quick ID Badge */}
          <div
            style={{
              padding: '12px 18px',
              background: 'rgba(15, 23, 42, 0.7)',
              border: '1px solid var(--border-subtle)',
              borderRadius: 'var(--radius-md)',
              display: 'flex',
              flexDirection: 'column',
              gap: '4px',
            }}
          >
            <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 600 }}>
              Member ID Card
            </span>
            <span style={{ fontSize: '1.1rem', fontWeight: 800, color: '#34d399', fontFamily: 'monospace' }}>
              MEM-{String(user?.memberId || '001').padStart(4, '0')}
            </span>
            <span style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>
              {user?.email}
            </span>
          </div>
        </div>
      </div>

      {/* KPI Stats Grid */}
      <div className="responsive-kpi-grid">
        {/* Currently Checked Out */}
        <div className="glass-card" style={{ padding: '20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', fontWeight: 600 }}>Current Active Loans</span>
            <div style={{ width: '36px', height: '36px', borderRadius: 'var(--radius-sm)', background: 'rgba(16, 185, 129, 0.15)', color: 'var(--success)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <BookmarkCheck size={18} />
            </div>
          </div>
          <div style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--text-primary)' }}>
            {activeCount} <span style={{ fontSize: '0.9rem', color: 'var(--text-muted)', fontWeight: 500 }}>/ {borrowingLimit} Max</span>
          </div>
          <div style={{ marginTop: '12px' }}>
            <div style={{ height: '6px', width: '100%', background: 'rgba(255, 255, 255, 0.08)', borderRadius: 'var(--radius-full)', overflow: 'hidden' }}>
              <div
                style={{
                  height: '100%',
                  width: `${quotaPercentage}%`,
                  background: quotaPercentage >= 100 ? 'var(--danger)' : quotaPercentage >= 66 ? 'var(--warning)' : 'var(--success)',
                  borderRadius: 'var(--radius-full)',
                  transition: 'width 0.4s ease',
                }}
              />
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '4px' }}>
              <span>{Math.max(0, borrowingLimit - activeCount)} quota remaining</span>
              <span>Limit: {borrowingLimit} books</span>
            </div>
          </div>
        </div>

        {/* Due Soon / Overdue */}
        <div className="glass-card" style={{ padding: '20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', fontWeight: 600 }}>Overdue Deadlines</span>
            <div style={{ width: '36px', height: '36px', borderRadius: 'var(--radius-sm)', background: overdueLoans.length > 0 ? 'rgba(239, 68, 68, 0.15)' : 'rgba(245, 158, 11, 0.15)', color: overdueLoans.length > 0 ? 'var(--danger)' : 'var(--warning)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <AlertTriangle size={18} />
            </div>
          </div>
          <div style={{ fontSize: '1.75rem', fontWeight: 800, color: overdueLoans.length > 0 ? 'var(--danger)' : 'var(--text-primary)' }}>
            {overdueLoans.length}
          </div>
          <p style={{ fontSize: '0.75rem', color: overdueLoans.length > 0 ? '#f87171' : 'var(--text-muted)', marginTop: '6px' }}>
            {overdueLoans.length > 0 ? 'Action required: item past return date' : 'All loans are within standard return time'}
          </p>
        </div>

        {/* Total History Borrowed */}
        <div className="glass-card" style={{ padding: '20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', fontWeight: 600 }}>Total Borrowing History</span>
            <div style={{ width: '36px', height: '36px', borderRadius: 'var(--radius-sm)', background: 'rgba(6, 182, 212, 0.15)', color: 'var(--accent-cyan)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <BookOpen size={18} />
            </div>
          </div>
          <div style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--text-primary)' }}>
            {myLoans.length}
          </div>
          <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '6px' }}>
            Lifetime books checked out by member
          </p>
        </div>

        {/* Accrued Late Fines */}
        <div className="glass-card" style={{ padding: '20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', fontWeight: 600 }}>Late Return Fines</span>
            <div style={{ width: '36px', height: '36px', borderRadius: 'var(--radius-sm)', background: totalFines > 0 ? 'rgba(239, 68, 68, 0.15)' : 'rgba(16, 185, 129, 0.15)', color: totalFines > 0 ? 'var(--danger)' : 'var(--success)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Sparkles size={18} />
            </div>
          </div>
          <div style={{ fontSize: '1.75rem', fontWeight: 800, color: totalFines > 0 ? 'var(--danger)' : 'var(--success)' }}>
            ₹{totalFines.toFixed(2)}
          </div>
          <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '6px' }}>
            {totalFines > 0 ? `₹${Number(finePerDay).toFixed(2)}/day fine active` : 'No outstanding fines on record'}
          </p>
        </div>
      </div>

      {/* Main Grid: Active Loans & Catalog Discovery Search */}
      <div className="student-dashboard-grid">
        {/* Left Column: My Current Active Loans */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <BookmarkCheck size={20} style={{ color: '#34d399' }} />
              <h2 style={{ fontSize: '1.15rem', fontWeight: 700, color: '#ffffff', margin: 0 }}>
                My Active Borrowed Books ({activeLoans.length})
              </h2>
            </div>
            {activeLoans.length > 0 && (
              <button
                onClick={() => navigate('/student/loans')}
                className="btn btn-ghost"
                style={{ fontSize: '0.8rem', color: '#34d399' }}
              >
                <span>View Full History</span>
                <ArrowRight size={14} />
              </button>
            )}
          </div>

          {loading ? (
            <div className="glass-card" style={{ padding: '30px', textAlign: 'center', color: 'var(--text-secondary)' }}>
              Loading your active loans...
            </div>
          ) : activeLoans.length === 0 ? (
            <div
              className="glass-card"
              style={{
                padding: '36px 24px',
                textAlign: 'center',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '12px',
              }}
            >
              <div
                style={{
                  width: '50px',
                  height: '50px',
                  borderRadius: '50%',
                  background: 'rgba(16, 185, 129, 0.1)',
                  color: 'var(--success)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <CheckCircle2 size={26} />
              </div>
              <h3 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>
                No Active Books Checked Out
              </h3>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.825rem', maxWidth: '400px', margin: 0 }}>
                You currently have no books checked out. You have {borrowingLimit} available slots to borrow literature from the Librix collection.
              </p>
              <button
                onClick={() => navigate('/student/books')}
                className="btn btn-primary"
                style={{
                  marginTop: '8px',
                  background: 'linear-gradient(135deg, #059669 0%, #10b981 100%)',
                }}
              >
                <Search size={16} />
                <span>Search Available Books</span>
              </button>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {activeLoans.map((loan) => (
                <div
                  key={loan.loanId}
                  className="glass-card"
                  style={{
                    padding: '16px 18px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: '14px',
                    borderLeft: loan.isOverdue ? '4px solid var(--danger)' : '4px solid var(--success)',
                    flexWrap: 'wrap',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '14px', minWidth: '220px', flex: 1 }}>
                    <div
                      style={{
                        width: '42px',
                        height: '42px',
                        borderRadius: 'var(--radius-sm)',
                        background: loan.isOverdue ? 'rgba(239, 68, 68, 0.15)' : 'rgba(16, 185, 129, 0.15)',
                        color: loan.isOverdue ? 'var(--danger)' : 'var(--success)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0,
                      }}
                    >
                      <BookOpen size={20} />
                    </div>

                    <div style={{ minWidth: 0, flex: 1 }}>
                      <h4
                        style={{
                          fontSize: '0.925rem',
                          fontWeight: 700,
                          color: 'var(--text-primary)',
                          margin: '0 0 4px',
                          whiteSpace: 'nowrap',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                        }}
                      >
                        {loan.bookTitle}
                      </h4>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.75rem', color: 'var(--text-muted)', flexWrap: 'wrap' }}>
                        <span>Issued: {loan.issueDate || 'Recent'}</span>
                        <span>•</span>
                        <span style={{ color: loan.isOverdue ? 'var(--danger)' : '#fbbf24', fontWeight: 600 }}>
                          Due: {loan.dueDate || `${periodDays} days`}
                        </span>
                        {loan.isOverdue && (
                          <span className="badge badge-inactive" style={{ fontSize: '0.68rem', padding: '1px 6px' }}>
                            {loan.daysOverdue}d Overdue
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexShrink: 0 }}>
                    <span
                      className={`badge ${loan.isOverdue ? 'badge-inactive' : 'badge-active'}`}
                      style={{ fontSize: '0.72rem' }}
                    >
                      {loan.isOverdue ? 'Overdue' : 'Checked Out'}
                    </span>
                    <button
                      type="button"
                      onClick={() => handleInitiateReturn(loan)}
                      className="btn btn-secondary"
                      style={{
                        padding: '5px 12px',
                        fontSize: '0.75rem',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '5px',
                        borderColor: loan.isOverdue ? 'rgba(239, 68, 68, 0.4)' : 'rgba(16, 185, 129, 0.4)',
                        color: loan.isOverdue ? '#f87171' : '#34d399',
                      }}
                      title="Return this book"
                    >
                      <RotateCcw size={13} />
                      <span>Return</span>
                    </button>
                  </div>
                </div>
              ))}

              {/* Informational desk notice & quick link */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: '10px',
                  padding: '10px 14px',
                  background: 'rgba(16, 185, 129, 0.06)',
                  border: '1px solid rgba(16, 185, 129, 0.2)',
                  borderRadius: 'var(--radius-md)',
                  fontSize: '0.78rem',
                  color: 'var(--text-secondary)',
                  flexWrap: 'wrap',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <CheckCircle2 size={15} style={{ color: 'var(--success)', flexShrink: 0 }} />
                  <span>
                    Self-Service Circulation: Click <strong>Return</strong> on any active book above to return it immediately.
                  </span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <button
                    type="button"
                    onClick={() => navigate('/student/loans')}
                    className="btn btn-ghost"
                    style={{ fontSize: '0.75rem', padding: '2px 8px', color: '#34d399' }}
                  >
                    <span>View All Loans</span>
                    <ArrowRight size={12} />
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Quick Book Discovery Preview */}
          <div style={{ marginTop: '12px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <BookOpen size={18} style={{ color: '#38bdf8' }} />
                <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: '#ffffff', margin: 0 }}>
                  Recent Available Titles
                </h3>
              </div>
              <button
                onClick={() => navigate('/student/books')}
                className="btn btn-ghost"
                style={{ fontSize: '0.8rem', color: '#38bdf8' }}
              >
                <span>Search All Catalog</span>
                <ArrowRight size={14} />
              </button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(230px, 1fr))', gap: '12px' }}>
              {availableBooks.slice(0, 4).map((book) => (
                <div
                  key={book.bookId}
                  className="glass-card"
                  style={{
                    padding: '14px 16px',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    gap: '10px',
                  }}
                >
                  <div>
                    <span
                      className={`badge ${book.availableCopies > 0 ? 'badge-active' : 'badge-inactive'}`}
                      style={{ fontSize: '0.68rem', marginBottom: '8px' }}
                    >
                      {book.availableCopies > 0 ? `${book.availableCopies} Available in Library` : 'Currently Out'}
                    </span>
                    <h5
                      style={{
                        fontSize: '0.9rem',
                        fontWeight: 700,
                        color: 'var(--text-primary)',
                        margin: '0 0 4px',
                        lineHeight: 1.3,
                      }}
                    >
                      {book.title}
                    </h5>
                    <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', margin: 0 }}>
                      By {book.author}
                    </p>
                  </div>
                  <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontFamily: 'monospace' }}>
                    ISBN: {book.isbn}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: Search & Campus Library Desk Information */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {/* Search Books Quick Widget */}
          <div
            className="glass-card"
            style={{
              padding: '20px',
              border: '1px solid var(--border-subtle)',
              background: 'var(--bg-surface)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px', color: '#34d399' }}>
              <Search size={18} />
              <h3 style={{ fontSize: '0.95rem', fontWeight: 700, margin: 0, color: 'var(--text-primary)' }}>
                Find Available Books
              </h3>
            </div>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', lineHeight: 1.5, margin: '0 0 14px' }}>
              Search across the library catalog to check real-time copy availability and shelf status.
            </p>
            <form onSubmit={handleSearchSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <input
                type="text"
                placeholder="Book title, author, or ISBN..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="input-field"
                style={{ fontSize: '0.85rem' }}
              />
              <button
                type="submit"
                className="btn btn-primary"
                style={{
                  background: 'linear-gradient(135deg, #059669 0%, #10b981 100%)',
                  justifyContent: 'center',
                  fontSize: '0.825rem',
                }}
              >
                <Search size={14} />
                <span>Search Catalog</span>
              </button>
            </form>
          </div>

          {/* Institutional Circulation Policy */}
          <div
            className="glass-card"
            style={{
              padding: '20px',
              border: '1px solid var(--border-subtle)',
              background: 'var(--bg-surface)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '14px' }}>
              <div
                style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: 'var(--radius-sm)',
                  background: 'rgba(99, 102, 241, 0.15)',
                  color: 'var(--primary)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Clock size={16} />
              </div>
              <h3 style={{ fontSize: '0.95rem', fontWeight: 700, color: '#ffffff', margin: 0 }}>
                Circulation Desk Policy
              </h3>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', fontSize: '0.825rem' }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
                <span style={{ color: 'var(--success)', fontWeight: 800 }}>•</span>
                <div>
                  <strong style={{ color: 'var(--text-primary)' }}>Self-Service Circulation:</strong>{' '}
                  <span style={{ color: 'var(--text-secondary)' }}>Borrow books directly from the online catalog and return active items with 1-click tracking.</span>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
                <span style={{ color: 'var(--accent-cyan)', fontWeight: 800 }}>•</span>
                <div>
                  <strong style={{ color: 'var(--text-primary)' }}>Standard Loan Period:</strong>{' '}
                  <span style={{ color: 'var(--text-secondary)' }}>Books are issued for <strong>{periodDays} calendar days</strong> from the date of checkout.</span>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
                <span style={{ color: 'var(--warning)', fontWeight: 800 }}>•</span>
                <div>
                  <strong style={{ color: 'var(--text-primary)' }}>Member Quota Limit:</strong>{' '}
                  <span style={{ color: 'var(--text-secondary)' }}>Max <strong>{borrowingLimit} concurrent books</strong> per student record.</span>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
                <span style={{ color: '#f87171', fontWeight: 800 }}>•</span>
                <div>
                  <strong style={{ color: 'var(--text-primary)' }}>Overdue Late Fine:</strong>{' '}
                  <span style={{ color: 'var(--text-secondary)' }}>Accrues at <strong>₹{Number(finePerDay).toFixed(2)} per day</strong> for overdue items.</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Return Confirmation Modal */}
      {isReturnModalOpen && loanToReturn && (
        <Modal
          isOpen={isReturnModalOpen}
          onClose={() => {
            if (!isReturning) {
              setIsReturnModalOpen(false);
              setLoanToReturn(null);
            }
          }}
          title="Return Borrowed Book"
          subtitle={`PUT /api/loans/${loanToReturn.loanId}/return — Return copy to Librix collection`}
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

            {/* Schedule Details */}
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 140px), 1fr))',
                gap: '10px',
              }}
            >
              <div style={{ padding: '10px 12px', backgroundColor: 'var(--bg-surface-elevated)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-subtle)' }}>
                <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', display: 'block' }}>Borrowed Date</span>
                <strong style={{ fontSize: '0.85rem', color: 'var(--text-primary)' }}>{loanToReturn.issueDate || 'Recent'}</strong>
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
                    Overdue Notice ({loanToReturn.daysOverdue} days late)
                  </div>
                  <div style={{ color: 'var(--text-secondary)' }}>
                    Accrued Late Penalty: <strong style={{ color: '#ffffff' }}>₹{Number(loanToReturn.fine || (loanToReturn.daysOverdue * finePerDay)).toFixed(2)}</strong>.
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
                <span>On-time return. Book will be restored to available catalog stock immediately.</span>
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
                  setIsReturnModalOpen(false);
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
          setReceiptLoan(null);
        }}
        loan={receiptLoan}
        isReturn={true}
      />

      {/* Toast Feedback */}
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
    </div>
  );
}
