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
  Info
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { loanService, BORROWING_LIMIT, LOAN_PERIOD_DAYS } from '../../api/loanService';
import { bookService } from '../../api/bookService';

export default function StudentDashboardPage({ refreshTrigger, onApiStatusChange }) {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [myLoans, setMyLoans] = useState([]);
  const [activeLoans, setActiveLoans] = useState([]);
  const [availableBooks, setAvailableBooks] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');

  const fetchStudentData = useCallback(async () => {
    setLoading(true);
    try {
      const [allLoans, booksRes] = await Promise.all([
        loanService.getAllLoans({ size: 100 }),
        bookService.getBooks({ page: 0, size: 6, sortBy: 'bookId', direction: 'desc' }).catch(() => ({ content: [] })),
      ]);

      if (onApiStatusChange) onApiStatusChange('online');

      // Filter only current student's own borrowing history
      const studentMemberId = Number(user?.memberId);
      const studentLoans = (allLoans || []).filter(
        (l) => Number(l.memberId) === studentMemberId
      );

      setMyLoans(studentLoans);
      setActiveLoans(studentLoans.filter((l) => l.status === 'ACTIVE'));
      setAvailableBooks(booksRes?.content || []);
    } catch (err) {
      console.error('[StudentDashboard] Error fetching data:', err);
      if (onApiStatusChange) onApiStatusChange('error');
    } finally {
      setLoading(false);
    }
  }, [user?.memberId, onApiStatusChange]);

  useEffect(() => {
    fetchStudentData();
  }, [fetchStudentData, refreshTrigger]);

  const activeCount = activeLoans.length;
  const overdueLoans = activeLoans.filter((l) => l.isOverdue);
  const totalFines = activeLoans.reduce((sum, l) => sum + (Number(l.fine) || 0), 0);
  const quotaPercentage = Math.min(100, Math.round((activeCount / BORROWING_LIMIT) * 100));

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
              <span>STUDENT / MEMBER PORTAL</span>
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
            {activeCount} <span style={{ fontSize: '0.9rem', color: 'var(--text-muted)', fontWeight: 500 }}>/ {BORROWING_LIMIT} Max</span>
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
              <span>{Math.max(0, BORROWING_LIMIT - activeCount)} quota remaining</span>
              <span>Limit: {BORROWING_LIMIT} books</span>
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
            ${totalFines.toFixed(2)}
          </div>
          <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '6px' }}>
            {totalFines > 0 ? '$5.00/day fine active' : 'No outstanding fines on record'}
          </p>
        </div>
      </div>

      {/* Main Grid: Active Loans (Read-Only) & Catalog Discovery Search */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr', gap: '24px' }}>
        {/* Left Column: My Current Active Loans (Read-Only) */}
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
                You currently have no books checked out. You have {BORROWING_LIMIT} available slots to borrow literature at the library circulation desk.
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
                    padding: '18px 20px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: '16px',
                    borderLeft: loan.isOverdue ? '4px solid var(--danger)' : '4px solid var(--success)',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '14px', minWidth: 0 }}>
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

                    <div style={{ minWidth: 0 }}>
                      <h4
                        style={{
                          fontSize: '0.95rem',
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
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                        <span>Issued: {loan.issueDate || 'Recent'}</span>
                        <span>•</span>
                        <span style={{ color: loan.isOverdue ? 'var(--danger)' : '#fbbf24', fontWeight: 600 }}>
                          Due Date: {loan.dueDate || 'Standard (8 days)'}
                        </span>
                        {loan.isOverdue && (
                          <span className="badge badge-inactive" style={{ fontSize: '0.68rem', padding: '1px 6px' }}>
                            {loan.daysOverdue}d Overdue
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  <span
                    className={`badge ${loan.isOverdue ? 'badge-inactive' : 'badge-active'}`}
                    style={{ fontSize: '0.72rem', flexShrink: 0 }}
                  >
                    {loan.isOverdue ? 'Overdue' : 'Checked Out'}
                  </span>
                </div>
              ))}

              {/* Informational desk notice */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '10px 14px',
                  background: 'rgba(255, 255, 255, 0.03)',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: 'var(--radius-md)',
                  fontSize: '0.78rem',
                  color: 'var(--text-muted)',
                }}
              >
                <Info size={15} style={{ color: '#38bdf8', flexShrink: 0 }} />
                <span>
                  To return borrowed books, please hand them in at the <strong>Library Circulation Desk</strong> with your Member ID.
                </span>
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
                  <strong style={{ color: 'var(--text-primary)' }}>Desk Checkout & Returns:</strong>{' '}
                  <span style={{ color: 'var(--text-secondary)' }}>All book borrowings and returns are administered by library staff at the physical desk.</span>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
                <span style={{ color: 'var(--accent-cyan)', fontWeight: 800 }}>•</span>
                <div>
                  <strong style={{ color: 'var(--text-primary)' }}>Standard Loan Period:</strong>{' '}
                  <span style={{ color: 'var(--text-secondary)' }}>Books are issued for <strong>{LOAN_PERIOD_DAYS} calendar days</strong> from the date of checkout.</span>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
                <span style={{ color: 'var(--warning)', fontWeight: 800 }}>•</span>
                <div>
                  <strong style={{ color: 'var(--text-primary)' }}>Member Quota Limit:</strong>{' '}
                  <span style={{ color: 'var(--text-secondary)' }}>Max <strong>{BORROWING_LIMIT} concurrent books</strong> per student record.</span>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
                <span style={{ color: '#f87171', fontWeight: 800 }}>•</span>
                <div>
                  <strong style={{ color: 'var(--text-primary)' }}>Overdue Late Fine:</strong>{' '}
                  <span style={{ color: 'var(--text-secondary)' }}>Accrues at <strong>$5.00 per day</strong> for overdue items.</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
