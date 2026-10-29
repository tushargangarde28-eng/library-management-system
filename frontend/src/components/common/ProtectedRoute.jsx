import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { authService, isTokenExpired } from '../../api/authService';
import { ShieldAlert } from 'lucide-react';

export default function ProtectedRoute({ children, allowedRoles }) {
  const { isAuthenticated, isLoading, user, token } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return (
      <div
        style={{
          minHeight: '100vh',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: 'var(--bg-app)',
          color: 'var(--text-primary)',
          gap: '16px',
        }}
      >
        <div
          style={{
            width: '44px',
            height: '44px',
            borderRadius: '50%',
            border: '3px solid rgba(99, 102, 241, 0.2)',
            borderTopColor: 'var(--primary)',
            animation: 'spin 0.8s linear infinite',
          }}
        />
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
          Verifying security session...
        </p>
      </div>
    );
  }

  // If token is missing or expired, redirect to login with expired indicator if previously had session
  if (!isAuthenticated || (token && isTokenExpired(token))) {
    const wasExpired = Boolean(token && isTokenExpired(token));
    if (wasExpired) {
      authService.clearSession();
    }
    return (
      <Navigate
        to={wasExpired ? '/login?expired=true' : '/login'}
        state={{ from: location }}
        replace
      />
    );
  }

  // Enforce role separation
  if (allowedRoles && allowedRoles.length > 0 && user && !allowedRoles.includes(user.role)) {
    // Student attempting to access admin route -> redirect to student dashboard
    if (user.role === 'STUDENT') {
      return <Navigate to="/student/dashboard" replace />;
    }
    // Admin attempting to access student route -> redirect to admin dashboard
    if (user.role === 'ADMIN') {
      return <Navigate to="/dashboard" replace />;
    }

    return (
      <div
        style={{
          padding: '40px 20px',
          maxWidth: '500px',
          margin: '60px auto',
          textAlign: 'center',
        }}
        className="glass-card"
      >
        <div
          style={{
            width: '56px',
            height: '56px',
            borderRadius: '50%',
            backgroundColor: 'var(--danger-light)',
            color: 'var(--danger)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 16px',
          }}
        >
          <ShieldAlert size={28} />
        </div>
        <h2 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '8px' }}>
          Access Restricted
        </h2>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', marginBottom: '20px' }}>
          Your current account role (<strong>{user.role}</strong>) does not have authorization to view this section.
        </p>
      </div>
    );
  }

  return children;
}
