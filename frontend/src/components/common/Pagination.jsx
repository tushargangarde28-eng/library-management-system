import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

export default function Pagination({
  currentPage = 0,
  totalPages = 1,
  totalElements = 0,
  pageSize = 10,
  onPageChange,
  onPageSizeChange,
  pageSizeOptions = [5, 10, 20, 50],
}) {
  const startItem = totalElements === 0 ? 0 : currentPage * pageSize + 1;
  const endItem = Math.min((currentPage + 1) * pageSize, totalElements);

  // Generate page numbers to display
  const getPageNumbers = () => {
    const pages = [];
    const maxButtons = 5;

    if (totalPages <= maxButtons) {
      for (let i = 0; i < totalPages; i++) {
        pages.push(i);
      }
    } else {
      let start = Math.max(0, currentPage - 2);
      let end = Math.min(totalPages - 1, currentPage + 2);

      if (currentPage < 2) {
        end = 4;
      } else if (currentPage > totalPages - 3) {
        start = totalPages - 5;
      }

      for (let i = start; i <= end; i++) {
        pages.push(i);
      }
    }
    return pages;
  };

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '14px',
        padding: '14px 18px',
        borderTop: '1px solid var(--border-subtle)',
        backgroundColor: 'rgba(15, 23, 42, 0.4)',
      }}
    >
      {/* Items info and page size */}
      <div style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: '14px', fontSize: '0.825rem', color: 'var(--text-secondary)' }}>
        <span>
          Showing <strong style={{ color: 'var(--text-primary)' }}>{startItem}</strong> to{' '}
          <strong style={{ color: 'var(--text-primary)' }}>{endItem}</strong> of{' '}
          <strong style={{ color: 'var(--text-primary)' }}>{totalElements}</strong>
        </span>

        {onPageSizeChange && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={{ fontSize: '0.8rem' }}>Show:</span>
            <select
              value={pageSize}
              onChange={(e) => onPageSizeChange(Number(e.target.value))}
              style={{
                backgroundColor: 'var(--bg-surface-elevated)',
                color: 'var(--text-primary)',
                border: '1px solid var(--border-subtle)',
                borderRadius: 'var(--radius-sm)',
                padding: '4px 8px',
                fontSize: '0.8rem',
                outline: 'none',
                cursor: 'pointer',
              }}
            >
              {pageSizeOptions.map((opt) => (
                <option key={opt} value={opt}>
                  {opt}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* Page Navigation Buttons */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '4px', flexWrap: 'wrap' }}>
        <button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 0}
          className="btn-ghost"
          style={{
            padding: '6px 8px',
            borderRadius: 'var(--radius-md)',
            opacity: currentPage === 0 ? 0.35 : 1,
            cursor: currentPage === 0 ? 'not-allowed' : 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '2px',
            fontSize: '0.8rem',
            border: '1px solid var(--border-subtle)',
          }}
          title="Previous page"
        >
          <ChevronLeft size={16} />
          <span className="pagination-btn-text">Prev</span>
        </button>

        {getPageNumbers().map((pageIndex) => {
          const isActive = pageIndex === currentPage;
          return (
            <button
              key={pageIndex}
              onClick={() => onPageChange(pageIndex)}
              style={{
                minWidth: '32px',
                height: '32px',
                padding: '0 6px',
                borderRadius: 'var(--radius-md)',
                fontSize: '0.8rem',
                fontWeight: isActive ? 700 : 500,
                backgroundColor: isActive ? 'var(--primary)' : 'transparent',
                color: isActive ? '#ffffff' : 'var(--text-secondary)',
                border: isActive ? '1px solid var(--primary)' : '1px solid transparent',
                transition: 'all var(--transition-fast)',
                cursor: 'pointer',
              }}
            >
              {pageIndex + 1}
            </button>
          );
        })}

        <button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage >= totalPages - 1 || totalPages === 0}
          className="btn-ghost"
          style={{
            padding: '6px 8px',
            borderRadius: 'var(--radius-md)',
            opacity: currentPage >= totalPages - 1 || totalPages === 0 ? 0.35 : 1,
            cursor: currentPage >= totalPages - 1 || totalPages === 0 ? 'not-allowed' : 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '2px',
            fontSize: '0.8rem',
            border: '1px solid var(--border-subtle)',
          }}
          title="Next page"
        >
          <span className="pagination-btn-text">Next</span>
          <ChevronRight size={16} />
        </button>
      </div>

      <style>{`
        @media (max-width: 480px) {
          .pagination-btn-text {
            display: none !important;
          }
        }
      `}</style>
    </div>
  );
}
