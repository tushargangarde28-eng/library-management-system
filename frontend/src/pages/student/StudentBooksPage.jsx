import React, { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { 
  BookOpen, 
  Search, 
  Filter, 
  CheckCircle2, 
  XCircle, 
  Layers,
  Info
} from 'lucide-react';
import { bookService } from '../../api/bookService';

export default function StudentBooksPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialSearch = searchParams.get('search') || '';

  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState(initialSearch);
  const [filterStock, setFilterStock] = useState('ALL'); // 'ALL' | 'AVAILABLE' | 'OUT_OF_STOCK'
  const [pagination, setPagination] = useState({ page: 0, size: 12, totalElements: 0, totalPages: 1 });

  const fetchBooks = useCallback(async (page = 0, query = searchTerm) => {
    setLoading(true);
    try {
      const data = await bookService.getBooks({
        page,
        size: pagination.size,
        search: query,
        sortBy: 'bookId',
        direction: 'desc',
      });

      setBooks(data?.content || []);
      setPagination((prev) => ({
        ...prev,
        page: data?.number ?? page,
        totalElements: data?.totalElements ?? 0,
        totalPages: data?.totalPages ?? 1,
      }));
    } catch (err) {
      console.error('[StudentBooksPage] Error loading books:', err);
    } finally {
      setLoading(false);
    }
  }, [searchTerm, pagination.size]);

  useEffect(() => {
    fetchBooks(0, initialSearch);
  }, [fetchBooks, initialSearch]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setSearchParams(searchTerm.trim() ? { search: searchTerm.trim() } : {});
    fetchBooks(0, searchTerm);
  };

  const filteredBooks = books.filter((b) => {
    if (filterStock === 'AVAILABLE') return b.availableCopies > 0;
    if (filterStock === 'OUT_OF_STOCK') return b.availableCopies <= 0;
    return true;
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h1 className="page-title" style={{ margin: 0 }}>
            Search Available Books
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', margin: '4px 0 0' }}>
            Browse the campus catalog and check live copy availability across library shelves.
          </p>
        </div>

        {/* Desk Advisory Badge */}
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
          <Info size={14} style={{ color: '#38bdf8' }} />
          <span>Physical checkout handled at Circulation Desk</span>
        </div>
      </div>

      {/* Search & Filter Bar */}
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
        {/* Search Input */}
        <form onSubmit={handleSearchSubmit} style={{ flex: 1, minWidth: '260px' }}>
          <div className="input-with-icon" style={{ position: 'relative' }}>
            <Search size={16} className="field-icon" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
            <input
              type="text"
              placeholder="Search by book title, author, or ISBN..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="input-field"
              style={{ paddingLeft: '38px', height: '40px' }}
            />
          </div>
        </form>

        {/* Availability Filter Chips */}
        <div className="scroll-tabs">
          <button
            type="button"
            onClick={() => setFilterStock('ALL')}
            className="btn-ghost"
            style={{
              padding: '6px 14px',
              borderRadius: 'var(--radius-sm)',
              fontSize: '0.8rem',
              fontWeight: 600,
              color: filterStock === 'ALL' ? '#ffffff' : 'var(--text-secondary)',
              backgroundColor: filterStock === 'ALL' ? 'var(--bg-surface-hover)' : 'transparent',
            }}
          >
            All Titles ({books.length})
          </button>
          <button
            type="button"
            onClick={() => setFilterStock('AVAILABLE')}
            className="btn-ghost"
            style={{
              padding: '6px 14px',
              borderRadius: 'var(--radius-sm)',
              fontSize: '0.8rem',
              fontWeight: 600,
              color: filterStock === 'AVAILABLE' ? '#34d399' : 'var(--text-secondary)',
              backgroundColor: filterStock === 'AVAILABLE' ? 'var(--bg-surface-hover)' : 'transparent',
            }}
          >
            Available Now ({books.filter((b) => b.availableCopies > 0).length})
          </button>
          <button
            type="button"
            onClick={() => setFilterStock('OUT_OF_STOCK')}
            className="btn-ghost"
            style={{
              padding: '6px 14px',
              borderRadius: 'var(--radius-sm)',
              fontSize: '0.8rem',
              fontWeight: 600,
              color: filterStock === 'OUT_OF_STOCK' ? '#f87171' : 'var(--text-secondary)',
              backgroundColor: filterStock === 'OUT_OF_STOCK' ? 'var(--bg-surface-hover)' : 'transparent',
            }}
          >
            Checked Out ({books.filter((b) => b.availableCopies <= 0).length})
          </button>
        </div>
      </div>

      {/* Books Grid */}
      {loading ? (
        <div className="responsive-card-grid">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="glass-card skeleton" style={{ height: '180px' }} />
          ))}
        </div>
      ) : filteredBooks.length === 0 ? (
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
          <BookOpen size={40} style={{ color: 'var(--text-muted)' }} />
          <h3 style={{ fontSize: '1.1rem', fontWeight: 700, margin: 0, color: 'var(--text-primary)' }}>
            No Books Found
          </h3>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', margin: 0 }}>
            {searchTerm ? `No books match search query "${searchTerm}".` : 'No books in this filter category.'}
          </p>
          {searchTerm && (
            <button
              onClick={() => {
                setSearchTerm('');
                setSearchParams({});
                fetchBooks(0, '');
              }}
              className="btn btn-secondary"
              style={{ marginTop: '8px' }}
            >
              Clear Search
            </button>
          )}
        </div>
      ) : (
        <div className="responsive-card-grid">
          {filteredBooks.map((book) => {
            const isAvailable = book.availableCopies > 0;

            return (
              <div
                key={book.bookId}
                className="glass-card"
                style={{
                  padding: '22px',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  gap: '16px',
                  borderTop: isAvailable ? '3px solid #10b981' : '3px solid #ef4444',
                }}
              >
                <div>
                  {/* Status Badge & ID */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                    <span
                      className={`badge ${isAvailable ? 'badge-active' : 'badge-inactive'}`}
                      style={{ fontSize: '0.72rem' }}
                    >
                      {isAvailable ? `${book.availableCopies} Available on Shelf` : 'Checked Out by Patrons'}
                    </span>
                    <span className="font-mono" style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                      #{book.bookId}
                    </span>
                  </div>

                  {/* Title & Author */}
                  <h3
                    style={{
                      fontSize: '1.05rem',
                      fontWeight: 700,
                      color: 'var(--text-primary)',
                      margin: '0 0 6px',
                      lineHeight: 1.35,
                    }}
                  >
                    {book.title}
                  </h3>
                  <p style={{ fontSize: '0.825rem', color: 'var(--text-secondary)', margin: '0 0 14px' }}>
                    Author: <strong style={{ color: 'var(--text-primary)' }}>{book.author}</strong>
                  </p>

                  {/* Specs */}
                  <div
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '5px',
                      padding: '10px 12px',
                      background: 'rgba(255, 255, 255, 0.02)',
                      borderRadius: 'var(--radius-sm)',
                      fontSize: '0.75rem',
                      color: 'var(--text-muted)',
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span>ISBN:</span>
                      <span className="font-mono" style={{ color: 'var(--text-primary)' }}>{book.isbn}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span>Total Copies:</span>
                      <span style={{ color: 'var(--text-primary)' }}>{book.totalCopies}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span>Available Now:</span>
                      <span style={{ color: isAvailable ? '#34d399' : '#f87171', fontWeight: 600 }}>
                        {book.availableCopies}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Desk Availability Indicator (View-Only, No borrow button) */}
                <div
                  style={{
                    padding: '8px 12px',
                    borderRadius: 'var(--radius-sm)',
                    background: isAvailable ? 'rgba(16, 185, 129, 0.08)' : 'rgba(239, 68, 68, 0.08)',
                    border: `1px solid ${isAvailable ? 'rgba(16, 185, 129, 0.2)' : 'rgba(239, 68, 68, 0.2)'}`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '6px',
                    fontSize: '0.78rem',
                    color: isAvailable ? '#34d399' : '#fca5a5',
                    fontWeight: 600,
                  }}
                >
                  <BookOpen size={14} />
                  <span>
                    {isAvailable
                      ? 'Available at Circulation Desk'
                      : 'Currently In Circulation'}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Pagination Controls */}
      {pagination.totalPages > 1 && (
        <div style={{ display: 'flex', justifyContent: 'center', gap: '8px', marginTop: '12px' }}>
          <button
            onClick={() => fetchBooks(pagination.page - 1)}
            disabled={pagination.page <= 0}
            className="btn btn-secondary"
            style={{ fontSize: '0.8rem', padding: '6px 14px' }}
          >
            Previous
          </button>
          <span style={{ display: 'flex', alignItems: 'center', padding: '0 12px', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
            Page {pagination.page + 1} of {pagination.totalPages}
          </span>
          <button
            onClick={() => fetchBooks(pagination.page + 1)}
            disabled={pagination.page >= pagination.totalPages - 1}
            className="btn btn-secondary"
            style={{ fontSize: '0.8rem', padding: '6px 14px' }}
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
}
