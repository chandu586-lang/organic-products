import React from 'react';
import { Navigate } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import TopHeader from './components/TopHeader.jsx';
import AdminLogin from './AdminLogin';
import { useCart } from '../context/CartContext';
import './AdminLayout.css';

export default function AdminLayout({ children, activeTab }) {
  const { adminUser, currentUser } = useCart();

  // Role-based access control: logged-in customers cannot access the Admin Portal
  if (currentUser && currentUser.role !== 'admin' && currentUser.role !== 'worker') {
    return <Navigate to="/" replace />;
  }

  // When a worker/admin arrives at the admin portal without an active session, ask for their login details
  if (!adminUser) {
    return <AdminLogin />;
  }

  // Two‑column layout: left Sidebar, right main area with a top header.
  return (
    <div className="admin-root-layout">
      <Sidebar activeTab={activeTab} />
      <div className="admin-main-area">
        <TopHeader />
        <main className="admin-viewport">
          {children}
        </main>
      </div>
    </div>
  );
}
