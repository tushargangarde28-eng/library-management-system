import React, { useState, useEffect } from 'react';
import Modal from '../../components/common/Modal';
import { AlertCircle, Loader2 } from 'lucide-react';

export default function MemberFormModal({ isOpen, onClose, memberToEdit, onSubmit, isSubmitting }) {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
  });

  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState(null);

  const isEditing = Boolean(memberToEdit);

  useEffect(() => {
    if (memberToEdit) {
      setFormData({
        name: memberToEdit.name || '',
        email: memberToEdit.email || '',
        phone: memberToEdit.phone || '',
        password: '',
      });
    } else {
      setFormData({
        name: '',
        email: '',
        phone: '',
        password: '',
      });
    }
    setErrors({});
    setServerError(null);
  }, [memberToEdit, isOpen]);

  const validate = () => {
    const errs = {};
    if (!formData.name.trim()) {
      errs.name = 'Full name is required';
    } else if (formData.name.length > 100) {
      errs.name = 'Name must not exceed 100 characters';
    }

    if (!isEditing) {
      if (!formData.email.trim()) {
        errs.email = 'Email address is required';
      } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email.trim())) {
        errs.email = 'Invalid email format';
      }

      if (!formData.password) {
        errs.password = 'Password is required';
      } else if (formData.password.length < 8 || formData.password.length > 72) {
        errs.password = 'Password must be between 8 and 72 characters';
      }
    }

    if (formData.phone && formData.phone.length > 15) {
      errs.phone = 'Phone must not exceed 15 characters';
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
      console.error('[MemberFormModal Submit Error]:', err);
      setServerError(err.message || 'Failed to save member. Please review entries.');
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEditing ? 'Edit Member Profile' : 'Register New Member'}
      subtitle={isEditing ? `Updating profile for #${memberToEdit.memberId} — ${memberToEdit.email}` : 'Enter personal and credentials details to create a library patron account'}
      maxWidth="520px"
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

        {/* Full Name */}
        <div>
          <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '6px' }}>
            Full Name <span style={{ color: 'var(--danger)' }}>*</span>
          </label>
          <input
            type="text"
            className="input-field"
            placeholder="e.g. Eleanor Vance"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            maxLength={100}
            disabled={isSubmitting}
            autoFocus={!isEditing}
          />
          {errors.name && (
            <span style={{ fontSize: '0.75rem', color: 'var(--danger)', marginTop: '4px', display: 'block' }}>
              {errors.name}
            </span>
          )}
        </div>

        {/* Email Address */}
        <div>
          <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '6px' }}>
            Email Address {!isEditing && <span style={{ color: 'var(--danger)' }}>*</span>}
          </label>
          <input
            type="email"
            className="input-field"
            placeholder="e.g. eleanor.vance@university.edu"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            maxLength={150}
            disabled={isSubmitting || isEditing}
            style={{
              backgroundColor: isEditing ? 'rgba(255, 255, 255, 0.03)' : undefined,
              cursor: isEditing ? 'not-allowed' : undefined,
            }}
          />
          {isEditing && (
            <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: '4px', display: 'block' }}>
              Email address cannot be modified after registration.
            </span>
          )}
          {errors.email && (
            <span style={{ fontSize: '0.75rem', color: 'var(--danger)', marginTop: '4px', display: 'block' }}>
              {errors.email}
            </span>
          )}
        </div>

        {/* Phone Number */}
        <div>
          <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '6px' }}>
            Phone Number (Optional)
          </label>
          <input
            type="tel"
            className="input-field font-mono"
            placeholder="e.g. +1 555-019-2834"
            value={formData.phone}
            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
            maxLength={15}
            disabled={isSubmitting}
          />
          {errors.phone && (
            <span style={{ fontSize: '0.75rem', color: 'var(--danger)', marginTop: '4px', display: 'block' }}>
              {errors.phone}
            </span>
          )}
        </div>

        {/* Password (Only for new member registration) */}
        {!isEditing && (
          <div>
            <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '6px' }}>
              Initial Account Password <span style={{ color: 'var(--danger)' }}>*</span>
            </label>
            <input
              type="password"
              className="input-field"
              placeholder="Minimum 8 characters"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              maxLength={72}
              disabled={isSubmitting}
            />
            {errors.password && (
              <span style={{ fontSize: '0.75rem', color: 'var(--danger)', marginTop: '4px', display: 'block' }}>
                {errors.password}
              </span>
            )}
            <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: '4px', display: 'block' }}>
              Password will be encrypted using BCrypt by the backend authentication service.
            </span>
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
            style={{ minWidth: '130px', flex: '1 1 140px' }}
          >
            {isSubmitting ? (
              <>
                <Loader2 size={16} className="animate-spin" />
                <span>Saving...</span>
              </>
            ) : (
              <span>{isEditing ? 'Save Changes' : 'Register Member'}</span>
            )}
          </button>
        </div>
      </form>
    </Modal>
  );
}
