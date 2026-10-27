import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import StudentSidebar from './StudentSidebar';
import StudentTopbar from './StudentTopbar';

export default function StudentLayout({ apiStatus, onRefresh, isRefreshing }) {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="app-layout student-theme">
      {/* Mobile Drawer Backdrop */}
      <div
        className={`mobile-backdrop ${mobileOpen ? 'open' : ''}`}
        onClick={() => setMobileOpen(false)}
        aria-hidden="true"
      />

      {/* Student Navigation Sidebar */}
      <StudentSidebar
        collapsed={collapsed}
        onToggle={() => setCollapsed(!collapsed)}
        mobileOpen={mobileOpen}
        onMobileClose={() => setMobileOpen(false)}
      />

      {/* Main Content Area */}
      <div className="main-wrapper">
        <StudentTopbar
          apiStatus={apiStatus}
          onRefresh={onRefresh}
          isRefreshing={isRefreshing}
          onMobileToggle={() => setMobileOpen((prev) => !prev)}
        />

        <main className="content-container">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
