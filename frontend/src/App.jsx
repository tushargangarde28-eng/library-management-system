import React, { useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import AdminLayout from './components/layout/AdminLayout';
import DashboardPage from './pages/dashboard/DashboardPage';
import BooksPage from './pages/books/BooksPage';
import MembersPage from './pages/members/MembersPage';
import LoansPage from './pages/loans/LoansPage';

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
    <BrowserRouter>
      <Routes>
        <Route
          element={
            <AdminLayout
              apiStatus={apiStatus}
              onRefresh={handleGlobalRefresh}
              isRefreshing={isRefreshing}
            />
          }
        >
          <Route
            path="/"
            element={
              <DashboardPage
                refreshTrigger={refreshTrigger}
                onApiStatusChange={setApiStatus}
              />
            }
          />
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
          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
