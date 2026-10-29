import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  AlertTriangle,
  FileSpreadsheet,
  Printer,
  RefreshCw,
  Search,
  Clock,
  IndianRupee,
  Users,
  BookOpen,
  Calendar,
  RotateCcw,
  Receipt,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  ShieldAlert,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  Filter,
  Layers,
  X
} from 'lucide-react';
import StatCard from '../../components/common/StatCard';
import StatusBadge from '../../components/common/StatusBadge';
import Toast from '../../components/common/Toast';
import { loanService, FINE_PER_DAY } from '../../api/loanService';
import ReturnBookModal from '../loans/ReturnBookModal';
import LoanReceiptModal from '../loans/LoanReceiptModal';

export default function OverdueReportsPage() {
  const [loans, setLoans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastRefreshed, setLastRefreshed] = useState(null);

  // Filters & Sorting
  const [searchTerm, setSearchTerm] = useState('');
  const [severityFilter, setSeverityFilter] = useState('ALL'); // 'ALL' | 'MODERATE' | 'ELEVATED' | 'CRITICAL'
  const [sortBy, setSortBy] = useState('daysOverdue'); // 'daysOverdue' | 'dueDate' | 'accruedFine' | 'memberName' | 'bookTitle' | 'loanId'
  const [sortDirection, setSortDirection] = useState('desc');

  // Modals
  const [isReturnModalOpen, setIsReturnModalOpen] = useState(false);
  const [loanToReturn, setLoanToReturn] = useState(null);
  const [isReceiptModalOpen, setIsReceiptModalOpen] = useState(false);
  const [receiptLoan, setReceiptLoan] = useState(null);

  // Toast feedback
  const [toast, setToast] = useState(null);
  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => {
      setToast(null);
    }, 4500);
  };

  // Fetch overdue loans from backend API GET /api/loans/overdueLoans
  const fetchOverdueLoans = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await loanService.getOverdueLoans();
      setLoans(data);
      setLastRefreshed(new Date());
    } catch (err) {
      console.error('[OverdueReportsPage] Error loading overdue loans from backend:', err);
      const msg = err.message || 'Failed to fetch overdue loans from backend API.';
      setError(msg);
      showToast(msg, 'error');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchOverdueLoans();
  }, [fetchOverdueLoans]);

  // Overall Statistics from live overdue loans
  const stats = useMemo(() => {
    const totalOverdue = loans.length;
    const uniqueMembers = new Set(loans.map((l) => l.memberId)).size;
    const criticalOverdue = loans.filter((l) => (l.daysOverdue || 0) > 14).length;
    const totalAccruedFine = loans.reduce((acc, l) => acc + (Number(l.accruedFine) || 0), 0);

    return {
      totalOverdue,
      uniqueMembers,
      criticalOverdue,
      totalAccruedFine,
    };
  }, [loans]);

  // Handle column header sorting
  const handleSort = (field) => {
    if (sortBy === field) {
      setSortDirection((prev) => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortBy(field);
      setSortDirection('desc');
    }
  };

  const renderSortIndicator = (field) => {
    if (sortBy !== field) {
      return <ArrowUpDown size={13} style={{ opacity: 0.35, flexShrink: 0 }} />;
    }
    return sortDirection === 'asc' ? (
      <ArrowUp size={14} style={{ color: 'var(--primary)', flexShrink: 0 }} />
    ) : (
      <ArrowDown size={14} style={{ color: 'var(--primary)', flexShrink: 0 }} />
    );
  };

  // Filtered and Sorted Records
  const displayedLoans = useMemo(() => {
    let result = [...loans];

    // Search filter
    if (searchTerm.trim()) {
      const q = searchTerm.toLowerCase().trim();
      result = result.filter((l) => {
        const idMatch = String(l.loanId).includes(q);
        const bookIdMatch = String(l.bookId).includes(q);
        const memberIdMatch = String(l.memberId).includes(q);
        const titleMatch = l.bookTitle && l.bookTitle.toLowerCase().includes(q);
        const nameMatch = l.memberName && l.memberName.toLowerCase().includes(q);
        return idMatch || bookIdMatch || memberIdMatch || titleMatch || nameMatch;
      });
    }

    // Severity filter
    if (severityFilter === 'MODERATE') {
      // 1 - 7 days overdue
      result = result.filter((l) => (l.daysOverdue || 0) <= 7);
    } else if (severityFilter === 'ELEVATED') {
      // 8 - 14 days overdue
      result = result.filter((l) => (l.daysOverdue || 0) >= 8 && (l.daysOverdue || 0) <= 14);
    } else if (severityFilter === 'CRITICAL') {
      // > 14 days overdue
      result = result.filter((l) => (l.daysOverdue || 0) > 14);
    }

    // Sort
    result.sort((a, b) => {
      let valA = a[sortBy];
      let valB = b[sortBy];

      if (sortBy === 'dueDate' || sortBy === 'issueDate') {
        valA = new Date(valA || 0).getTime();
        valB = new Date(valB || 0).getTime();
      } else if (typeof valA === 'string') {
        valA = valA.toLowerCase();
        valB = (valB || '').toLowerCase();
      } else {
        valA = Number(valA || 0);
        valB = Number(valB || 0);
      }

      if (valA < valB) return sortDirection === 'asc' ? -1 : 1;
      if (valA > valB) return sortDirection === 'asc' ? 1 : -1;
      return 0;
    });

    return result;
  }, [loans, searchTerm, severityFilter, sortBy, sortDirection]);

  // Export to CSV Function
  const handleExportCSV = () => {
    if (displayedLoans.length === 0) {
      showToast('No overdue loan records available to export.', 'warning');
      return;
    }

    const headers = [
      'Loan ID',
      'Member ID',
      'Member Name',
      'Book ID',
      'Book Title',
      'Issue Date',
      'Due Date',
      'Days Overdue',
      'Accrued Fine (₹)',
      'Status',
    ];

    const rows = displayedLoans.map((l) => [
      l.loanId,
      l.memberId,
      `"${(l.memberName || '').replace(/"/g, '""')}"`,
      l.bookId,
      `"${(l.bookTitle || '').replace(/"/g, '""')}"`,
      l.issueDate || '',
      l.dueDate || '',
      l.daysOverdue || 0,
      l.accruedFine || 0,
      l.status || 'ACTIVE',
    ]);

    const csvContent =
      'data:text/csv;charset=utf-8,\uFEFF' +
      [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    const dateStr = new Date().toISOString().slice(0, 10);
    link.setAttribute('download', `overdue-loans-report-${dateStr}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    showToast(`Exported ${displayedLoans.length} overdue records to CSV successfully.`, 'success');
  };

  // Print function
  const handlePrint = () => {
    window.print();
  };

  // Process return modal trigger
  const handleOpenReturn = (loan) => {
    setLoanToReturn(loan);
    setIsReturnModalOpen(true);
  };

  // View receipt modal trigger
  const handleOpenReceipt = (loan) => {
    setReceiptLoan(loan);
    setIsReceiptModalOpen(true);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Toast Notification */}
      <Toast toast={toast} onClose={() => setToast(null)} />

      {/* Header Section */}
      <div
        className="glass-card page-header-card print-header"
        style={{
          padding: '24px 28px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '16px',
        }}
      >
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px' }}>
            <div
              style={{
                width: '36px',
                height: '36px',
                borderRadius: 'var(--radius-md)',
                backgroundColor: 'rgba(239, 68, 68, 0.15)',
                color: 'var(--danger)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 0 15px rgba(239, 68, 68, 0.2)',
              }}
            >
              <AlertTriangle size={20} />
            </div>
            <h1 style={{ fontSize: '1.45rem', fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.02em' }}>
              Overdue Loans & Penalties Report
            </h1>
            <span
              style={{
                fontSize: '0.72rem',
                fontWeight: 700,
                padding: '3px 9px',
                borderRadius: 'var(--radius-full)',
                backgroundColor: 'rgba(239, 68, 68, 0.15)',
                color: '#f87171',
                border: '1px solid rgba(239, 68, 68, 0.3)',
                letterSpacing: '0.04em',
                textTransform: 'uppercase',
              }}
            >
              API Audit
            </span>
          </div>

          <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', margin: 0 }}>
            Live circulation audit from Spring Boot backend endpoint{' '}
            <code style={{ color: 'var(--primary)', backgroundColor: 'var(--primary-light)', padding: '2px 6px', borderRadius: '4px' }}>
              GET /api/loans/overdueLoans
            </code>
            {lastRefreshed && (
              <span style={{ marginLeft: '10px', color: 'var(--text-muted)', fontSize: '0.8rem' }}>
                • Updated at {lastRefreshed.toLocaleTimeString()}
              </span>
            )}
          </p>
        </div>

        {/* Action Buttons (Hidden when printing) */}
        <div className="no-print" style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
          <button
            type="button"
            className="btn btn-secondary"
            onClick={fetchOverdueLoans}
            disabled={loading}
            title="Refresh overdue records directly from database"
          >
            <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
            <span>Refresh</span>
          </button>

          <button
            type="button"
            className="btn btn-secondary"
            onClick={handleExportCSV}
            disabled={loading || displayedLoans.length === 0}
            title="Download CSV report file"
          >
            <FileSpreadsheet size={16} />
            <span>Export CSV</span>
          </button>

          <button
            type="button"
            className="btn btn-primary"
            onClick={handlePrint}
            title="Print or save as PDF"
          >
            <Printer size={16} />
            <span>Print Report</span>
          </button>
        </div>
      </div>

      {/* KPI Metric Summary Cards */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(230px, 1fr))',
          gap: '16px',
        }}
      >
        <StatCard
          title="Total Overdue Loans"
          value={stats.totalOverdue}
          subtitle="Circulating items past agreed due date"
          icon={AlertTriangle}
          color="danger"
          loading={loading}
          badgeText="Active Defaulters"
        />

        <StatCard
          title="Delinquent Patrons"
          value={stats.uniqueMembers}
          subtitle="Distinct patrons with past-due books"
          icon={Users}
          color="warning"
          loading={loading}
          badgeText="Patron Count"
        />

        <StatCard
          title="Accrued Penalties"
          value={`₹${stats.totalAccruedFine.toLocaleString('en-IN')}`}
          subtitle={`Calculated at ₹${FINE_PER_DAY}/day overdue rate`}
          icon={IndianRupee}
          color="danger"
          loading={loading}
          badgeText="Receivables"
        />

        <StatCard
          title="Critical Delinquency"
          value={stats.criticalOverdue}
          subtitle="Severe overdue loans exceeding 14 days"
          icon={Clock}
          color="info"
          loading={loading}
          badgeText="> 14 Days"
        />
      </div>

      {/* Error Alert if API call failed */}
      {error && !loading && (
        <div
          className="glass-card"
          style={{
            padding: '16px 20px',
            borderColor: 'rgba(239, 68, 68, 0.4)',
            backgroundColor: 'rgba(239, 68, 68, 0.1)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '12px',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <AlertCircle size={20} color="var(--danger)" />
            <div>
              <div style={{ fontWeight: 600, color: '#fca5a5', fontSize: '0.9rem' }}>
                Failed to load overdue records
              </div>
              <div style={{ fontSize: '0.82rem', color: '#fecaca' }}>{error}</div>
            </div>
          </div>
          <button
            type="button"
            className="btn btn-secondary"
            onClick={fetchOverdueLoans}
            style={{ padding: '6px 14px', fontSize: '0.8rem' }}
          >
            Retry API
          </button>
        </div>
      )}

      {/* Main Table Card */}
      <div className="glass-card" style={{ padding: '20px 24px', display: 'flex', flexDirection: 'column', gap: '18px' }}>
        {/* Controls Bar (Search, Severity Filters, Sorting) */}
        <div
          className="no-print"
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '14px',
          }}
        >
          {/* Search Input */}
          <div style={{ position: 'relative', width: '100%', maxWidth: '340px' }}>
            <Search
              size={16}
              style={{
                position: 'absolute',
                left: '12px',
                top: '50%',
                transform: 'translateY(-50%)',
                color: 'var(--text-muted)',
              }}
            />
            <input
              type="text"
              placeholder="Search by patron, book, or loan ID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{
                width: '100%',
                padding: '9px 36px 9px 38px',
                backgroundColor: 'var(--bg-surface-elevated)',
                border: '1px solid var(--border-subtle)',
                borderRadius: 'var(--radius-md)',
                color: 'var(--text-primary)',
                fontSize: '0.875rem',
                outline: 'none',
              }}
            />
            {searchTerm && (
              <button
                type="button"
                onClick={() => setSearchTerm('')}
                style={{
                  position: 'absolute',
                  right: '10px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  color: 'var(--text-muted)',
                  padding: '2px',
                }}
              >
                <X size={14} />
              </button>
            )}
          </div>

          {/* Severity Tabs Filter */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              backgroundColor: 'var(--bg-surface-elevated)',
              padding: '3px',
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--border-subtle)',
              gap: '4px',
            }}
          >
            {[
              { id: 'ALL', label: 'All Overdue' },
              { id: 'MODERATE', label: '1–7 Days' },
              { id: 'ELEVATED', label: '8–14 Days' },
              { id: 'CRITICAL', label: '> 14 Days' },
            ].map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setSeverityFilter(tab.id)}
                style={{
                  padding: '6px 12px',
                  borderRadius: 'var(--radius-sm)',
                  fontSize: '0.8rem',
                  fontWeight: severityFilter === tab.id ? 700 : 500,
                  backgroundColor: severityFilter === tab.id ? 'var(--primary)' : 'transparent',
                  color: severityFilter === tab.id ? '#ffffff' : 'var(--text-secondary)',
                  transition: 'all var(--transition-fast)',
                }}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Overdue Loans Table */}
        <div style={{ overflowX: 'auto', borderRadius: 'var(--radius-md)' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', minWidth: '780px' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border-subtle)', backgroundColor: 'rgba(255, 255, 255, 0.02)' }}>
                <th
                  onClick={() => handleSort('loanId')}
                  style={{
                    padding: '12px 16px',
                    fontSize: '0.78rem',
                    fontWeight: 700,
                    color: 'var(--text-muted)',
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em',
                    cursor: 'pointer',
                    userSelect: 'none',
                    width: '100px',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span>Loan #</span>
                    {renderSortIndicator('loanId')}
                  </div>
                </th>

                <th
                  onClick={() => handleSort('bookTitle')}
                  style={{
                    padding: '12px 16px',
                    fontSize: '0.78rem',
                    fontWeight: 700,
                    color: 'var(--text-muted)',
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em',
                    cursor: 'pointer',
                    userSelect: 'none',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span>Book Title & ID</span>
                    {renderSortIndicator('bookTitle')}
                  </div>
                </th>

                <th
                  onClick={() => handleSort('memberName')}
                  style={{
                    padding: '12px 16px',
                    fontSize: '0.78rem',
                    fontWeight: 700,
                    color: 'var(--text-muted)',
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em',
                    cursor: 'pointer',
                    userSelect: 'none',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span>Patron</span>
                    {renderSortIndicator('memberName')}
                  </div>
                </th>

                <th
                  onClick={() => handleSort('dueDate')}
                  style={{
                    padding: '12px 16px',
                    fontSize: '0.78rem',
                    fontWeight: 700,
                    color: 'var(--text-muted)',
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em',
                    cursor: 'pointer',
                    userSelect: 'none',
                    width: '130px',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span>Due Date</span>
                    {renderSortIndicator('dueDate')}
                  </div>
                </th>

                <th
                  onClick={() => handleSort('daysOverdue')}
                  style={{
                    padding: '12px 16px',
                    fontSize: '0.78rem',
                    fontWeight: 700,
                    color: 'var(--text-muted)',
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em',
                    cursor: 'pointer',
                    userSelect: 'none',
                    width: '150px',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span>Days Past Due</span>
                    {renderSortIndicator('daysOverdue')}
                  </div>
                </th>

                <th
                  onClick={() => handleSort('accruedFine')}
                  style={{
                    padding: '12px 16px',
                    fontSize: '0.78rem',
                    fontWeight: 700,
                    color: 'var(--text-muted)',
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em',
                    cursor: 'pointer',
                    userSelect: 'none',
                    width: '130px',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span>Accrued Fine</span>
                    {renderSortIndicator('accruedFine')}
                  </div>
                </th>

                <th
                  className="no-print"
                  style={{
                    padding: '12px 16px',
                    fontSize: '0.78rem',
                    fontWeight: 700,
                    color: 'var(--text-muted)',
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em',
                    textAlign: 'right',
                    width: '140px',
                  }}
                >
                  Actions
                </th>
              </tr>
            </thead>

            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="7" style={{ padding: '60px 20px', textAlign: 'center' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px' }}>
                      <RefreshCw size={26} className="animate-spin" color="var(--primary)" />
                      <span style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
                        Querying Spring Boot /api/loans/overdueLoans...
                      </span>
                    </div>
                  </td>
                </tr>
              ) : displayedLoans.length === 0 ? (
                <tr>
                  <td colSpan="7" style={{ padding: '60px 20px', textAlign: 'center' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px' }}>
                      <div
                        style={{
                          width: '52px',
                          height: '52px',
                          borderRadius: '50%',
                          backgroundColor: 'rgba(16, 185, 129, 0.12)',
                          color: 'var(--success)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                        }}
                      >
                        <CheckCircle2 size={26} />
                      </div>
                      <div style={{ fontWeight: 700, fontSize: '1.05rem', color: 'var(--text-primary)' }}>
                        No Overdue Loans Found
                      </div>
                      <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', maxWidth: '400px', margin: 0 }}>
                        {searchTerm || severityFilter !== 'ALL'
                          ? 'No records match your selected criteria. Try adjusting your search term or severity filter.'
                          : 'Every active loan in the catalog is currently within its designated borrowing duration.'}
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                displayedLoans.map((loan) => {
                  const days = loan.daysOverdue || 0;
                  const fine = loan.accruedFine || 0;

                  // Urgency badge styling based on days overdue
                  const isCritical = days > 14;
                  const isElevated = days >= 8 && days <= 14;

                  const badgeBg = isCritical
                    ? 'rgba(239, 68, 68, 0.16)'
                    : isElevated
                    ? 'rgba(249, 115, 22, 0.16)'
                    : 'rgba(245, 158, 11, 0.16)';

                  const badgeColor = isCritical ? '#f87171' : isElevated ? '#fb923c' : '#fbbf24';
                  const badgeBorder = isCritical
                    ? 'rgba(239, 68, 68, 0.3)'
                    : isElevated
                    ? 'rgba(249, 115, 22, 0.3)'
                    : 'rgba(245, 158, 11, 0.3)';

                  return (
                    <tr
                      key={loan.loanId}
                      style={{
                        borderBottom: '1px solid var(--border-subtle)',
                        transition: 'background-color var(--transition-fast)',
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.backgroundColor = 'var(--bg-surface-hover)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = 'transparent';
                      }}
                    >
                      {/* Loan ID */}
                      <td style={{ padding: '14px 16px', fontSize: '0.875rem' }}>
                        <span
                          style={{
                            fontFamily: 'var(--font-mono, monospace)',
                            fontWeight: 700,
                            color: 'var(--text-primary)',
                          }}
                        >
                          #{loan.loanId}
                        </span>
                      </td>

                      {/* Book Title & ID */}
                      <td style={{ padding: '14px 16px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                          <div
                            style={{
                              width: '32px',
                              height: '32px',
                              borderRadius: 'var(--radius-sm)',
                              backgroundColor: 'rgba(99, 102, 241, 0.12)',
                              color: 'var(--primary)',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              flexShrink: 0,
                            }}
                          >
                            <BookOpen size={16} />
                          </div>
                          <div>
                            <div style={{ fontWeight: 600, fontSize: '0.875rem', color: 'var(--text-primary)' }}>
                              {loan.bookTitle || 'Untitled Book'}
                            </div>
                            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                              Book ID: #{loan.bookId}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Member Info */}
                      <td style={{ padding: '14px 16px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                          <div
                            style={{
                              width: '32px',
                              height: '32px',
                              borderRadius: 'var(--radius-sm)',
                              backgroundColor: 'rgba(6, 182, 212, 0.12)',
                              color: 'var(--accent-cyan)',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              flexShrink: 0,
                            }}
                          >
                            <Users size={16} />
                          </div>
                          <div>
                            <div style={{ fontWeight: 600, fontSize: '0.875rem', color: 'var(--text-primary)' }}>
                              {loan.memberName || 'Unknown Patron'}
                            </div>
                            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                              Member ID: #{loan.memberId}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Due Date */}
                      <td style={{ padding: '14px 16px', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <Calendar size={14} color="var(--text-muted)" />
                          <span>{loan.dueDate || 'N/A'}</span>
                        </div>
                      </td>

                      {/* Days Past Due Badge */}
                      <td style={{ padding: '14px 16px' }}>
                        <span
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '5px',
                            fontSize: '0.78rem',
                            fontWeight: 700,
                            padding: '3px 9px',
                            borderRadius: 'var(--radius-full)',
                            backgroundColor: badgeBg,
                            color: badgeColor,
                            border: `1px solid ${badgeBorder}`,
                          }}
                        >
                          <Clock size={12} />
                          <span>{days} {days === 1 ? 'day' : 'days'} late</span>
                        </span>
                      </td>

                      {/* Accrued Fine */}
                      <td style={{ padding: '14px 16px' }}>
                        <div style={{ fontWeight: 700, fontSize: '0.9rem', color: '#f87171' }}>
                          ₹{fine.toLocaleString('en-IN')}
                        </div>
                        <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                          @ ₹{FINE_PER_DAY}/day rate
                        </div>
                      </td>

                      {/* Action Buttons */}
                      <td className="no-print" style={{ padding: '14px 16px', textAlign: 'right' }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '8px' }}>
                          <button
                            type="button"
                            onClick={() => handleOpenReturn(loan)}
                            className="btn btn-secondary"
                            style={{
                              padding: '5px 10px',
                              fontSize: '0.78rem',
                              color: 'var(--warning)',
                              borderColor: 'rgba(245, 158, 11, 0.3)',
                            }}
                            title="Process book return and settle fine"
                          >
                            <RotateCcw size={13} />
                            <span>Return</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => handleOpenReceipt(loan)}
                            className="btn btn-ghost"
                            style={{
                              padding: '6px',
                              color: 'var(--text-muted)',
                            }}
                            title="View/Print loan docket receipt"
                          >
                            <Receipt size={15} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Footer Audit Summary */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            fontSize: '0.8rem',
            color: 'var(--text-muted)',
            borderTop: '1px solid var(--border-subtle)',
            paddingTop: '14px',
            flexWrap: 'wrap',
            gap: '8px',
          }}
        >
          <div>
            Showing <strong style={{ color: 'var(--text-primary)' }}>{displayedLoans.length}</strong> of{' '}
            <strong style={{ color: 'var(--text-primary)' }}>{loans.length}</strong> overdue circulating records
          </div>
          <div>
            Data sourced live from Spring Boot backend repository • Zero client caching
          </div>
        </div>
      </div>

      {/* Return Book Modal (for actionable settlements directly from the report) */}
      <ReturnBookModal
        isOpen={isReturnModalOpen}
        onClose={() => {
          setIsReturnModalOpen(false);
          setLoanToReturn(null);
        }}
        loanToReturn={loanToReturn}
        activeLoans={loans}
        onSuccess={(returnedLoan) => {
          showToast(`Book returned successfully! Loan #${returnedLoan.loanId} closed.`, 'success');
          // Re-fetch live overdue report from backend
          fetchOverdueLoans();
        }}
      />

      {/* Loan Receipt Slip Modal */}
      <LoanReceiptModal
        isOpen={isReceiptModalOpen}
        onClose={() => {
          setIsReceiptModalOpen(false);
          setReceiptLoan(null);
        }}
        loan={receiptLoan}
        isReturn={false}
      />

      {/* Embedded CSS for Print Optimization */}
      <style>{`
        @media print {
          body {
            background-color: #ffffff !important;
            color: #000000 !important;
          }
          .sidebar-nav,
          .topbar,
          .no-print {
            display: none !important;
          }
          .glass-card {
            background: #ffffff !important;
            border: 1px solid #cccccc !important;
            box-shadow: none !important;
            color: #000000 !important;
          }
          .print-header h1 {
            color: #000000 !important;
          }
          table {
            color: #000000 !important;
          }
          th {
            color: #333333 !important;
            border-bottom: 2px solid #000000 !important;
          }
          td {
            color: #000000 !important;
            border-bottom: 1px solid #e5e5e5 !important;
          }
        }
      `}</style>
    </div>
  );
}

