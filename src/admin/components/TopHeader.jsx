import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Search, Bell, Settings, User, Check, LogOut } from 'lucide-react';
import { useCart } from '../../context/CartContext';
import './TopHeader.css';

export default function TopHeader() {
  const { productsList, ordersList, adminUser, logoutAdmin } = useCart();
  const [searchTerm, setSearchTerm] = useState('');
  const [showNotifications, setShowNotifications] = useState(false);
  const navigate = useNavigate();

  const pendingOrders = ordersList.filter(o => o.delivery?.status === 'Processing' || o.delivery?.status === 'Pending');
  const lowStockProducts = productsList.filter(p => (p.stock || 0) <= 20);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      navigate(`/admin/products?search=${encodeURIComponent(searchTerm.trim())}`);
    }
  };

  return (
    <header className="admin-compact-header">
      {/* Search Bar */}
      <form className="admin-header-search" onSubmit={handleSearchSubmit}>
        <Search size={18} className="search-icon" />
        <input
          type="text"
          placeholder="Quick search products, orders, customers..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="search-input"
        />
        {searchTerm && (
          <button type="button" className="search-clear" onClick={() => setSearchTerm('')}>
            ×
          </button>
        )}
      </form>

      {/* Header Actions */}
      <div className="admin-header-actions">
        {/* Notifications Dropdown */}
        <div className="header-notif-wrapper">
          <button
            type="button"
            className="header-icon-btn"
            title="Notifications"
            onClick={() => setShowNotifications(!showNotifications)}
          >
            <Bell size={19} />
            {(pendingOrders.length > 0 || lowStockProducts.length > 0) && (
              <span className="notif-indicator"></span>
            )}
          </button>

          {showNotifications && (
            <div className="notif-dropdown">
              <div className="notif-header">
                <span className="notif-title">Live Store Notifications</span>
                <span className="notif-count">{pendingOrders.length + lowStockProducts.length} Alerts</span>
              </div>
              <div className="notif-list">
                {pendingOrders.length === 0 && lowStockProducts.length === 0 ? (
                  <div className="notif-empty">
                    <Check size={18} className="notif-check" />
                    <span>All stock levels healthy and no pending dispatches!</span>
                  </div>
                ) : (
                  <>
                    {lowStockProducts.length > 0 && (
                      <div className="notif-section-title">INVENTORY STOCK ALERTS ({lowStockProducts.length})</div>
                    )}
                    {lowStockProducts.map(p => {
                      const isOut = (p.stock || 0) <= 0;
                      return (
                        <Link 
                          key={p.id} 
                          to="/admin/inventory" 
                          className="notif-item clickable"
                          onClick={() => setShowNotifications(false)}
                        >
                          <span className={`notif-dot ${isOut ? 'red' : 'amber'}`}></span>
                          <div className="notif-item-content">
                            <p className="notif-msg">
                              <strong>{p.name}</strong> is {isOut ? 'Out of Stock' : 'Low Stock'}!
                            </p>
                            <span className="notif-time">
                              {isOut ? '0 units left' : `${p.stock} units remaining`} • Tap to restock
                            </span>
                          </div>
                        </Link>
                      );
                    })}

                    {pendingOrders.length > 0 && (
                      <div className="notif-section-title">ORDER ALERTS ({pendingOrders.length})</div>
                    )}
                    {pendingOrders.map(order => (
                      <Link 
                        key={order.id} 
                        to="/admin/orders" 
                        className="notif-item clickable"
                        onClick={() => setShowNotifications(false)}
                      >
                        <span className="notif-dot green"></span>
                        <div className="notif-item-content">
                          <p className="notif-msg">New Order <strong>{order.id}</strong></p>
                          <span className="notif-time">₹{order.pricing?.total} • {order.customer?.fullName || order.customer?.name}</span>
                        </div>
                      </Link>
                    ))}
                  </>
                )}
              </div>
              {lowStockProducts.length > 0 && (
                <Link 
                  to="/admin/inventory" 
                  className="notif-footer-link"
                  onClick={() => setShowNotifications(false)}
                >
                  Manage All Stock in Inventory →
                </Link>
              )}
            </div>
          )}
        </div>

        {/* Store Settings Shortcut */}
        <Link to="/admin/settings" className="header-icon-btn" title="Store Settings">
          <Settings size={19} />
        </Link>

        {/* Worker / Admin Profile pill */}
        <div className="admin-profile-pill">
          <div className="admin-avatar">
            {adminUser?.avatar ? (
              <span className="admin-avatar-emoji">{adminUser.avatar}</span>
            ) : (
              <User size={18} />
            )}
          </div>
          <div className="admin-meta">
            <span className="admin-name">{adminUser?.name || 'Staff Member'}</span>
            <span className="admin-role">{adminUser?.role || 'Authorized'}</span>
          </div>
          <button
            type="button"
            className="admin-header-logout-btn"
            onClick={logoutAdmin}
            title="Log out and lock admin portal"
          >
            <LogOut size={15} />
          </button>
        </div>
      </div>
    </header>
  );
}
