import React, { useState, useEffect, useCallback } from 'react';
import { 
  BookOpen, 
  Plus, 
  Search, 
  Edit3, 
  Trash2, 
  ArrowUpDown, 
  ArrowUp, 
  ArrowDown, 
  RefreshCw,
  Layers,
  CheckCircle,
  AlertCircle,
  ArrowLeftRight
} from 'lucide-react';
import { bookService } from '../../api/bookService';
import SearchInput from '../../components/common/SearchInput';
import Pagination from '../../components/common/Pagination';
import StatusBadge from '../../components/common/StatusBadge';
import BookFormModal from './BookFormModal';
import DeleteBookModal from './DeleteBookModal';
import BorrowBookModal from '../loans/BorrowBookModal';
import Toast from '../../components/common/Toast';

export default function BooksPage() {
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Pagination & Sorting state
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [sortBy, setSortBy] = useState('bookId');
  const [direction, setDirection] = useState('asc');
  const [search, setSearch] = useState('');
  const [totalElements, setTotalElements] = useState(0);
  const [totalPages, setTotalPages] = useState(0);

  // Modal states
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [bookToEdit, setBookToEdit] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [bookToDelete, setBookToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Borrow Modal state
  const [isBorrowOpen, setIsBorrowOpen] = useState(false);
  const [bookToBorrow, setBookToBorrow] = useState(null);

  // Toast state
  const [toast, setToast] = useState(null);

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => {
      setToast(null);
    }, 4000);
  };

  const handleOpenBorrow = (book) => {
    setBookToBorrow(book);
    setIsBorrowOpen(true);
  };

  const handleBorrowSuccess = (loan) => {
    fetchBooks();
    showToast(`Book "${loan.bookTitle}" successfully issued to ${loan.memberName}! Loan #${loan.loanId}`);
  };

  const fetchBooks = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await bookService.getBooks({
        page,
        size: pageSize,
        sortBy,
        direction,
        search,
      });

      setBooks(data?.content || []);
      setTotalElements(data?.totalElements || 0);
      setTotalPages(data?.totalPages || 0);
    } catch (err) {
      console.error('[BooksPage Error] Failed to fetch books:', err);
      setError(err.message || 'Failed to retrieve books from the server.');
      setBooks([]);
    } finally {
      setLoading(false);
    }
  }, [page, pageSize, sortBy, direction, search]);

  useEffect(() => {
    fetchBooks();
  }, [fetchBooks]);

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
    setPage(0); // Reset to first page on new search
  };

  const handleOpenAdd = () => {
    setBookToEdit(null);
    setIsFormOpen(true);
  };

  const handleOpenEdit = (book) => {
    setBookToEdit(book);
    setIsFormOpen(true);
  };

  const handleOpenDelete = (book) => {
    setBookToDelete(book);
    setIsDeleteOpen(true);
  };

  const handleFormSubmit = async (formData) => {
    setIsSubmitting(true);
    try {
      if (bookToEdit) {
        await bookService.updateBook(bookToEdit.bookId, formData, bookToEdit);
        showToast(`"${formData.title}" updated successfully.`);
      } else {
        await bookService.createBook(formData);
        showToast(`"${formData.title}" added to catalog.`);
      }
      setIsFormOpen(false);
      setBookToEdit(null);
      fetchBooks();
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteConfirm = async (id) => {
    setIsDeleting(true);
    try {
      await bookService.deleteBook(id);
      showToast('Book removed from catalog.');
      setIsDeleteOpen(false);
      setBookToDelete(null);
      if (books.length === 1 && page > 0) {
        setPage(page - 1);
      } else {
        fetchBooks();
      }
    } finally {
      setIsDeleting(false);
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
      {/* Top Header Card */}
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
                backgroundColor: 'rgba(99, 102, 241, 0.14)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'var(--primary)',
                flexShrink: 0,
              }}
            >
              <BookOpen size={20} />
            </div>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-primary)', margin: 0 }}>
              Book Inventory & Catalog
            </h2>
          </div>
          <p style={{ fontSize: '0.825rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
            Manage book records, total copies, ISBN numbers, and real-time inventory circulation
          </p>
        </div>

        <div className="header-actions-wrap">
          <button
            onClick={fetchBooks}
            className="btn btn-secondary"
            title="Reload books"
          >
            <RefreshCw size={15} className={loading ? 'animate-spin' : ''} />
            <span>Refresh</span>
          </button>
          <button
            onClick={handleOpenAdd}
            className="btn btn-primary"
          >
            <Plus size={16} />
            <span>Add New Book</span>
          </button>
        </div>
      </div>

      {/* Control Bar: Search & Metrics */}
      <div
        className="glass-card"
        style={{
          padding: '14px 18px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '12px',
        }}
      >
        <SearchInput
          value={search}
          onChange={handleSearchChange}
          placeholder="Search by title or author..."
        />

        <div style={{ display: 'flex', alignItems: 'center', gap: '14px', fontSize: '0.825rem', flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={{ color: 'var(--text-muted)' }}>Catalog Records:</span>
            <strong style={{ color: 'var(--text-primary)' }}>{totalElements}</strong>
          </div>
          {search && (
            <span
              style={{
                fontSize: '0.75rem',
                padding: '2px 8px',
                borderRadius: 'var(--radius-full)',
                backgroundColor: 'rgba(99, 102, 241, 0.15)',
                color: '#818cf8',
              }}
            >
              Filtering by: "{search}"
            </span>
          )}
        </div>
      </div>

      {/* Error Notice */}
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

      {/* Main Books Table */}
      <div className="table-container">
        <table className="custom-table" style={{ minWidth: '720px' }}>
          <thead>
            <tr>
              <th
                onClick={() => handleSort('bookId')}
                style={{ cursor: 'pointer', userSelect: 'none', width: '75px' }}
              >
                <div style={{ display: 'inline-flex', alignItems: 'center' }}>
                  ID {renderSortIcon('bookId')}
                </div>
              </th>
              <th
                onClick={() => handleSort('title')}
                style={{ cursor: 'pointer', userSelect: 'none' }}
              >
                <div style={{ display: 'inline-flex', alignItems: 'center' }}>
                  Title {renderSortIcon('title')}
                </div>
              </th>
              <th
                onClick={() => handleSort('author')}
                style={{ cursor: 'pointer', userSelect: 'none' }}
              >
                <div style={{ display: 'inline-flex', alignItems: 'center' }}>
                  Author {renderSortIcon('author')}
                </div>
              </th>
              <th
                onClick={() => handleSort('isbn')}
                style={{ cursor: 'pointer', userSelect: 'none', width: '160px' }}
              >
                <div style={{ display: 'inline-flex', alignItems: 'center' }}>
                  ISBN {renderSortIcon('isbn')}
                </div>
              </th>
              <th style={{ width: '160px' }}>Copies (Total / Avail)</th>
              <th style={{ width: '130px' }}>Stock Status</th>
              <th style={{ textAlign: 'right', width: '100px' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              Array.from({ length: 5 }).map((_, idx) => (
                <tr key={idx}>
                  <td><div className="skeleton" style={{ height: '20px', width: '30px' }} /></td>
                  <td><div className="skeleton" style={{ height: '20px', width: '200px' }} /></td>
                  <td><div className="skeleton" style={{ height: '20px', width: '130px' }} /></td>
                  <td><div className="skeleton" style={{ height: '20px', width: '110px' }} /></td>
                  <td><div className="skeleton" style={{ height: '20px', width: '80px' }} /></td>
                  <td><div className="skeleton" style={{ height: '20px', width: '80px' }} /></td>
                  <td><div className="skeleton" style={{ height: '20px', width: '50px', marginLeft: 'auto' }} /></td>
                </tr>
              ))
            ) : books.length === 0 ? (
              <tr>
                <td colSpan={7} style={{ textAlign: 'center', padding: '48px 24px' }}>
                  <div style={{ color: 'var(--text-muted)', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
                    <BookOpen size={40} style={{ opacity: 0.3, marginBottom: '6px' }} />
                    <span style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                      {search ? `No books matching "${search}"` : 'No books in catalog'}
                    </span>
                    <span style={{ fontSize: '0.85rem' }}>
                      {search ? 'Try adjusting your search keywords.' : 'Get started by adding your first book.'}
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
                        onClick={handleOpenAdd}
                        className="btn btn-primary"
                        style={{ marginTop: '10px', fontSize: '0.8rem' }}
                      >
                        <Plus size={14} /> Add First Book
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ) : (
              books.map((book) => {
                const total = book.totalCopies ?? 0;
                const available = book.availableCopies ?? 0;
                const percent = total > 0 ? Math.round((available / total) * 100) : 0;

                return (
                  <tr key={book.bookId}>
                    <td className="font-mono" style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>
                      #{book.bookId}
                    </td>

                    <td>
                      <div style={{ fontWeight: 600, color: 'var(--text-primary)', fontSize: '0.88rem' }}>
                        {book.title}
                      </div>
                    </td>

                    <td style={{ color: 'var(--text-secondary)' }}>
                      {book.author}
                    </td>

                    <td>
                      <span className="font-mono" style={{ fontSize: '0.8rem', color: 'var(--accent-cyan)' }}>
                        {book.isbn}
                      </span>
                    </td>

                    <td>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', minWidth: '125px' }}>
                        <div style={{ fontSize: '0.82rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <span style={{ color: '#ffffff', fontWeight: 700 }} title="Total physical copies in catalog">{total}</span>
                          <span style={{ color: 'var(--text-muted)', fontSize: '0.72rem' }}>Total</span>
                          <span style={{ color: 'rgba(255, 255, 255, 0.25)' }}>/</span>
                          <span style={{ color: 'var(--success)', fontWeight: 700 }} title="Copies currently available on shelf">{available}</span>
                          <span style={{ color: 'var(--text-muted)', fontSize: '0.72rem' }}>Avail</span>
                        </div>
                        <div
                          style={{
                            height: '5px',
                            borderRadius: 'var(--radius-full)',
                            backgroundColor: 'rgba(255, 255, 255, 0.08)',
                            overflow: 'hidden',
                          }}
                        >
                          <div
                            style={{
                              width: `${percent}%`,
                              height: '100%',
                              backgroundColor: percent > 25 ? 'var(--success)' : percent > 0 ? 'var(--warning)' : 'var(--danger)',
                            }}
                          />
                        </div>
                      </div>
                    </td>

                    <td>
                      <StatusBadge status={available} type="stock" />
                    </td>

                    <td style={{ textAlign: 'right' }}>
                      <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                        {available > 0 && (
                          <button
                            onClick={() => handleOpenBorrow(book)}
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
                            title={`Issue & borrow "${book.title}"`}
                          >
                            <ArrowLeftRight size={13} />
                            <span>Borrow</span>
                          </button>
                        )}
                        <button
                          onClick={() => handleOpenEdit(book)}
                          className="btn-ghost"
                          style={{
                            padding: '6px',
                            borderRadius: 'var(--radius-sm)',
                            color: 'var(--text-secondary)',
                          }}
                          title={`Edit ${book.title}`}
                        >
                          <Edit3 size={15} />
                        </button>
                        <button
                          onClick={() => handleOpenDelete(book)}
                          className="btn-ghost"
                          style={{
                            padding: '6px',
                            borderRadius: 'var(--radius-sm)',
                            color: 'var(--danger)',
                          }}
                          title={`Delete ${book.title}`}
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
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

      {/* Add / Edit Book Modal */}
      <BookFormModal
        isOpen={isFormOpen}
        onClose={() => {
          setIsFormOpen(false);
          setBookToEdit(null);
        }}
        bookToEdit={bookToEdit}
        onSubmit={handleFormSubmit}
        isSubmitting={isSubmitting}
      />

      {/* Delete Book Confirmation Modal */}
      <DeleteBookModal
        isOpen={isDeleteOpen}
        onClose={() => {
          setIsDeleteOpen(false);
          setBookToDelete(null);
        }}
        book={bookToDelete}
        onConfirm={handleDeleteConfirm}
        isDeleting={isDeleting}
      />

      {/* Borrow Book Modal */}
      <BorrowBookModal
        isOpen={isBorrowOpen}
        onClose={() => {
          setIsBorrowOpen(false);
          setBookToBorrow(null);
        }}
        preselectedBook={bookToBorrow}
        onSuccess={handleBorrowSuccess}
      />

      {/* Toast Feedback Notification */}
      <Toast toast={toast} onClose={() => setToast(null)} />
    </div>
  );
}
