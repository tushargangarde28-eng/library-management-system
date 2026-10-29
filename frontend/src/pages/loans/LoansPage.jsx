import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowLeftRight,
  Plus,
  RotateCcw,
  Search,
  Clock,
  Calendar,
  CheckCircle2,
  AlertCircle,
  AlertTriangle,
  Receipt,
  BookOpen,
  Users,
  RefreshCw,
  Server,
  Layers,
  Sparkles,
  Info,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  X
} from 'lucide-react';
import StatCard from '../../components/common/StatCard';
import StatusBadge from '../../components/common/StatusBadge';
import Toast from '../../components/common/Toast';
import Pagination from '../../components/common/Pagination';
import { loanService } from '../../api/loanService';
import BorrowBookModal from './BorrowBookModal';
import ReturnBookModal from './ReturnBookModal';
import LoanReceiptModal from './LoanReceiptModal';

export default function LoansPage() {
  const navigate = useNavigate();
  // Server-side pagination & query state
  const [loans, setLoans] = useState([]);
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(5); // Default size=5 as per http://localhost:8080/api/loans?page=0&size=5
  const [totalElements, setTotalElements] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [sortBy, setSortBy] = useState('loanId');
  const [direction, setDirection] = useState('desc');
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL'); // 'ALL', 'ACTIVE', 'RETURNED', 'OVERDUE'
  const [loading, setLoading] = useState(true);

  // Overall catalog KPI stats
  const [stats, setStats] = useState({
    total: 0,
    active: 0,
    returned: 0,
    overdue: 0,
    totalFines: 0,
  });

  // Modals state
  const [isBorrowModalOpen, setIsBorrowModalOpen] = useState(false);
  const [isReturnModalOpen, setIsReturnModalOpen] = useState(false);
  const [loanToReturn, setLoanToReturn] = useState(null);

  const [isReceiptModalOpen, setIsReceiptModalOpen] = useState(false);
  const [receiptLoan, setReceiptLoan] = useState(null);
  const [isReceiptReturnMode, setIsReceiptReturnMode] = useState(false);

  // Toast feedback
  const [toast, setToast] = useState(null);

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => {
      setToast(null);
    }, 4500);
  };

  // Debounce search input to avoid excessive network requests
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(search);
      setPage(0);
    }, 350);
    return () => clearTimeout(handler);
  }, [search]);

  // Fetch paginated loans from Spring Boot GET /api/loans?page={page}&size={size}
  const fetchLoans = useCallback(async () => {
    setLoading(true);
    try {
      const result = await loanService.getLoans({
        page,
        size: pageSize,
        search: debouncedSearch,
        sortBy,
        direction,
        status: statusFilter,
      });

      setLoans(result.content || []);
      setTotalElements(result.totalElements ?? 0);
      setTotalPages(result.totalPages ?? 0);
    } catch (err) {
      console.error('[LoansPage] Error fetching loans from /api/loans:', err);
      showToast(err.message || 'Could not fetch loans from backend API.', 'error');
      setLoans([]);
      setTotalElements(0);
      setTotalPages(0);
    } finally {
      setLoading(false);
    }
  }, [page, pageSize, debouncedSearch, sortBy, direction, statusFilter]);

  // Fetch full dataset for accurate KPI stats
  const fetchStats = useCallback(async () => {
    try {
      const allRecords = await loanService.getAllLoans({ size: 100 });
      setStats(loanService.getLoanStats(allRecords));
    } catch (err) {
      console.warn('[LoansPage] Error refreshing loan statistics:', err);
    }
  }, []);

  useEffect(() => {
    fetchLoans();
  }, [fetchLoans]);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  // Handle column header sorting
  const handleSort = (columnKey) => {
    if (sortBy === columnKey) {
      setDirection((prev) => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortBy(columnKey);
      setDirection(columnKey === 'loanId' ? 'desc' : 'asc');
    }
    setPage(0);
  };

  const renderSortIndicator = (columnKey) => {
    if (sortBy !== columnKey) {
      return <ArrowUpDown size={13} style={{ opacity: 0.35, flexShrink: 0 }} />;
    }
    return direction === 'asc' ? (
      <ArrowUp size={14} style={{ color: 'var(--primary)', flexShrink: 0 }} />
    ) : (
      <ArrowDown size={14} style={{ color: 'var(--primary)', flexShrink: 0 }} />
    );
  };

  // Status Tab selection
  const handleTabChange = (tabId) => {
    setStatusFilter(tabId);
    setPage(0);
  };

  // Modal Handlers
  const handleOpenBorrow = () => {
    setIsBorrowModalOpen(true);
  };

  const handleOpenReturnDirect = () => {
    setLoanToReturn(null);
    setIsReturnModalOpen(true);
  };

  const handleOpenReturnForLoan = (loan) => {
    setLoanToReturn(loan);
    setIsReturnModalOpen(true);
  };

  const handleViewReceipt = (loan, isReturn = false) => {
    setReceiptLoan(loan);
    setIsReceiptReturnMode(isReturn);
    setIsReceiptModalOpen(true);
  };

  const handleBorrowSuccess = (newLoan) => {
    fetchLoans();
    fetchStats();
    showToast(`Book "${newLoan.bookTitle}" borrowed successfully by ${newLoan.memberName}! Loan #${newLoan.loanId}`);
    handleViewReceipt(newLoan, false);
  };

  const handleReturnSuccess = (returnedLoan) => {
    fetchLoans();
    fetchStats();
    showToast(`Book "${returnedLoan.bookTitle}" returned successfully! Inventory replenished.`);
    handleViewReceipt(returnedLoan, true);
  };

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Toast Feedback */}
      <Toast toast={toast} onClose={() => setToast(null)} />

      {/* Page Header */}
      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '16px',
        }}
      >
        <div style={{ minWidth: 0, flex: '1 1 280px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
            <h1 className="page-title">
              Circulation & Loan Operations
            </h1>
          </div>
        </div>

        <div className="header-actions-wrap">
          <button
            onClick={() => navigate('/reports')}
            className="btn btn-secondary"
            style={{
              borderColor: 'rgba(239, 68, 68, 0.35)',
              color: '#f87171',
            }}
            title="Open live Overdue Loans & Penalties Report"
          >
            <AlertTriangle size={15} />
            <span>Overdue Report</span>
          </button>

          <button
            onClick={() => {
              fetchLoans();
              fetchStats();
            }}
            className="btn btn-secondary"
            title="Refresh loans from GET /api/loans"
          >
            <RefreshCw size={15} className={loading ? 'animate-spin' : ''} />
            <span>Sync</span>
          </button>

          <button
            onClick={handleOpenReturnDirect}
            className="btn btn-secondary"
            style={{
              borderColor: 'rgba(16, 185, 129, 0.3)',
              color: '#34d399',
            }}
          >
            <RotateCcw size={15} />
            <span>Return Book</span>
          </button>

          <button
            onClick={handleOpenBorrow}
            className="btn btn-primary"
            style={{
              boxShadow: '0 4px 16px rgba(99, 102, 241, 0.35)',
            }}
          >
            <Plus size={16} />
            <span>Issue / Borrow Book</span>
          </button>
        </div>
      </div>

      {/* KPI Stats Row */}
      <div className="responsive-kpi-grid">
        <StatCard
          title="Active Loans"
          value={stats.active}
          subtitle="Currently circulating books"
          icon={ArrowLeftRight}
          badge="Live"
          badgeType="active"
        />

        <StatCard
          title="Total Completed Returns"
          value={stats.returned}
          subtitle="Restocked in catalog"
          icon={CheckCircle2}
          badge="Returned"
          badgeType="info"
        />

        <StatCard
          title="Overdue Notices"
          value={stats.overdue}
          subtitle={stats.overdue > 0 ? 'Exceeded 8-day limit' : 'All loans in good standing'}
          icon={AlertTriangle}
          badge={stats.overdue > 0 ? 'Action Req.' : 'Clear'}
          badgeType={stats.overdue > 0 ? 'warning' : 'active'}
        />

        <StatCard
          title="Circulation Policy"
          value="8 Days"
          subtitle="Limit: 3 books per member"
          icon={Clock}
          badge="Enforced"
          badgeType="info"
        />
      </div>

      {/* Main Glass Card Table Container */}
      <div className="glass-card" style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
        {/* Search & Filter Toolbar */}
        <div
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            justifyContent: 'space-between',
            alignItems: 'center',
            gap: '12px',
          }}
        >
          {/* Status Tabs */}
          <div className="scroll-tabs">
            {[
              { id: 'ALL', label: 'All Records', count: stats.total },
              { id: 'ACTIVE', label: 'Active Loans', count: stats.active },
              { id: 'RETURNED', label: 'Returned', count: stats.returned },
              { id: 'OVERDUE', label: 'Overdue', count: stats.overdue },
            ].map((tab) => {
              const active = statusFilter === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => handleTabChange(tab.id)}
                  style={{
                    padding: '6px 14px',
                    borderRadius: 'var(--radius-sm)',
                    fontSize: '0.8rem',
                    fontWeight: active ? 600 : 500,
                    color: active ? '#ffffff' : 'var(--text-secondary)',
                    backgroundColor: active ? 'var(--primary)' : 'transparent',
                    boxShadow: active ? '0 2px 8px var(--primary-glow)' : 'none',
                    transition: 'all var(--transition-fast)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    whiteSpace: 'nowrap',
                    cursor: 'pointer',
                    border: 'none',
                  }}
                >
                  <span>{tab.label}</span>
                  <span
                    style={{
                      fontSize: '0.7rem',
                      padding: '1px 5px',
                      borderRadius: 'var(--radius-full)',
                      backgroundColor: active ? 'rgba(255, 255, 255, 0.25)' : 'rgba(255, 255, 255, 0.06)',
                      color: active ? '#ffffff' : 'var(--text-muted)',
                    }}
                  >
                    {tab.count}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Search Input */}
          <div className="search-input-wrap" style={{ position: 'relative', flex: '1 1 240px', minWidth: 'min(100%, 240px)' }}>
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
              placeholder="Search by Title or Member..."
              className="input-field"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{ paddingLeft: '36px', paddingRight: search ? '34px' : '12px', height: '38px', fontSize: '0.85rem' }}
            />
            {search && (
              <button
                onClick={() => setSearch('')}
                style={{
                  position: 'absolute',
                  right: '8px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  background: 'none',
                  border: 'none',
                  color: 'var(--text-muted)',
                  cursor: 'pointer',
                  padding: '4px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
                title="Clear search"
              >
                <X size={15} />
              </button>
            )}
          </div>
        </div>

        {/* Data Table */}
        <div className="table-container" style={{ overflowX: 'auto', borderRadius: 'var(--radius-md)' }}>
          <table className="custom-table" style={{ minWidth: '820px', width: '100%' }}>
            <thead>
              <tr>
                {/* Loan ID Sortable */}
                <th
                  onClick={() => handleSort('loanId')}
                  style={{ width: '105px', cursor: 'pointer', userSelect: 'none' }}
                  title="Click to sort by Loan ID"
                >
                  <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                    <span>Loan ID</span>
                    {renderSortIndicator('loanId')}
                  </div>
                </th>

                {/* Book Details */}
                <th
                  onClick={() => handleSort('bookTitle')}
                  style={{ cursor: 'pointer', userSelect: 'none' }}
                  title="Click to sort by Book Title"
                >
                  <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                    <span>Book Details</span>
                    {renderSortIndicator('bookTitle')}
                  </div>
                </th>

                {/* Member Details */}
                <th
                  onClick={() => handleSort('memberName')}
                  style={{ cursor: 'pointer', userSelect: 'none' }}
                  title="Click to sort by Member"
                >
                  <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                    <span>Member (Borrower)</span>
                    {renderSortIndicator('memberName')}
                  </div>
                </th>

                {/* Issue Date */}
                <th
                  onClick={() => handleSort('issueDate')}
                  style={{ cursor: 'pointer', userSelect: 'none' }}
                  title="Click to sort by Issue Date"
                >
                  <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                    <span>Issue Date</span>
                    {renderSortIndicator('issueDate')}
                  </div>
                </th>

                {/* Due Date */}
                <th
                  onClick={() => handleSort('dueDate')}
                  style={{ cursor: 'pointer', userSelect: 'none' }}
                  title="Click to sort by Due Date"
                >
                  <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                    <span>Due Date</span>
                    {renderSortIndicator('dueDate')}
                  </div>
                </th>

                {/* Return Date */}
                <th
                  onClick={() => handleSort('returnDate')}
                  style={{ cursor: 'pointer', userSelect: 'none' }}
                  title="Click to sort by Return Date"
                >
                  <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                    <span>Return Date</span>
                    {renderSortIndicator('returnDate')}
                  </div>
                </th>

                {/* Status */}
                <th>Status</th>

                {/* Actions */}
                <th style={{ textAlign: 'right', minWidth: '150px' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                Array.from({ length: pageSize }).map((_, idx) => (
                  <tr key={idx}>
                    <td><div className="skeleton" style={{ height: '22px', width: '55px' }} /></td>
                    <td><div className="skeleton" style={{ height: '22px', width: '220px' }} /></td>
                    <td><div className="skeleton" style={{ height: '22px', width: '150px' }} /></td>
                    <td><div className="skeleton" style={{ height: '22px', width: '90px' }} /></td>
                    <td><div className="skeleton" style={{ height: '22px', width: '90px' }} /></td>
                    <td><div className="skeleton" style={{ height: '22px', width: '80px' }} /></td>
                    <td><div className="skeleton" style={{ height: '22px', width: '80px' }} /></td>
                    <td><div className="skeleton" style={{ height: '22px', width: '90px', marginLeft: 'auto' }} /></td>
                  </tr>
                ))
              ) : loans.length === 0 ? (
                <tr>
                  <td colSpan="8" style={{ textAlign: 'center', padding: '48px 20px' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px' }}>
                      <div
                        style={{
                          width: '56px',
                          height: '56px',
                          borderRadius: '50%',
                          backgroundColor: 'rgba(99, 102, 241, 0.1)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          color: 'var(--primary)',
                        }}
                      >
                        <ArrowLeftRight size={28} />
                      </div>
                      <div>
                        <h4 style={{ fontSize: '1rem', fontWeight: 700, color: '#ffffff', marginBottom: '4px' }}>
                          {debouncedSearch ? `No Loans Matching "${debouncedSearch}"` : 'No Circulation Records Found'}
                        </h4>
                        <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', maxWidth: '420px', margin: '0 auto' }}>
                          {debouncedSearch
                            ? 'Try searching with a different book title or patron name.'
                            : 'Issue your first book to create a live loan via the Spring Boot POST /api/loans/borrow API.'}
                        </p>
                      </div>
                      {debouncedSearch ? (
                        <button
                          onClick={() => setSearch('')}
                          className="btn btn-secondary"
                          style={{ marginTop: '8px' }}
                        >
                          Clear Search Filter
                        </button>
                      ) : (
                        <button
                          onClick={handleOpenBorrow}
                          className="btn btn-primary"
                          style={{ marginTop: '8px' }}
                        >
                          <Plus size={16} />
                          <span>Issue First Book</span>
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ) : (
                loans.map((loan) => {
                  const isReturned = loan.status === 'RETURNED' || Boolean(loan.returnDate);
                  return (
                    <tr key={loan.loanId}>
                      {/* Loan ID */}
                      <td>
                        <span
                          style={{
                            fontFamily: 'monospace',
                            fontSize: '0.85rem',
                            fontWeight: 700,
                            padding: '3px 8px',
                            borderRadius: 'var(--radius-sm)',
                            backgroundColor: 'rgba(99, 102, 241, 0.12)',
                            color: '#818cf8',
                            border: '1px solid rgba(99, 102, 241, 0.25)',
                          }}
                        >
                          #{loan.loanId}
                        </span>
                      </td>

                      {/* Book Details */}
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                          <div
                            style={{
                              width: '32px',
                              height: '32px',
                              borderRadius: 'var(--radius-sm)',
                              backgroundColor: 'rgba(6, 182, 212, 0.1)',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              color: 'var(--accent-cyan)',
                              flexShrink: 0,
                            }}
                          >
                            <BookOpen size={16} />
                          </div>
                          <div>
                            <div style={{ fontWeight: 600, color: 'var(--text-primary)', fontSize: '0.875rem' }}>
                              {loan.bookTitle || `Book #${loan.bookId}`}
                            </div>
                            <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                              Book ID: #{loan.bookId}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Member */}
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                          <div
                            style={{
                              width: '30px',
                              height: '30px',
                              borderRadius: '50%',
                              backgroundColor: 'rgba(99, 102, 241, 0.15)',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              color: 'var(--primary)',
                              fontSize: '0.78rem',
                              fontWeight: 700,
                              flexShrink: 0,
                            }}
                          >
                            {loan.memberName?.charAt(0).toUpperCase() || 'M'}
                          </div>
                          <div>
                            <div style={{ fontWeight: 600, color: 'var(--text-primary)', fontSize: '0.85rem' }}>
                              {loan.memberName || `Member #${loan.memberId}`}
                            </div>
                            <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                              Member ID: #{loan.memberId}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Issue Date */}
                      <td style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
                        {loan.issueDate || '—'}
                      </td>

                      {/* Due Date */}
                      <td>
                        <div style={{ display: 'flex', flexDirection: 'column' }}>
                          <span
                            style={{
                              fontSize: '0.82rem',
                              fontWeight: 600,
                              color: loan.isOverdue ? 'var(--warning)' : 'var(--text-primary)',
                            }}
                          >
                            {loan.dueDate || '—'}
                          </span>
                          {loan.isOverdue && (
                            <span style={{ fontSize: '0.68rem', color: '#f59e0b', fontWeight: 600 }}>
                              {loan.daysOverdue} days overdue
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Return Date */}
                      <td>
                        {loan.returnDate ? (
                          <div style={{ display: 'flex', flexDirection: 'column' }}>
                            <span style={{ fontSize: '0.82rem', color: 'var(--success)', fontWeight: 600 }}>
                              {loan.returnDate}
                            </span>
                            <span style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>
                              Fine: ₹{Number(loan.fine || 0).toFixed(2)}
                            </span>
                          </div>
                        ) : (
                          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Pending</span>
                        )}
                      </td>

                      {/* Status */}
                      <td>
                        <StatusBadge
                          status={loan.isOverdue ? 'OVERDUE' : loan.status}
                          type="loan"
                        />
                      </td>

                      {/* Actions */}
                      <td style={{ textAlign: 'right' }}>
                        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                          {!isReturned && (
                            <button
                              onClick={() => handleOpenReturnForLoan(loan)}
                              className="btn btn-secondary"
                              style={{
                                padding: '5px 10px',
                                fontSize: '0.78rem',
                                borderColor: 'rgba(16, 185, 129, 0.3)',
                                color: '#34d399',
                              }}
                              title="Process book return"
                            >
                              <RotateCcw size={14} />
                              <span>Return</span>
                            </button>
                          )}

                          <button
                            onClick={() => handleViewReceipt(loan, isReturned)}
                            className="btn btn-ghost"
                            style={{
                              padding: '5px 8px',
                              borderRadius: 'var(--radius-sm)',
                              color: 'var(--text-secondary)',
                            }}
                            title="View receipt"
                          >
                            <Receipt size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>

          {/* Pagination Controls */}
          <Pagination
            currentPage={page}
            totalPages={totalPages}
            totalElements={totalElements}
            pageSize={pageSize}
            onPageChange={(newPage) => setPage(newPage)}
            onPageSizeChange={(newSize) => {
              setPageSize(newSize);
              setPage(0);
            }}
            pageSizeOptions={[5, 10, 20, 50]}
          />
        </div>
      </div>

      {/* Modals */}
      <BorrowBookModal
        isOpen={isBorrowModalOpen}
        onClose={() => setIsBorrowModalOpen(false)}
        onSuccess={handleBorrowSuccess}
      />

      <ReturnBookModal
        isOpen={isReturnModalOpen}
        onClose={() => {
          setIsReturnModalOpen(false);
          setLoanToReturn(null);
        }}
        loanToReturn={loanToReturn}
        onSuccess={handleReturnSuccess}
      />

      <LoanReceiptModal
        isOpen={isReceiptModalOpen}
        onClose={() => {
          setIsReceiptModalOpen(false);
          setReceiptLoan(null);
        }}
        loan={receiptLoan}
        isReturn={isReceiptReturnMode}
      />
    </div>
  );
}
