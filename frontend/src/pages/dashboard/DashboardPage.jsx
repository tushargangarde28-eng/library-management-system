import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  BookOpen, 
  Users, 
  CheckCircle2, 
  Layers, 
  TrendingUp, 
  PlusCircle, 
  ArrowRight, 
  AlertTriangle, 
  RefreshCw,
  Library,
  BookmarkCheck,
  ShieldAlert,
  Sparkles,
  ArrowLeftRight,
  RotateCcw
} from 'lucide-react';
import StatCard from '../../components/common/StatCard';
import StatusBadge from '../../components/common/StatusBadge';
import { bookService } from '../../api/bookService';
import { memberService } from '../../api/memberService';
import { loanService } from '../../api/loanService';

export default function DashboardPage({ refreshTrigger, onApiStatusChange }) {
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Stats state
  const [stats, setStats] = useState({
    totalTitles: 0,
    totalCopies: 0,
    availableCopies: 0,
    borrowedCopies: 0,
    activeMembers: 0,
    inactiveMembers: 0,
    totalMembers: 0,
    activeLoans: 0,
    totalLoans: 0,
  });

  const [recentBooks, setRecentBooks] = useState([]);
  const [recentMembers, setRecentMembers] = useState([]);

  const fetchDashboardData = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      // Parallel requests to books, members, and live loans endpoints
      const [booksData, activeMembersData, inactiveMembersData, loansData] = await Promise.all([
        bookService.getBooks({ page: 0, size: 8, sortBy: 'bookId', direction: 'desc' }),
        memberService.getMembers({ page: 0, size: 8, status: 'ACTIVE' }),
        memberService.getMembers({ page: 0, size: 1, status: 'INACTIVE' }).catch((err) => {
          console.warn('[Dashboard] Could not fetch inactive members count:', err);
          return { totalElements: 0, content: [] };
        }),
        loanService.getAllLoans().catch((err) => {
          console.warn('[Dashboard] Could not fetch loans from GET /api/loans:', err);
          return [];
        }),
      ]);

      if (onApiStatusChange) onApiStatusChange('online');

      // Aggregate Books stats
      const booksList = booksData?.content || [];
      const totalTitles = booksData?.totalElements || booksList.length;

      let totalCopiesCount = 0;
      let availableCopiesCount = 0;

      booksList.forEach((b) => {
        totalCopiesCount += Number(b.totalCopies || 0);
        availableCopiesCount += Number(b.availableCopies || 0);
      });

      // Aggregate Loans stats from GET /api/loans
      const allLoansList = Array.isArray(loansData) ? loansData : [];
      const activeLoansCount = allLoansList.filter((l) => l.status === 'ACTIVE').length;
      const borrowedCopiesCount = activeLoansCount > 0 
        ? activeLoansCount 
        : Math.max(0, totalCopiesCount - availableCopiesCount);

      // Aggregate Members stats
      const activeMembersCount = activeMembersData?.totalElements || 0;
      const inactiveMembersCount = inactiveMembersData?.totalElements || 0;

      setStats({
        totalTitles,
        totalCopies: totalCopiesCount,
        availableCopies: availableCopiesCount,
        borrowedCopies: borrowedCopiesCount,
        activeMembers: activeMembersCount,
        inactiveMembers: inactiveMembersCount,
        totalMembers: activeMembersCount + inactiveMembersCount,
        activeLoans: activeLoansCount,
        totalLoans: allLoansList.length,
      });

      setRecentBooks(booksList.slice(0, 5));
      setRecentMembers((activeMembersData?.content || []).slice(0, 5));
    } catch (err) {
      console.error('[DashboardPage Error] Failed to aggregate dashboard metrics:', err);
      setError(
        err.message || 'Unable to connect to the backend server. Please verify Spring Boot is running on port 8080.'
      );
      if (onApiStatusChange) onApiStatusChange('error');
    } finally {
      setLoading(false);
    }
  }, [onApiStatusChange]);

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData, refreshTrigger]);

  const availabilityRate =
    stats.totalCopies > 0
      ? Math.round((stats.availableCopies / stats.totalCopies) * 100)
      : 100;

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Welcome Banner */}
      <div
        className="glass-card"
        style={{
          padding: '24px 28px',
          background: 'linear-gradient(135deg, rgba(30, 41, 59, 0.85) 0%, rgba(15, 23, 42, 0.95) 100%)',
          border: '1px solid rgba(99, 102, 241, 0.2)',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        <div
          style={{
            position: 'absolute',
            top: '-50px',
            right: '-30px',
            width: '240px',
            height: '240px',
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(99, 102, 241, 0.15) 0%, transparent 70%)',
            pointerEvents: 'none',
          }}
        />

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
          <div style={{ minWidth: 0, flex: '1 1 300px' }}>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', marginBottom: '8px', flexWrap: 'wrap' }}>
              <span className="badge badge-info" style={{ textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                <Sparkles size={12} /> System Active
              </span>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                {new Date().toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })}
              </span>
            </div>
            <h2 style={{ fontSize: '1.45rem', fontWeight: 800, color: '#ffffff', letterSpacing: '-0.02em', margin: 0 }}>
              Library Administration Portal
            </h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', maxWidth: '650px', marginTop: '4px' }}>
              Real-time monitoring of library catalog assets, patron memberships, and inventory circulation.
            </p>
          </div>

          <div className="header-actions-wrap">
            <button
              onClick={() => navigate('/loans')}
              className="btn btn-primary"
              style={{
                boxShadow: '0 4px 16px rgba(99, 102, 241, 0.35)',
              }}
            >
              <ArrowLeftRight size={16} />
              <span>Circulation Desk</span>
            </button>
            <button
              onClick={() => navigate('/books')}
              className="btn btn-secondary"
            >
              <PlusCircle size={16} />
              <span>Catalog</span>
            </button>
            <button
              onClick={() => navigate('/members')}
              className="btn btn-secondary"
            >
              <Users size={16} />
              <span>Members</span>
            </button>
          </div>
        </div>
      </div>

      {/* Error Alert if backend failed */}
      {error && (
        <div
          className="glass-card"
          style={{
            padding: '16px 20px',
            border: '1px solid rgba(239, 68, 68, 0.4)',
            backgroundColor: 'rgba(239, 68, 68, 0.08)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '14px',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', minWidth: 0 }}>
            <ShieldAlert size={22} color="var(--danger)" style={{ flexShrink: 0 }} />
            <div>
              <div style={{ fontWeight: 600, color: 'var(--danger)', fontSize: '0.9rem' }}>
                Backend Service Connection Notice
              </div>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                {error} (Check browser console for diagnostics)
              </div>
            </div>
          </div>
          <button
            onClick={fetchDashboardData}
            className="btn btn-secondary"
            style={{ padding: '6px 14px', fontSize: '0.8rem' }}
          >
            <RefreshCw size={14} /> Retry
          </button>
        </div>
      )}

      {/* Primary KPI Grid */}
      <div className="responsive-kpi-grid">
        <StatCard
          title="Total Book Titles"
          value={stats.totalTitles.toLocaleString()}
          subtitle="Cataloged in library database"
          icon={BookOpen}
          color="primary"
          loading={loading}
          badgeText="Catalog"
          onClick={() => navigate('/books')}
        />

        <StatCard
          title="Available Inventory"
          value={stats.availableCopies.toLocaleString()}
          subtitle={`${availabilityRate}% of total copies ready for checkout`}
          icon={BookmarkCheck}
          color="success"
          loading={loading}
          badgeText={`${availabilityRate}%`}
        />

        <StatCard
          title="Active Members"
          value={stats.activeMembers.toLocaleString()}
          subtitle={`${stats.inactiveMembers} inactive accounts`}
          icon={Users}
          color="info"
          loading={loading}
          badgeText="Patrons"
          onClick={() => navigate('/members')}
        />

        <StatCard
          title="Total Physical Copies"
          value={stats.totalCopies.toLocaleString()}
          subtitle={`${stats.borrowedCopies} estimated currently on loan`}
          icon={Layers}
          color="warning"
          loading={loading}
          badgeText="Stock"
        />
      </div>

      {/* Inventory Health & Breakdown */}
      <div
        className="glass-card"
        style={{
          padding: '20px 24px',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px', marginBottom: '14px' }}>
          <div>
            <h3 style={{ fontSize: '0.98rem', fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>
              Inventory Health Ratio
            </h3>
            <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', margin: '2px 0 0' }}>
              Proportion of shelf-available volumes vs. circulating inventory
            </p>
          </div>
          <span style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--success)' }}>
            {availabilityRate}% In-Stock
          </span>
        </div>

        {/* Multi-segment progress bar */}
        <div
          style={{
            height: '10px',
            borderRadius: 'var(--radius-full)',
            backgroundColor: 'rgba(255, 255, 255, 0.08)',
            overflow: 'hidden',
            display: 'flex',
          }}
        >
          <div
            style={{
              width: `${availabilityRate}%`,
              backgroundColor: 'var(--success)',
              boxShadow: '0 0 10px rgba(16, 185, 129, 0.5)',
              transition: 'width 0.8s ease',
            }}
            title={`Available: ${stats.availableCopies}`}
          />
          <div
            style={{
              width: `${100 - availabilityRate}%`,
              backgroundColor: 'var(--warning)',
              transition: 'width 0.8s ease',
            }}
            title={`Circulating: ${stats.borrowedCopies}`}
          />
        </div>

        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '20px', marginTop: '14px', fontSize: '0.8rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: 'var(--success)', flexShrink: 0 }} />
            <span style={{ color: 'var(--text-secondary)' }}>Available on Shelf: <strong style={{ color: '#fff' }}>{stats.availableCopies}</strong></span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: 'var(--warning)', flexShrink: 0 }} />
            <span style={{ color: 'var(--text-secondary)' }}>Circulating / Borrowed: <strong style={{ color: '#fff' }}>{stats.borrowedCopies}</strong></span>
          </div>
        </div>
      </div>

      {/* Circulation Desk Quick Hub Banner */}
      <div
        className="glass-card"
        style={{
          padding: '20px 24px',
          background: 'linear-gradient(135deg, rgba(30, 41, 59, 0.7) 0%, rgba(19, 29, 49, 0.85) 100%)',
          border: '1px solid rgba(99, 102, 241, 0.25)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '16px',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px', minWidth: 0, flex: '1 1 280px' }}>
          <div
            style={{
              width: '44px',
              height: '44px',
              borderRadius: 'var(--radius-md)',
              background: 'linear-gradient(135deg, #6366f1 0%, #3b82f6 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#ffffff',
              boxShadow: '0 0 16px rgba(99, 102, 241, 0.4)',
              flexShrink: 0,
            }}
          >
            <ArrowLeftRight size={22} />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
              <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: '#ffffff', margin: 0 }}>
                Circulation Desk & Loan Management
              </h3>
              <span className="badge badge-active" style={{ fontSize: '0.68rem' }}>
                {stats.activeLoans > 0 ? `${stats.activeLoans} Active Loans` : 'REST APIs Active'} • GET /api/loans
              </span>
            </div>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', margin: '3px 0 0' }}>
              Live database records from <code>GET /api/loans</code>, issue books with <code>POST /api/loans/borrow</code>, and process returns with <code>PUT /api/loans/{'{id}'}/return</code>
            </p>
          </div>
        </div>

        <div className="header-actions-wrap">
          <button
            onClick={() => navigate('/loans')}
            className="btn btn-secondary"
            style={{ borderColor: 'rgba(16, 185, 129, 0.3)', color: '#34d399' }}
          >
            <RotateCcw size={15} />
            <span>Process Return</span>
          </button>
          <button
            onClick={() => navigate('/loans')}
            className="btn btn-primary"
          >
            <ArrowLeftRight size={15} />
            <span>Open Circulation Desk</span>
          </button>
        </div>
      </div>

      {/* Two Column Grid: Recent Books & Recent Members */}
      <div className="responsive-card-grid">
        {/* Recent Books Widget */}
        <div className="glass-card" style={{ padding: '20px', display: 'flex', flexDirection: 'column' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div
                style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: 'var(--radius-sm)',
                  backgroundColor: 'rgba(99, 102, 241, 0.14)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'var(--primary)',
                }}
              >
                <BookOpen size={18} />
              </div>
              <h3 style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>
                Catalog Highlights
              </h3>
            </div>

            <button
              onClick={() => navigate('/books')}
              className="btn-ghost"
              style={{ fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '4px', color: 'var(--text-secondary)', padding: '4px 8px' }}
            >
              <span>View All</span>
              <ArrowRight size={14} />
            </button>
          </div>

          <div style={{ flex: 1 }}>
            {loading ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="skeleton" style={{ height: '48px', width: '100%' }} />
                ))}
              </div>
            ) : recentBooks.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '36px 16px', color: 'var(--text-muted)' }}>
                <BookOpen size={36} style={{ margin: '0 auto 10px', opacity: 0.3 }} />
                <p style={{ fontSize: '0.875rem' }}>No books found in catalog.</p>
                <button
                  onClick={() => navigate('/books')}
                  className="btn btn-secondary"
                  style={{ marginTop: '12px', fontSize: '0.8rem' }}
                >
                  Add First Book
                </button>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {recentBooks.map((book) => (
                  <div
                    key={book.bookId}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '10px 12px',
                      borderRadius: 'var(--radius-md)',
                      backgroundColor: 'rgba(255, 255, 255, 0.02)',
                      border: '1px solid var(--border-subtle)',
                      gap: '8px',
                    }}
                  >
                    <div style={{ display: 'flex', flexDirection: 'column', minWidth: 0, flex: 1 }}>
                      <span style={{ fontWeight: 600, fontSize: '0.875rem', color: 'var(--text-primary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {book.title}
                      </span>
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        by {book.author} &bull; <span className="font-mono">{book.isbn}</span>
                      </span>
                    </div>

                    <div style={{ flexShrink: 0, textAlign: 'right' }}>
                      <StatusBadge status={book.availableCopies} type="stock" />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Recent Members Widget */}
        <div className="glass-card" style={{ padding: '20px', display: 'flex', flexDirection: 'column' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div
                style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: 'var(--radius-sm)',
                  backgroundColor: 'rgba(6, 182, 212, 0.14)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'var(--accent-cyan)',
                }}
              >
                <Users size={18} />
              </div>
              <h3 style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>
                Active Members Directory
              </h3>
            </div>

            <button
              onClick={() => navigate('/members')}
              className="btn-ghost"
              style={{ fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '4px', color: 'var(--text-secondary)', padding: '4px 8px' }}
            >
              <span>View All</span>
              <ArrowRight size={14} />
            </button>
          </div>

          <div style={{ flex: 1 }}>
            {loading ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="skeleton" style={{ height: '48px', width: '100%' }} />
                ))}
              </div>
            ) : recentMembers.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '36px 16px', color: 'var(--text-muted)' }}>
                <Users size={36} style={{ margin: '0 auto 10px', opacity: 0.3 }} />
                <p style={{ fontSize: '0.875rem' }}>No active members found.</p>
                <button
                  onClick={() => navigate('/members')}
                  className="btn btn-secondary"
                  style={{ marginTop: '12px', fontSize: '0.8rem' }}
                >
                  Register Member
                </button>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {recentMembers.map((member) => (
                  <div
                    key={member.memberId}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '10px 12px',
                      borderRadius: 'var(--radius-md)',
                      backgroundColor: 'rgba(255, 255, 255, 0.02)',
                      border: '1px solid var(--border-subtle)',
                      gap: '8px',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', minWidth: 0, flex: 1 }}>
                      <div
                        style={{
                          width: '32px',
                          height: '32px',
                          borderRadius: '50%',
                          backgroundColor: 'rgba(255, 255, 255, 0.08)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: '0.75rem',
                          fontWeight: 700,
                          color: '#ffffff',
                          flexShrink: 0,
                        }}
                      >
                        {member.name ? member.name.charAt(0).toUpperCase() : 'M'}
                      </div>
                      <div style={{ display: 'flex', flexDirection: 'column', minWidth: 0 }}>
                        <span style={{ fontWeight: 600, fontSize: '0.875rem', color: 'var(--text-primary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {member.name}
                        </span>
                        <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {member.email}
                        </span>
                      </div>
                    </div>

                    <div style={{ flexShrink: 0, display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <span
                        className="topbar-admin-role"
                        style={{
                          fontSize: '0.65rem',
                          padding: '2px 6px',
                          borderRadius: 'var(--radius-sm)',
                          backgroundColor: 'rgba(255, 255, 255, 0.06)',
                          color: 'var(--text-secondary)',
                          fontWeight: 600,
                        }}
                      >
                        {member.role || 'STUDENT'}
                      </span>
                      <StatusBadge status={member.status} type="member" />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
