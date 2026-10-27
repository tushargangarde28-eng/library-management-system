import React, { useState, useEffect, useCallback } from 'react';
import { 
  Users, 
  UserPlus, 
  Search, 
  Edit3, 
  UserX, 
  ArrowUpDown, 
  ArrowUp, 
  ArrowDown, 
  RefreshCw,
  Mail,
  Phone,
  Calendar,
  AlertCircle,
  ShieldCheck,
  CheckCircle2,
  ArrowLeftRight
} from 'lucide-react';
import { memberService } from '../../api/memberService';
import SearchInput from '../../components/common/SearchInput';
import Pagination from '../../components/common/Pagination';
import StatusBadge from '../../components/common/StatusBadge';
import MemberFormModal from './MemberFormModal';
import DeactivateMemberModal from './DeactivateMemberModal';
import BorrowBookModal from '../loans/BorrowBookModal';
import Toast from '../../components/common/Toast';

export default function MembersPage() {
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Filters & Pagination state
  const [statusFilter, setStatusFilter] = useState('ACTIVE'); // 'ACTIVE' | 'INACTIVE'
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [sortBy, setSortBy] = useState('memberId');
  const [direction, setDirection] = useState('asc');
  const [search, setSearch] = useState('');
  const [totalElements, setTotalElements] = useState(0);
  const [totalPages, setTotalPages] = useState(0);

  // Modals state
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [memberToEdit, setMemberToEdit] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [isDeactivateOpen, setIsDeactivateOpen] = useState(false);
  const [memberToDeactivate, setMemberToDeactivate] = useState(null);
  const [isDeactivating, setIsDeactivating] = useState(false);

  // Borrow Modal state
  const [isBorrowOpen, setIsBorrowOpen] = useState(false);
  const [memberToBorrow, setMemberToBorrow] = useState(null);

  // Toast state
  const [toast, setToast] = useState(null);

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => {
      setToast(null);
    }, 4000);
  };

  const handleOpenBorrow = (member) => {
    setMemberToBorrow(member);
    setIsBorrowOpen(true);
  };

  const handleBorrowSuccess = (loan) => {
    showToast(`Book "${loan.bookTitle}" successfully issued to ${loan.memberName}! Loan #${loan.loanId}`);
  };

  const fetchMembers = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await memberService.getMembers({
        page,
        size: pageSize,
        sortBy,
        direction,
        search,
        status: statusFilter,
      });

      setMembers(data?.content || []);
      setTotalElements(data?.totalElements || 0);
      setTotalPages(data?.totalPages || 0);
    } catch (err) {
      console.error('[MembersPage Error] Failed to fetch members:', err);
      setError(err.message || 'Failed to retrieve member records.');
      setMembers([]);
    } finally {
      setLoading(false);
    }
  }, [page, pageSize, sortBy, direction, search, statusFilter]);

  useEffect(() => {
    fetchMembers();
  }, [fetchMembers]);

  const handleSort = (column) => {
    if (sortBy === column) {
      setDirection((prev) => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortBy(column);
      setDirection('asc');
    }
    setPage(0);
  };

  const handleSearchChange = (newSearch) => {
    setSearch(newSearch);
    setPage(0);
  };

  const handleStatusFilterChange = (status) => {
    setStatusFilter(status);
    setSearch('');
    setPage(0);
  };

  const handleOpenRegister = () => {
    setMemberToEdit(null);
    setIsFormOpen(true);
  };

  const handleOpenEdit = (member) => {
    setMemberToEdit(member);
    setIsFormOpen(true);
  };

  const handleOpenDeactivate = (member) => {
    setMemberToDeactivate(member);
    setIsDeactivateOpen(true);
  };

  const handleFormSubmit = async (formData) => {
    setIsSubmitting(true);
    try {
      if (memberToEdit) {
        await memberService.updateMember(memberToEdit.memberId, formData);
        showToast(`Member profile for "${formData.name}" updated successfully.`);
      } else {
        await memberService.createMember(formData);
        showToast(`"${formData.name}" registered successfully.`);
      }
      setIsFormOpen(false);
      setMemberToEdit(null);
      fetchMembers();
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeactivateConfirm = async (id) => {
    setIsDeactivating(true);
    try {
      await memberService.deactivateMember(id);
      showToast('Patron account has been deactivated.', 'warning');
      setIsDeactivateOpen(false);
      setMemberToDeactivate(null);
      fetchMembers();
    } finally {
      setIsDeleting(false);
    }
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return '—';
    try {
      const date = new Date(dateStr);
      return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      });
    } catch {
      return dateStr;
    }
  };

  const renderSortIcon = (column) => {
    if (sortBy !== column) {
      return <ArrowUpDown size={13} style={{ opacity: 0.4, marginLeft: '6px' }} />;
    }
    return direction === 'asc' ? (
      <ArrowUp size={13} style={{ color: 'var(--primary)', marginLeft: '6px' }} />
    ) : (
      <ArrowDown size={13} style={{ color: 'var(--primary)', marginLeft: '6px' }} />
    );
  };

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Header Card */}
      <div
        className="glass-card"
        style={{
          padding: '20px 24px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '14px',
        }}
      >
        <div style={{ minWidth: 0, flex: '1 1 280px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div
              style={{
                width: '36px',
                height: '36px',
                borderRadius: 'var(--radius-md)',
                backgroundColor: 'rgba(6, 182, 212, 0.14)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'var(--accent-cyan)',
                flexShrink: 0,
              }}
            >
              <Users size={20} />
            </div>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-primary)', margin: 0 }}>
              Patron & Member Directory
            </h2>
          </div>
          <p style={{ fontSize: '0.825rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
            Manage patron memberships, account statuses, contact records, and access permissions
          </p>
        </div>

        <div className="header-actions-wrap">
          <button
            onClick={fetchMembers}
            className="btn btn-secondary"
            title="Reload members"
          >
            <RefreshCw size={15} className={loading ? 'animate-spin' : ''} />
            <span>Refresh</span>
          </button>
          <button
            onClick={handleOpenRegister}
            className="btn btn-primary"
          >
            <UserPlus size={16} />
            <span>Register New Member</span>
          </button>
        </div>
      </div>

      {/* Control Bar: Status Filter Tabs & Search */}
      <div
        className="glass-card"
        style={{
          padding: '14px 18px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '14px',
        }}
      >
        {/* Status Tabs */}
        <div className="scroll-tabs">
          <button
            onClick={() => handleStatusFilterChange('ACTIVE')}
            style={{
              padding: '6px 14px',
              borderRadius: 'var(--radius-full)',
              fontSize: '0.8rem',
              fontWeight: 600,
              backgroundColor: statusFilter === 'ACTIVE' && !search ? 'var(--success-light)' : 'transparent',
              color: statusFilter === 'ACTIVE' && !search ? '#34d399' : 'var(--text-secondary)',
              border: statusFilter === 'ACTIVE' && !search ? '1px solid rgba(16, 185, 129, 0.3)' : '1px solid transparent',
              cursor: 'pointer',
              transition: 'all var(--transition-fast)',
              whiteSpace: 'nowrap',
            }}
          >
            Active Patrons
          </button>

          <button
            onClick={() => handleStatusFilterChange('INACTIVE')}
            style={{
              padding: '6px 14px',
              borderRadius: 'var(--radius-full)',
              fontSize: '0.8rem',
              fontWeight: 600,
              backgroundColor: statusFilter === 'INACTIVE' && !search ? 'var(--danger-light)' : 'transparent',
              color: statusFilter === 'INACTIVE' && !search ? '#f87171' : 'var(--text-secondary)',
              border: statusFilter === 'INACTIVE' && !search ? '1px solid rgba(239, 68, 68, 0.3)' : '1px solid transparent',
              cursor: 'pointer',
              transition: 'all var(--transition-fast)',
              whiteSpace: 'nowrap',
            }}
          >
            Inactive Accounts
          </button>
        </div>

        {/* Search Bar & Stats */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px', flexWrap: 'wrap', flex: '1 1 240px', justifyContent: 'flex-end', width: '100%' }}>
          <SearchInput
            value={search}
            onChange={handleSearchChange}
            placeholder="Search by name or email..."
          />

          <div style={{ fontSize: '0.825rem', color: 'var(--text-secondary)', whiteSpace: 'nowrap' }}>
            Total: <strong style={{ color: 'var(--text-primary)' }}>{totalElements}</strong>
          </div>
        </div>
      </div>

      {/* Error Alert */}
      {error && (
        <div
          className="glass-card"
          style={{
            padding: '16px 20px',
            backgroundColor: 'rgba(239, 68, 68, 0.08)',
            border: '1px solid rgba(239, 68, 68, 0.3)',
            color: 'var(--danger)',
            fontSize: '0.875rem',
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
          }}
        >
          <AlertCircle size={20} style={{ flexShrink: 0 }} />
          <span>{error}</span>
        </div>
      )}

      {/* Members Table */}
      <div className="table-container">
        <table className="custom-table" style={{ minWidth: '760px' }}>
          <thead>
            <tr>
              <th
                onClick={() => handleSort('memberId')}
                style={{ cursor: 'pointer', userSelect: 'none', width: '75px' }}
              >
                <div style={{ display: 'inline-flex', alignItems: 'center' }}>
                  ID {renderSortIcon('memberId')}
                </div>
              </th>
              <th
                onClick={() => handleSort('name')}
                style={{ cursor: 'pointer', userSelect: 'none' }}
              >
                <div style={{ display: 'inline-flex', alignItems: 'center' }}>
                  Member Name {renderSortIcon('name')}
                </div>
              </th>
              <th
                onClick={() => handleSort('email')}
                style={{ cursor: 'pointer', userSelect: 'none' }}
              >
                <div style={{ display: 'inline-flex', alignItems: 'center' }}>
                  Email Address {renderSortIcon('email')}
                </div>
              </th>
              <th style={{ width: '140px' }}>Contact Phone</th>
              <th style={{ width: '90px' }}>Role</th>
              <th style={{ width: '100px' }}>Status</th>
              <th style={{ width: '120px' }}>Registered</th>
              <th style={{ textAlign: 'right', minWidth: '160px' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              Array.from({ length: 5 }).map((_, idx) => (
                <tr key={idx}>
                  <td><div className="skeleton" style={{ height: '20px', width: '30px' }} /></td>
                  <td><div className="skeleton" style={{ height: '20px', width: '160px' }} /></td>
                  <td><div className="skeleton" style={{ height: '20px', width: '180px' }} /></td>
                  <td><div className="skeleton" style={{ height: '20px', width: '100px' }} /></td>
                  <td><div className="skeleton" style={{ height: '20px', width: '60px' }} /></td>
                  <td><div className="skeleton" style={{ height: '20px', width: '70px' }} /></td>
                  <td><div className="skeleton" style={{ height: '20px', width: '80px' }} /></td>
                  <td><div className="skeleton" style={{ height: '20px', width: '50px', marginLeft: 'auto' }} /></td>
                </tr>
              ))
            ) : members.length === 0 ? (
              <tr>
                <td colSpan={8} style={{ textAlign: 'center', padding: '48px 24px' }}>
                  <div style={{ color: 'var(--text-muted)', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
                    <Users size={40} style={{ opacity: 0.3, marginBottom: '6px' }} />
                    <span style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                      {search
                        ? `No members found matching "${search}"`
                        : `No ${statusFilter.toLowerCase()} members found`}
                    </span>
                    <span style={{ fontSize: '0.85rem' }}>
                      {search ? 'Try clearing or modifying your search terms.' : 'Patrons will appear here once added.'}
                    </span>
                    {search ? (
                      <button
                        onClick={() => setSearch('')}
                        className="btn btn-secondary"
                        style={{ marginTop: '10px', fontSize: '0.8rem' }}
                      >
                        Clear Search
                      </button>
                    ) : (
                      <button
                        onClick={handleOpenRegister}
                        className="btn btn-primary"
                        style={{ marginTop: '10px', fontSize: '0.8rem' }}
                      >
                        <UserPlus size={14} /> Register Member
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ) : (
              members.map((member) => (
                <tr key={member.memberId}>
                  <td className="font-mono" style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>
                    #{member.memberId}
                  </td>

                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <div
                        style={{
                          width: '32px',
                          height: '32px',
                          borderRadius: '50%',
                          background: 'linear-gradient(135deg, #3b82f6 0%, #6366f1 100%)',
                          color: '#ffffff',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: '0.8rem',
                          fontWeight: 700,
                          flexShrink: 0,
                          boxShadow: '0 2px 6px rgba(0, 0, 0, 0.3)',
                        }}
                      >
                        {member.name ? member.name.charAt(0).toUpperCase() : 'M'}
                      </div>
                      <div style={{ display: 'flex', flexDirection: 'column' }}>
                        <span style={{ fontWeight: 600, color: 'var(--text-primary)', fontSize: '0.88rem' }}>
                          {member.name}
                        </span>
                      </div>
                    </div>
                  </td>

                  <td>
                    <span style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
                      {member.email}
                    </span>
                  </td>

                  <td>
                    <span className="font-mono" style={{ fontSize: '0.8rem', color: member.phone ? 'var(--text-primary)' : 'var(--text-muted)' }}>
                      {member.phone || '—'}
                    </span>
                  </td>

                  <td>
                    <span
                      style={{
                        fontSize: '0.68rem',
                        fontWeight: 700,
                        padding: '2px 8px',
                        borderRadius: 'var(--radius-sm)',
                        backgroundColor: member.role === 'ADMIN' ? 'rgba(99, 102, 241, 0.16)' : 'rgba(255, 255, 255, 0.05)',
                        color: member.role === 'ADMIN' ? '#818cf8' : 'var(--text-secondary)',
                        letterSpacing: '0.04em',
                      }}
                    >
                      {member.role || 'STUDENT'}
                    </span>
                  </td>

                  <td>
                    <StatusBadge status={member.status} type="member" />
                  </td>

                  <td style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                    {formatDate(member.createdAt)}
                  </td>

                  <td style={{ textAlign: 'right' }}>
                    <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                      {member.status === 'ACTIVE' && (
                        <button
                          onClick={() => handleOpenBorrow(member)}
                          className="btn btn-secondary"
                          style={{
                            padding: '4px 8px',
                            fontSize: '0.72rem',
                            color: '#818cf8',
                            borderColor: 'rgba(99, 102, 241, 0.3)',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '4px',
                          }}
                          title={`Issue book to ${member.name}`}
                        >
                          <ArrowLeftRight size={13} />
                          <span>Issue Book</span>
                        </button>
                      )}

                      <button
                        onClick={() => handleOpenEdit(member)}
                        className="btn-ghost"
                        style={{
                          padding: '6px',
                          borderRadius: 'var(--radius-sm)',
                          color: 'var(--text-secondary)',
                        }}
                        title={`Edit ${member.name}`}
                      >
                        <Edit3 size={15} />
                      </button>

                      {member.status === 'ACTIVE' ? (
                        <button
                          onClick={() => handleOpenDeactivate(member)}
                          className="btn-ghost"
                          style={{
                            padding: '6px',
                            borderRadius: 'var(--radius-sm)',
                            color: 'var(--danger)',
                          }}
                          title={`Deactivate ${member.name}`}
                        >
                          <UserX size={15} />
                        </button>
                      ) : (
                        <span
                          style={{
                            padding: '6px',
                            color: 'var(--text-muted)',
                            opacity: 0.4,
                            cursor: 'not-allowed',
                          }}
                          title="Account is inactive"
                        >
                          <UserX size={15} />
                        </span>
                      )}
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>

        {/* Pagination Bar */}
        <Pagination
          currentPage={page}
          totalPages={totalPages}
          totalElements={totalElements}
          pageSize={pageSize}
          onPageChange={setPage}
          onPageSizeChange={(newSize) => {
            setPageSize(newSize);
            setPage(0);
          }}
        />
      </div>

      {/* Register / Edit Member Modal */}
      <MemberFormModal
        isOpen={isFormOpen}
        onClose={() => {
          setIsFormOpen(false);
          setMemberToEdit(null);
        }}
        memberToEdit={memberToEdit}
        onSubmit={handleFormSubmit}
        isSubmitting={isSubmitting}
      />

      {/* Deactivate Member Modal */}
      <DeactivateMemberModal
        isOpen={isDeactivateOpen}
        onClose={() => {
          setIsDeactivateOpen(false);
          setMemberToDeactivate(null);
        }}
        member={memberToDeactivate}
        onConfirm={handleDeactivateConfirm}
        isSubmitting={isDeactivating}
      />

      {/* Borrow Book Modal */}
      <BorrowBookModal
        isOpen={isBorrowOpen}
        onClose={() => {
          setIsBorrowOpen(false);
          setMemberToBorrow(null);
        }}
        preselectedMember={memberToBorrow}
        onSuccess={handleBorrowSuccess}
      />

      {/* Toast Feedback Notification */}
      <Toast toast={toast} onClose={() => setToast(null)} />
    </div>
  );
}
