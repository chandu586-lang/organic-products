import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { CartProvider, useCart } from './context/CartContext';

// Storefront Components
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Toast from './components/Toast';

// Store Pages:
import Home from './pages/Home';
import Products from './pages/Products';
import ProductDetails from './pages/ProductDetails';
import Cart from './pages/Cart';
import Checkout from './pages/Checkout';
import Auth from './pages/Auth';

// NatureNest Merchant Admin Portal Pages:
import AdminDashboard from './admin/AdminDashboard';
import AdminProducts from './admin/AdminProducts';
import AdminInventory from './admin/AdminInventory';
import AdminOrders from './admin/AdminOrders';
import AdminCustomers from './admin/AdminCustomers';
import AdminAnalytics from './admin/AdminAnalytics';
import AdminPayment from './admin/AdminPayment';
import AdminSettings from './admin/AdminSettings';

import './App.css';

function ProtectedRoute({ children, redirectMessage }) {
  const { currentUser, authLoading } = useCart();
  const location = useLocation();

  if (authLoading) {
    return null;
  }

  if (!currentUser) {
    return (
      <Navigate
        to="/auth"
        state={{
          from: location.pathname,
          message: redirectMessage || 'Please sign in to access this page.'
        }}
        replace
      />
    );
  }

  return children;
}

function AppContent() {
  const location = useLocation();
  const isAdminRoute = location.pathname.startsWith('/admin');

  return (
    <div className="app-root">
      {/* Hide storefront Navbar & Footer when inside Admin Portal */}
      {!isAdminRoute && <Navbar />}

      <main className={isAdminRoute ? 'admin-shell' : 'main-viewport'}>
        <Routes>
          {/* Storefront Routes */}
          <Route path="/" element={<Home />} />
          <Route path="/products" element={<Products />} />
          <Route path="/products/:id" element={<ProductDetails />} />
          <Route path="/cart" element={<Cart />} />
          <Route
            path="/checkout"
            element={
              <ProtectedRoute redirectMessage="Please sign in to proceed to checkout.">
                <Checkout />
              </ProtectedRoute>
            }
          />
          <Route
            path="/account"
            element={
              <ProtectedRoute redirectMessage="Please sign in to view your account details.">
                <Auth />
              </ProtectedRoute>
            }
          />
          <Route path="/auth" element={<Auth />} />

          {/* NatureNest Organic Store Admin Portal Routes */}
          <Route path="/admin" element={<AdminDashboard />} />
          <Route path="/admin/products" element={<AdminProducts />} />
          <Route path="/admin/inventory" element={<AdminInventory />} />
          <Route path="/admin/orders" element={<AdminOrders />} />
          <Route path="/admin/customers" element={<AdminCustomers />} />
          <Route path="/admin/analytics" element={<AdminAnalytics />} />
          <Route path="/admin/payment" element={<AdminPayment />} />
          <Route path="/admin/settings" element={<AdminSettings />} />

          {/* Catch-all redirect */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>

      {!isAdminRoute && <Footer />}
      <Toast />
    </div>
  );
}

function App() {
  return (
    <Router>
      <CartProvider>
        <AppContent />
      </CartProvider>
    </Router>
  );
}

export default App;
