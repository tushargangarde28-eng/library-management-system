import React from 'react';

export default function StatusBadge({ status, type = 'status' }) {
  if (!status) return null;

  const normalized = String(status).toUpperCase();

  // Loan status
  if (type === 'loan' || normalized === 'RETURNED' || normalized === 'OVERDUE') {
    if (normalized === 'ACTIVE') {
      return (
        <span className="badge badge-active">
          <span className="badge-dot" />
          Active Loan
        </span>
      );
    }
    if (normalized === 'RETURNED') {
      return (
        <span className="badge badge-info">
          <span className="badge-dot" />
          Returned
        </span>
      );
    }
    if (normalized === 'OVERDUE') {
      return (
        <span className="badge badge-warning">
          <span className="badge-dot" />
          Overdue
        </span>
      );
    }
  }

  // Status for members
  if (type === 'member' || normalized === 'ACTIVE' || normalized === 'INACTIVE') {
    if (normalized === 'ACTIVE') {
      return (
        <span className="badge badge-active">
          <span className="badge-dot" />
          Active
        </span>
      );
    }
    return (
      <span className="badge badge-inactive">
        <span className="badge-dot" />
        Inactive
      </span>
    );
  }

  // Stock / Book status
  if (type === 'stock') {
    const available = Number(status);
    if (available > 5) {
      return (
        <span className="badge badge-active">
          <span className="badge-dot" />
          In Stock ({available})
        </span>
      );
    }
    if (available > 0) {
      return (
        <span className="badge badge-warning">
          <span className="badge-dot" />
          Low Stock ({available})
        </span>
      );
    }
    return (
      <span className="badge badge-inactive">
        <span className="badge-dot" />
        Out of Stock
      </span>
    );
  }

  // Generic fallback
  return (
    <span className="badge badge-info">
      <span className="badge-dot" />
      {status}
    </span>
  );
}
