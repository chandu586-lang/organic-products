import React, { useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { ShoppingBasket, User, Search, Menu, X, LogOut, Phone, Sparkles, ShieldCheck } from 'lucide-react';
import { useCart } from '../context/CartContext';
import './Navbar.css';

/**
 * Navbar Component for MSV Naturals Organic Products
 * Exactly styled after https://msvnaturals.com/
 */
function Navbar() {
  const { totals, currentUser, adminUser, logoutUser, storeSettings } = useCart();
  const [searchQuery, setSearchQuery] = useState('');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const navigate = useNavigate();

  const supportPhone = storeSettings?.supportPhone || '+91 94440 98765';
  const freeShippingThreshold = storeSettings?.freeShippingThreshold ?? 500;

  const isStaffOrAdmin =
    currentUser?.role === 'admin' ||
    currentUser?.role === 'worker' ||
    (!currentUser && Boolean(adminUser));

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/products?search=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery('');
      setIsMobileMenuOpen(false);
    }
  };

  const navLinks = [
    { to: '/', label: 'Home' },
    { to: '/products', label: 'All Products' },
    { to: '/checkout', label: 'Checkout' }
  ];

  return (
    <header className="site-header">
      {/* Top Announcement Bar - exactly like msvnaturals.com */}
      <div className="top-announcement-bar">
        <div className="container top-bar-content">
          <div className="top-bar-contact">
            <Phone size={13} />
            <span>Farm Direct Helpline: <strong>{supportPhone}</strong></span>
          </div>
          <div className="top-bar-promo">
            <Sparkles size={13} className="sparkle-icon" />
            <span>100% Traditional Wood-Pressed Oils & Forest Honey • Free Shipping above ₹{freeShippingThreshold} • Use coupon <span className="promo-pill">NATURE10</span></span>
          </div>
          <div className="top-bar-badge">
            <span className="live-dot"></span>
            <span>Fresh Batch Extracted Today</span>
          </div>
        </div>
      </div>

      {/* Main Navbar */}
      <div className="container main-nav-container">
        {/* Mobile Hamburger */}
        <button 
          className="mobile-hamburger-btn"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          aria-label="Toggle menu"
        >
          {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>

        {/* Brand Logo - NatureNest */}
        <Link to="/" className="nav-brand">
          <div className="brand-logo-mark">
            <span className="brand-leaf">🌿</span>
          </div>
          <div className="brand-text-block">
            <span className="brand-title">Nature<span className="brand-sub">Nest</span></span>
            <span className="brand-motto">100% Pure • Wood-Pressed • Lab-Tested</span>
          </div>
        </Link>

        {/* Search Bar */}
        <form onSubmit={handleSearchSubmit} className="nav-search-form">
          <input
            type="text"
            placeholder="Search wood pressed oils, raw honey, millets, A2 ghee..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="nav-search-input"
          />
          <button type="submit" className="nav-search-submit-btn" title="Search">
            <Search size={16} />
            <span>Search</span>
          </button>
        </form>

        {/* Desktop Nav Links */}
        <nav className="desktop-nav-links">
          {navLinks.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              className={({ isActive }) => (isActive ? 'nav-link active' : 'nav-link')}
            >
              {link.label}
            </NavLink>
          ))}
        </nav>

        {/* Right Actions: Auth & Cart */}
        <div className="nav-actions">
          {currentUser ? (
            <div className="user-profile-badge">
              <Link to="/account" className="user-greeting" title="Account Details">
                Hi, {currentUser.name.split(' ')[0]}
              </Link>
              <button 
                type="button" 
                onClick={logoutUser} 
                className="nav-logout-btn" 
                title="Logout"
              >
                <LogOut size={16} />
              </button>
            </div>
          ) : (
            <Link to="/auth" className="nav-icon-btn" title="Login / Register">
              <User size={19} />
              <span className="nav-btn-label">Login</span>
            </Link>
          )}

          {isStaffOrAdmin && (
            <Link to="/admin" className="nav-admin-link" title="Merchant Admin Portal">
              <ShieldCheck size={16} />
              <span>Admin Portal</span>
            </Link>
          )}

          <Link to="/cart" className="nav-cart-btn" aria-label="View Cart">
            <ShoppingBasket size={19} />
            <span className="cart-text-label">Basket</span>
            {totals.totalCount > 0 && (
              <span className="cart-badge-count">{totals.totalCount}</span>
            )}
          </Link>
        </div>
      </div>

      {/* Mobile Drawer */}
      {isMobileMenuOpen && (
        <div className="mobile-drawer">
          <form onSubmit={handleSearchSubmit} className="mobile-search-form">
            <input
              type="text"
              placeholder="Search organic products..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="mobile-search-input"
            />
          </form>
          <ul className="mobile-links-list">
            {navLinks.map((link) => (
              <li key={link.to}>
                <Link to={link.to} onClick={() => setIsMobileMenuOpen(false)}>
                  {link.label}
                </Link>
              </li>
            ))}
            <li>
              {currentUser ? (
                <button 
                  onClick={() => { logoutUser(); setIsMobileMenuOpen(false); }}
                  className="mobile-logout-link"
                >
                  Logout ({currentUser.name})
                </button>
              ) : (
                <Link to="/auth" onClick={() => setIsMobileMenuOpen(false)}>
                  Login / Signup
                </Link>
              )}
            </li>
          </ul>
        </div>
      )}
    </header>
  );
}

export default Navbar;
