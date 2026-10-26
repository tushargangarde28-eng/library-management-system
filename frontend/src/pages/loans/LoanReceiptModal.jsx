import React from 'react';
import Modal from '../../components/common/Modal';
import { 
  Receipt, 
  CheckCircle2, 
  Printer, 
  BookOpen, 
  User, 
  Calendar, 
  Clock, 
  DollarSign,
  Barcode,
  Library
} from 'lucide-react';
import StatusBadge from '../../components/common/StatusBadge';

export default function LoanReceiptModal({ isOpen, onClose, loan, isReturn = false }) {
  if (!loan) return null;

  const handlePrint = () => {
    window.print();
  };

  const isReturned = loan.status === 'RETURNED' || Boolean(loan.returnDate) || isReturn;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isReturned ? 'Book Return Receipt' : 'Book Checkout Receipt'}
      subtitle={`Official transaction slip • Record #${loan.loanId}`}
      maxWidth="500px"
      footer={
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', width: '100%', flexWrap: 'wrap' }}>
          <button type="button" className="btn btn-secondary" onClick={handlePrint} style={{ flex: '1 1 120px' }}>
            <Printer size={16} />
            <span>Print Slip</span>
          </button>
          <button type="button" className="btn btn-primary" onClick={onClose} style={{ flex: '1 1 100px' }}>
            <span>Done</span>
          </button>
        </div>
      }
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }} className="receipt-container">
        {/* Printable Card Area */}
        <div
          id="printable-loan-slip"
          style={{
            backgroundColor: '#0c121e',
            borderRadius: 'var(--radius-lg)',
            border: '1px solid rgba(99, 102, 241, 0.25)',
            padding: '18px 20px',
            position: 'relative',
            overflow: 'hidden',
            boxShadow: '0 8px 20px rgba(0, 0, 0, 0.35)',
          }}
        >
          {/* Subtle watermarked background accent */}
          <div
            style={{
              position: 'absolute',
              right: '-20px',
              bottom: '-20px',
              opacity: 0.04,
              pointerEvents: 'none',
              transform: 'rotate(-15deg)',
            }}
          >
            <Library size={200} />
          </div>

          {/* Slip Header */}
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              borderBottom: '1px dashed rgba(255, 255, 255, 0.12)',
              paddingBottom: '14px',
              marginBottom: '14px',
              flexWrap: 'wrap',
              gap: '10px',
            }}
          >
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <div
                  style={{
                    width: '26px',
                    height: '26px',
                    borderRadius: 'var(--radius-sm)',
                    background: 'linear-gradient(135deg, #6366f1 0%, #3b82f6 100%)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#ffffff',
                  }}
                >
                  <Library size={15} />
                </div>
                <span style={{ fontWeight: 800, fontSize: '1.05rem', letterSpacing: '-0.02em', color: '#ffffff' }}>
                  Libri<span style={{ color: '#818cf8' }}>Core</span>
                </span>
              </div>
              <p style={{ fontSize: '0.65rem', color: 'var(--text-muted)', marginTop: '2px', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                Circulation Desk Official Slip
              </p>
            </div>

            <div style={{ textAlign: 'right' }}>
              <span
                style={{
                  display: 'inline-block',
                  fontSize: '0.68rem',
                  fontWeight: 700,
                  padding: '2px 8px',
                  borderRadius: 'var(--radius-sm)',
                  backgroundColor: isReturned ? 'rgba(16, 185, 129, 0.15)' : 'rgba(99, 102, 241, 0.15)',
                  color: isReturned ? '#34d399' : '#818cf8',
                  border: isReturned ? '1px solid rgba(16, 185, 129, 0.3)' : '1px solid rgba(99, 102, 241, 0.3)',
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em',
                }}
              >
                {isReturned ? 'Return Processed' : 'Checkout Verified'}
              </span>
              <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)', marginTop: '3px', fontFamily: 'monospace' }}>
                TRANSACTION #{String(loan.loanId).padStart(5, '0')}
              </div>
            </div>
          </div>

          {/* Success Callout */}
          <div
            style={{
              padding: '10px 12px',
              borderRadius: 'var(--radius-md)',
              backgroundColor: isReturned ? 'rgba(16, 185, 129, 0.08)' : 'rgba(99, 102, 241, 0.08)',
              border: `1px solid ${isReturned ? 'rgba(16, 185, 129, 0.2)' : 'rgba(99, 102, 241, 0.2)'}`,
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              marginBottom: '14px',
            }}
          >
            <CheckCircle2
              size={16}
              style={{ color: isReturned ? 'var(--success)' : 'var(--primary)', flexShrink: 0 }}
            />
            <span style={{ fontSize: '0.78rem', color: 'var(--text-primary)', fontWeight: 500, lineHeight: 1.35 }}>
              {isReturned
                ? 'Book successfully returned and restocked in catalog.'
                : 'Book checkout authorized. Issued under borrower agreement.'}
            </span>
          </div>

          {/* Details Table */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '5px 0', borderBottom: '1px solid rgba(255, 255, 255, 0.05)', fontSize: '0.8rem', gap: '8px' }}>
              <span style={{ color: 'var(--text-secondary)', flexShrink: 0 }}>Book Title:</span>
              <strong style={{ color: '#ffffff', textAlign: 'right', wordBreak: 'break-word', maxWidth: '68%' }}>
                {loan.bookTitle || `Book ID #${loan.bookId}`}
              </strong>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '5px 0', borderBottom: '1px solid rgba(255, 255, 255, 0.05)', fontSize: '0.8rem' }}>
              <span style={{ color: 'var(--text-secondary)' }}>Book ID:</span>
              <span style={{ color: 'var(--text-primary)', fontFamily: 'monospace' }}>#{loan.bookId}</span>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '5px 0', borderBottom: '1px solid rgba(255, 255, 255, 0.05)', fontSize: '0.8rem', gap: '8px' }}>
              <span style={{ color: 'var(--text-secondary)', flexShrink: 0 }}>Member Name:</span>
              <strong style={{ color: '#ffffff', textAlign: 'right', wordBreak: 'break-word', maxWidth: '68%' }}>
                {loan.memberName || `Member ID #${loan.memberId}`}
              </strong>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '5px 0', borderBottom: '1px solid rgba(255, 255, 255, 0.05)', fontSize: '0.8rem' }}>
              <span style={{ color: 'var(--text-secondary)' }}>Member ID:</span>
              <span style={{ color: 'var(--text-primary)', fontFamily: 'monospace' }}>#{loan.memberId}</span>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '5px 0', borderBottom: '1px solid rgba(255, 255, 255, 0.05)', fontSize: '0.8rem' }}>
              <span style={{ color: 'var(--text-secondary)' }}>Date Issued:</span>
              <span style={{ color: 'var(--text-primary)' }}>{loan.issueDate || 'Today'}</span>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '5px 0', borderBottom: '1px solid rgba(255, 255, 255, 0.05)', fontSize: '0.8rem' }}>
              <span style={{ color: 'var(--text-secondary)' }}>Return Due Date:</span>
              <strong style={{ color: loan.isOverdue ? 'var(--warning)' : '#ffffff' }}>
                {loan.dueDate}
              </strong>
            </div>

            {isReturned && (
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '5px 0', borderBottom: '1px solid rgba(255, 255, 255, 0.05)', fontSize: '0.8rem' }}>
                <span style={{ color: 'var(--text-secondary)' }}>Date Returned:</span>
                <span style={{ color: 'var(--success)', fontWeight: 600 }}>{loan.returnDate || 'Today'}</span>
              </div>
            )}

            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '5px 0', borderBottom: '1px solid rgba(255, 255, 255, 0.05)', fontSize: '0.8rem' }}>
              <span style={{ color: 'var(--text-secondary)' }}>Overdue Fine:</span>
              <span style={{ color: Number(loan.fine) > 0 ? 'var(--danger)' : 'var(--text-muted)' }}>
                ${Number(loan.fine || 0).toFixed(2)}
              </span>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '5px 0', alignItems: 'center', fontSize: '0.8rem' }}>
              <span style={{ color: 'var(--text-secondary)' }}>Current Status:</span>
              <StatusBadge status={isReturned ? 'RETURNED' : (loan.status || 'ACTIVE')} type="loan" />
            </div>
          </div>

          {/* Footer Barcode Simulation & Policy */}
          <div
            style={{
              marginTop: '14px',
              paddingTop: '12px',
              borderTop: '1px dashed rgba(255, 255, 255, 0.12)',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '4px',
            }}
          >
            <div
              style={{
                letterSpacing: '5px',
                fontFamily: 'monospace',
                fontSize: '0.9rem',
                color: 'var(--text-secondary)',
                fontWeight: 700,
              }}
            >
              ||||| | |||| ||| |||| | |||||
            </div>
            <span style={{ fontSize: '0.62rem', color: 'var(--text-muted)', letterSpacing: '0.08em', textAlign: 'center' }}>
              *LOAN-{String(loan.loanId).padStart(6, '0')}* • 8-DAY CIRCULATION POLICY
            </span>
          </div>
        </div>
      </div>
    </Modal>
  );
}
