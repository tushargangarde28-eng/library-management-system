import React, { useState, useEffect } from 'react';
import Modal from '../../components/common/Modal';
import { 
  BookOpen, 
  Users, 
  Clock, 
  AlertCircle, 
  CheckCircle2, 
  Loader2, 
  Info,
  Calendar,
  X
} from 'lucide-react';
import { loanService, LOAN_PERIOD_DAYS, BORROWING_LIMIT } from '../../api/loanService';
import { bookService } from '../../api/bookService';
import { memberService } from '../../api/memberService';

export default function BorrowBookModal({
  isOpen,
  onClose,
  preselectedBook = null,
  preselectedMember = null,
  onSuccess,
}) {
  const [selectedMemberId, setSelectedMemberId] = useState('');
  const [selectedBookId, setSelectedBookId] = useState('');

  const [members, setMembers] = useState([]);
  const [books, setBooks] = useState([]);
  const [loadingData, setLoadingData] = useState(false);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [serverError, setServerError] = useState(null);
  const [clientErrors, setClientErrors] = useState({});

  useEffect(() => {
    if (isOpen) {
      setSelectedMemberId(preselectedMember?.memberId ? String(preselectedMember.memberId) : '');
      setSelectedBookId(preselectedBook?.bookId ? String(preselectedBook.bookId) : '');
      setServerError(null);
      setClientErrors({});
      loadMembersAndBooks();
    }
  }, [isOpen, preselectedBook, preselectedMember]);

  const loadMembersAndBooks = async () => {
    setLoadingData(true);
    try {
      const [membersRes, booksRes] = await Promise.all([
        memberService.getMembers({ status: 'ACTIVE', size: 100 }).catch(() => ({ content: [] })),
        bookService.getBooks({ size: 100 }).catch(() => ({ content: [] })),
      ]);

      setMembers(membersRes?.content || []);
      setBooks(booksRes?.content || []);
    } catch (err) {
      console.warn('[BorrowBookModal] Error pre-fetching members or books:', err);
    } finally {
      setLoadingData(false);
    }
  };

  const selectedMember = members.find((m) => String(m.memberId) === String(selectedMemberId)) || 
    (preselectedMember && String(preselectedMember.memberId) === String(selectedMemberId) ? preselectedMember : null);

  const selectedBook = books.find((b) => String(b.bookId) === String(selectedBookId)) || 
    (preselectedBook && String(preselectedBook.bookId) === String(selectedBookId) ? preselectedBook : null);

  // Exact 8-day loan calculation as defined in backend application.properties
  const today = new Date();
  const dueDate = new Date();
  dueDate.setDate(today.getDate() + LOAN_PERIOD_DAYS);

  const formatDate = (date) => {
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const validate = () => {
    const errs = {};
    if (!selectedMemberId) {
      errs.memberId = 'Please select an active member';
    } else if (Number(selectedMemberId) <= 0 || isNaN(Number(selectedMemberId))) {
      errs.memberId = 'Member ID must be a positive integer';
    }

    if (!selectedBookId) {
      errs.bookId = 'Please select a book to borrow';
    } else if (Number(selectedBookId) <= 0 || isNaN(Number(selectedBookId))) {
      errs.bookId = 'Book ID must be a positive integer';
    } else if (selectedBook && selectedBook.availableCopies <= 0) {
      errs.bookId = 'Selected book has 0 copies available for borrowing';
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
      const loanResponse = await loanService.borrowBook({
        memberId: Number(selectedMemberId),
        bookId: Number(selectedBookId),
      });

      if (onSuccess) {
        onSuccess(loanResponse);
      }
      onClose();
    } catch (err) {
      console.error('[BorrowBookModal Submit Error]:', err);
      const msg =
        err.friendlyMessage ||
        err.message ||
        err.data?.message ||
        'Failed to borrow book. Member may have reached the 3-book borrowing limit.';
      setServerError(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Issue Book / New Loan"
      subtitle="POST /api/loans/borrow — Register a new book loan for an active member"
      maxWidth="600px"
    >
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        {/* Backend Error Alert */}
        {serverError && (
          <div
            style={{
              padding: '12px 16px',
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
              <strong style={{ display: 'block', marginBottom: '2px', color: '#ffffff', fontSize: '0.85rem' }}>
                Loan Request Not Permitted by Backend
              </strong>
              <span>{serverError}</span>
            </div>
          </div>
        )}

        {/* Member Selector Field */}
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
            <label style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Users size={16} style={{ color: 'var(--primary)' }} />
              Active Member <span style={{ color: 'var(--danger)' }}>*</span>
            </label>
            <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
              Limit: {BORROWING_LIMIT} books max
            </span>
          </div>

          <select
            className="input-field"
            value={selectedMemberId}
            onChange={(e) => setSelectedMemberId(e.target.value)}
            style={{
              padding: '9px 12px',
              fontSize: '0.875rem',
              cursor: 'pointer',
              backgroundColor: 'var(--bg-surface-elevated)',
            }}
          >
            <option value="">-- Choose Member from Directory --</option>
            {members.map((m) => (
              <option key={m.memberId} value={m.memberId}>
                Member #{m.memberId} — {m.name} ({m.email})
              </option>
            ))}
          </select>

          {clientErrors.memberId && (
            <p style={{ fontSize: '0.75rem', color: 'var(--danger)', marginTop: '4px' }}>
              {clientErrors.memberId}
            </p>
          )}

          {/* Member Preview Snippet */}
          {selectedMember && (
            <div
              style={{
                marginTop: '8px',
                padding: '8px 12px',
                borderRadius: 'var(--radius-sm)',
                backgroundColor: 'rgba(99, 102, 241, 0.08)',
                border: '1px solid rgba(99, 102, 241, 0.2)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                flexWrap: 'wrap',
                gap: '8px',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', minWidth: 0, flex: '1 1 200px' }}>
                <div
                  style={{
                    width: '26px',
                    height: '26px',
                    borderRadius: '50%',
                    backgroundColor: 'var(--primary)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#ffffff',
                    fontWeight: 700,
                    fontSize: '0.75rem',
                    flexShrink: 0,
                  }}
                >
                  {selectedMember.name?.charAt(0).toUpperCase() || 'M'}
                </div>
                <div style={{ minWidth: 0, overflow: 'hidden' }}>
                  <div style={{ fontSize: '0.82rem', fontWeight: 600, color: '#ffffff', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {selectedMember.name}
                  </div>
                  <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    ID #{selectedMember.memberId} • {selectedMember.email}
                  </div>
                </div>
              </div>
              <span className="badge badge-active" style={{ fontSize: '0.68rem', padding: '1px 6px', flexShrink: 0 }}>
                Active
              </span>
            </div>
          )}
        </div>

        {/* Book Selector Field */}
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px', flexWrap: 'wrap', gap: '4px' }}>
            <label style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <BookOpen size={16} style={{ color: 'var(--accent-cyan)' }} />
              Book from Catalog <span style={{ color: 'var(--danger)' }}>*</span>
            </label>
            <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
              {books.length} titles in catalog
            </span>
          </div>

          <select
            className="input-field"
            value={selectedBookId}
            onChange={(e) => setSelectedBookId(e.target.value)}
            style={{
              padding: '9px 12px',
              fontSize: '0.875rem',
              cursor: 'pointer',
              backgroundColor: 'var(--bg-surface-elevated)',
            }}
          >
            <option value="">-- Choose Book to Issue --</option>
            {books.map((b) => (
              <option
                key={b.bookId}
                value={b.bookId}
                disabled={b.availableCopies <= 0}
              >
                Book #{b.bookId} — {b.title} by {b.author} ({b.availableCopies > 0 ? `${b.availableCopies} in stock` : 'Out of Stock'})
              </option>
            ))}
          </select>

          {clientErrors.bookId && (
            <p style={{ fontSize: '0.75rem', color: 'var(--danger)', marginTop: '4px' }}>
              {clientErrors.bookId}
            </p>
          )}

          {/* Book Preview Snippet */}
          {selectedBook && (
            <div
              style={{
                marginTop: '8px',
                padding: '8px 12px',
                borderRadius: 'var(--radius-sm)',
                backgroundColor: selectedBook.availableCopies > 0 ? 'rgba(6, 182, 212, 0.08)' : 'rgba(239, 68, 68, 0.08)',
                border: selectedBook.availableCopies > 0 ? '1px solid rgba(6, 182, 212, 0.2)' : '1px solid rgba(239, 68, 68, 0.25)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                flexWrap: 'wrap',
                gap: '8px',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', minWidth: 0, flex: '1 1 200px' }}>
                <BookOpen size={16} style={{ color: selectedBook.availableCopies > 0 ? 'var(--accent-cyan)' : 'var(--danger)', flexShrink: 0 }} />
                <div style={{ minWidth: 0, overflow: 'hidden' }}>
                  <div style={{ fontSize: '0.82rem', fontWeight: 600, color: '#ffffff', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {selectedBook.title}
                  </div>
                  <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    ID #{selectedBook.bookId} • Author: {selectedBook.author}
                  </div>
                </div>
              </div>

              {selectedBook.availableCopies > 0 ? (
                <span className="badge badge-active" style={{ fontSize: '0.68rem', padding: '1px 6px', flexShrink: 0 }}>
                  {selectedBook.availableCopies} in stock
                </span>
              ) : (
                <span className="badge badge-inactive" style={{ fontSize: '0.68rem', padding: '1px 6px', flexShrink: 0 }}>
                  Out of Stock
                </span>
              )}
            </div>
          )}
        </div>

        {/* Loan Policy & Schedule Card - 8 Days Backend Config */}
        <div
          style={{
            padding: '12px 14px',
            borderRadius: 'var(--radius-md)',
            backgroundColor: 'rgba(15, 23, 42, 0.7)',
            border: '1px solid var(--border-subtle)',
            display: 'flex',
            flexDirection: 'column',
            gap: '8px',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--text-secondary)', fontSize: '0.78rem', fontWeight: 600 }}>
            <Clock size={14} style={{ color: 'var(--primary)' }} />
            <span>Backend Loan Terms & Schedule</span>
          </div>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 130px), 1fr))',
              gap: '10px',
            }}
          >
            <div style={{ backgroundColor: 'var(--bg-surface-elevated)', padding: '8px 10px', borderRadius: 'var(--radius-sm)' }}>
              <span style={{ fontSize: '0.68rem', color: 'var(--text-muted)', display: 'block' }}>Issue Date</span>
              <strong style={{ fontSize: '0.82rem', color: 'var(--text-primary)' }}>{formatDate(today)}</strong>
            </div>

            <div style={{ backgroundColor: 'var(--bg-surface-elevated)', padding: '8px 10px', borderRadius: 'var(--radius-sm)' }}>
              <span style={{ fontSize: '0.68rem', color: 'var(--text-muted)', display: 'block' }}>Loan Duration</span>
              <strong style={{ fontSize: '0.82rem', color: 'var(--accent-cyan)' }}>{LOAN_PERIOD_DAYS} Days</strong>
            </div>

            <div style={{ backgroundColor: 'var(--bg-surface-elevated)', padding: '8px 10px', borderRadius: 'var(--radius-sm)' }}>
              <span style={{ fontSize: '0.68rem', color: 'var(--text-muted)', display: 'block' }}>Return Due Date</span>
              <strong style={{ fontSize: '0.82rem', color: 'var(--warning)' }}>{formatDate(dueDate)}</strong>
            </div>
          </div>

          <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Info size={13} style={{ color: 'var(--text-secondary)', flexShrink: 0 }} />
            <span>
              Backend limits patrons to <strong>{BORROWING_LIMIT} active loans</strong> and decrements available copies in database.
            </span>
          </div>
        </div>

        {/* Modal Action Buttons */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'flex-end',
            gap: '10px',
            paddingTop: '10px',
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
            disabled={isSubmitting || (selectedBook && selectedBook.availableCopies <= 0)}
            style={{
              padding: '8px 18px',
              fontSize: '0.85rem',
              boxShadow: '0 4px 14px rgba(99, 102, 241, 0.4)',
              minWidth: '150px',
              flex: '1 1 150px',
            }}
          >
            {isSubmitting ? (
              <>
                <Loader2 size={15} className="animate-spin" />
                <span>Issuing Book...</span>
              </>
            ) : (
              <>
                <CheckCircle2 size={15} />
                <span>Issue & Borrow Book</span>
              </>
            )}
          </button>
        </div>
      </form>
    </Modal>
  );
}
