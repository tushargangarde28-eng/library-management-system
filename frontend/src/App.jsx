import React, { useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import ProtectedRoute from './components/common/ProtectedRoute';

// Admin Workspace
import AdminLayout from './components/layout/AdminLayout';
import DashboardPage from './pages/dashboard/DashboardPage';
import BooksPage from './pages/books/BooksPage';
import MembersPage from './pages/members/MembersPage';
import LoansPage from './pages/loans/LoansPage';

// Student Workspace
import StudentLayout from './components/layout/StudentLayout';
import StudentDashboardPage from './pages/student/StudentDashboardPage';
import StudentBooksPage from './pages/student/StudentBooksPage';
import StudentLoansPage from './pages/student/StudentLoansPage';

// Auth Pages
import LoginPage from './pages/auth/LoginPage';

/**
 * Intelligent Root Redirector based on user role
 */
function RootRedirect() {
  const { user, isAuthenticated } = useAuth();
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  if (user?.role === 'STUDENT') {
    return <Navigate to="/student/dashboard" replace />;
  }
  return <Navigate to="/dashboard" replace />;
}

export default function App() {
  const [apiStatus, setApiStatus] = useState('connecting');
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const handleGlobalRefresh = () => {
    setIsRefreshing(true);
    setRefreshTrigger((prev) => prev + 1);
    setTimeout(() => {
      setIsRefreshing(false);
    }, 600);
  };

  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Public Authentication */}
          <Route path="/login" element={<LoginPage />} />

          {/* Root Role Dispatcher */}
          <Route path="/" element={<RootRedirect />} />

          {/* ========================================================= */}
          {/* 1. SEPARATE STUDENT WORKSPACE (NO ADMIN MIXING)            */}
          {/* ========================================================= */}
          <Route
            path="/student"
            element={
              <ProtectedRoute allowedRoles={['STUDENT']}>
                <StudentLayout
                  apiStatus={apiStatus}
                  onRefresh={handleGlobalRefresh}
                  isRefreshing={isRefreshing}
                />
              </ProtectedRoute>
            }
          >
            <Route index element={<Navigate to="/student/dashboard" replace />} />
            <Route
              path="dashboard"
              element={
                <StudentDashboardPage
                  refreshTrigger={refreshTrigger}
                  onApiStatusChange={setApiStatus}
                />
              }
            />
            <Route path="books" element={<StudentBooksPage />} />
            <Route path="loans" element={<StudentLoansPage />} />
          </Route>

          {/* ========================================================= */}
          {/* 2. SEPARATE ADMIN WORKSPACE                                */}
          {/* ========================================================= */}
          <Route
            element={
              <ProtectedRoute allowedRoles={['ADMIN']}>
                <AdminLayout
                  apiStatus={apiStatus}
                  onRefresh={handleGlobalRefresh}
                  isRefreshing={isRefreshing}
                />
              </ProtectedRoute>
            }
          >
            <Route
              path="/dashboard"
              element={
                <DashboardPage
                  refreshTrigger={refreshTrigger}
                  onApiStatusChange={setApiStatus}
                />
              }
            />
            <Route path="/books" element={<BooksPage />} />
            <Route path="/members" element={<MembersPage />} />
            <Route path="/loans" element={<LoansPage />} />
          </Route>

          {/* Catch-all fallback */}
          <Route path="*" element={<RootRedirect />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
