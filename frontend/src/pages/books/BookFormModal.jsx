import React, { useState, useEffect } from 'react';
import Modal from '../../components/common/Modal';
import { AlertCircle, Loader2 } from 'lucide-react';

export default function BookFormModal({ isOpen, onClose, bookToEdit, onSubmit, isSubmitting }) {
  const [formData, setFormData] = useState({
    title: '',
    author: '',
    isbn: '',
    totalCopies: 1,
  });

  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState(null);

  const isEditing = Boolean(bookToEdit);

  useEffect(() => {
    if (bookToEdit) {
      setFormData({
        title: bookToEdit.title || '',
        author: bookToEdit.author || '',
        isbn: bookToEdit.isbn || '',
        totalCopies: bookToEdit.totalCopies || 1,
      });
    } else {
      setFormData({
        title: '',
        author: '',
        isbn: '',
        totalCopies: 1,
      });
    }
    setErrors({});
    setServerError(null);
  }, [bookToEdit, isOpen]);

  const validate = () => {
    const errs = {};
    if (!formData.title.trim()) {
      errs.title = 'Title is required';
    }
    if (!formData.author.trim()) {
      errs.author = 'Author is required';
    }
    if (!formData.isbn.trim()) {
      errs.isbn = 'ISBN is required';
    }
    const copiesNum = Number(formData.totalCopies);
    const borrowed = isEditing && bookToEdit
      ? Math.max(0, (bookToEdit.totalCopies || 0) - (bookToEdit.availableCopies || 0))
      : 0;

    if (!copiesNum || copiesNum < 1) {
      errs.totalCopies = 'Total copies must be at least 1';
    } else if (isEditing && copiesNum < borrowed) {
      errs.totalCopies = `Total copies cannot be less than borrowed copies (${borrowed})`;
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setServerError(null);

    if (!validate()) return;

    try {
      await onSubmit(formData);
    } catch (err) {
      console.error('[BookFormModal Submit Error]:', err);
      setServerError(err.message || 'Failed to save book. Please review form entries.');
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEditing ? 'Edit Book Record' : 'Add New Book to Catalog'}
      subtitle={isEditing ? `Updating ID #${bookToEdit.bookId} — ${bookToEdit.title}` : 'Enter the book details to register a new volume'}
    >
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        {serverError && (
          <div
            style={{
              padding: '12px 16px',
              borderRadius: 'var(--radius-md)',
              backgroundColor: 'var(--danger-light)',
              border: '1px solid rgba(239, 68, 68, 0.3)',
              color: 'var(--danger)',
              fontSize: '0.85rem',
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
            }}
          >
            <AlertCircle size={18} style={{ flexShrink: 0 }} />
            <span>{serverError}</span>
          </div>
        )}

        {/* Title Field */}
        <div>
          <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '6px' }}>
            Book Title <span style={{ color: 'var(--danger)' }}>*</span>
          </label>
          <input
            type="text"
            className="input-field"
            placeholder="e.g. Clean Code: A Handbook of Agile Software Craftsmanship"
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            maxLength={200}
            disabled={isSubmitting}
            autoFocus={!isEditing}
          />
          {errors.title && (
            <span style={{ fontSize: '0.75rem', color: 'var(--danger)', marginTop: '4px', display: 'block' }}>
              {errors.title}
            </span>
          )}
        </div>

        {/* Author Field */}
        <div>
          <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '6px' }}>
            Author / Creator <span style={{ color: 'var(--danger)' }}>*</span>
          </label>
          <input
            type="text"
            className="input-field"
            placeholder="e.g. Robert C. Martin"
            value={formData.author}
            onChange={(e) => setFormData({ ...formData, author: e.target.value })}
            maxLength={200}
            disabled={isSubmitting}
          />
          {errors.author && (
            <span style={{ fontSize: '0.75rem', color: 'var(--danger)', marginTop: '4px', display: 'block' }}>
              {errors.author}
            </span>
          )}
        </div>

        {/* Responsive Grid: ISBN and Total Copies */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 180px), 1fr))', gap: '14px' }}>
          <div>
            <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '6px' }}>
              ISBN Identifier <span style={{ color: 'var(--danger)' }}>*</span>
            </label>
            <input
              type="text"
              className="input-field font-mono"
              placeholder="e.g. 978-0132350884"
              value={formData.isbn}
              onChange={(e) => setFormData({ ...formData, isbn: e.target.value })}
              maxLength={20}
              disabled={isSubmitting}
            />
            {errors.isbn && (
              <span style={{ fontSize: '0.75rem', color: 'var(--danger)', marginTop: '4px', display: 'block' }}>
                {errors.isbn}
              </span>
            )}
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '6px' }}>
              Total Physical Copies <span style={{ color: 'var(--danger)' }}>*</span>
            </label>
            <input
              type="number"
              className="input-field"
              min={1}
              value={formData.totalCopies}
              onChange={(e) => setFormData({ ...formData, totalCopies: e.target.value })}
              disabled={isSubmitting}
            />
            {errors.totalCopies && (
              <span style={{ fontSize: '0.75rem', color: 'var(--danger)', marginTop: '4px', display: 'block' }}>
                {errors.totalCopies}
              </span>
            )}
          </div>
        </div>

        {isEditing && bookToEdit && (
          <div
            style={{
              padding: '10px 14px',
              borderRadius: 'var(--radius-sm)',
              backgroundColor: 'rgba(255, 255, 255, 0.03)',
              border: '1px solid var(--border-subtle)',
              fontSize: '0.75rem',
              color: 'var(--text-muted)',
              lineHeight: 1.5,
            }}
          >
            Current Status: <strong style={{ color: '#ffffff' }}>{bookToEdit.totalCopies}</strong> Total Copies •{' '}
            <strong style={{ color: 'var(--success)' }}>{bookToEdit.availableCopies}</strong> Available on shelf •{' '}
            <strong style={{ color: 'var(--warning)' }}>{Math.max(0, (bookToEdit.totalCopies || 0) - (bookToEdit.availableCopies || 0))}</strong> Borrowed.
            <div style={{ marginTop: '2px', color: 'rgba(255, 255, 255, 0.45)' }}>
              Note: Total copies cannot be reduced below active circulating copies.
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '8px', flexWrap: 'wrap' }}>
          <button
            type="button"
            onClick={onClose}
            disabled={isSubmitting}
            className="btn btn-secondary"
            style={{ flex: '1 1 100px' }}
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="btn btn-primary"
            style={{ minWidth: '120px', flex: '1 1 140px' }}
          >
            {isSubmitting ? (
              <>
                <Loader2 size={16} className="animate-spin" />
                <span>Saving...</span>
              </>
            ) : (
              <span>{isEditing ? 'Update Book' : 'Add to Catalog'}</span>
            )}
          </button>
        </div>
      </form>
    </Modal>
  );
}
