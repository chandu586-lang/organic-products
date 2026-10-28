import React from 'react';
import { NavLink, Link } from 'react-router-dom';
import {
  LayoutDashboard,
  Package,
  Boxes,
  ShoppingBag,
  Users,
  BarChart3,
  CreditCard,
  Settings,
  LogOut,
  Leaf,
  Store
} from 'lucide-react';
import { useCart } from '../../context/CartContext';
import './Sidebar.css';

const menuItems = [
  { label: 'Overview', path: '/admin', icon: LayoutDashboard },
  { label: 'Product Management', path: '/admin/products', icon: Package },
  { label: 'Inventory Management', path: '/admin/inventory', icon: Boxes },
  { label: 'Orders', path: '/admin/orders', icon: ShoppingBag },
  { label: 'Customers', path: '/admin/customers', icon: Users },
  { label: 'Analytics & Reports', path: '/admin/analytics', icon: BarChart3 },
  { label: 'Payment Settings', path: '/admin/payment', icon: CreditCard },
  { label: 'Store Settings', path: '/admin/settings', icon: Settings }
];

export default function Sidebar({ activeTab }) {
  const { logoutAdmin, productsList, ordersList } = useCart();

  const handleLogout = () => {
    logoutAdmin();
  };

  const lowStockCount = productsList.filter(p => (p.stock || 0) <= 20).length;
  const pendingOrders = ordersList.filter(o => o.delivery?.status === 'Processing' || o.delivery?.status === 'Pending').length;

  return (
    <aside className="admin-sidebar">
      {/* Brand logo & title */}
      <div className="admin-brand-container">
        <Link to="/admin" className="admin-brand-link">
          <div className="admin-brand-badge">
            <Leaf size={22} className="brand-leaf-icon" />
          </div>
          <div className="admin-brand-meta">
            <span className="brand-title">Nature<span className="brand-nest">Nest</span></span>
            <span className="brand-caption">Organic Store Admin</span>
          </div>
        </Link>
      </div>

      {/* Navigation menu */}
      <nav className="admin-nav-list">
        <div className="admin-nav-section-title">MAIN NAVIGATION</div>
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.label;

          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive: isCurrentRoute }) =>
                isActive || isCurrentRoute ? 'admin-nav-item active' : 'admin-nav-item'
              }
              end={item.path === '/admin'}
            >
              <Icon size={19} className="admin-nav-icon" />
              <span className="admin-nav-text">{item.label}</span>
              {item.label === 'Inventory Management' && lowStockCount > 0 && (
                <span className="nav-badge orange">{lowStockCount}</span>
              )}
              {item.label === 'Orders' && pendingOrders > 0 && (
                <span className="nav-badge green">{pendingOrders}</span>
              )}
            </NavLink>
          );
        })}
      </nav>

      {/* Footer Actions: Return to Storefront & Logout */}
      <div className="admin-sidebar-footer">
        <Link to="/" className="admin-nav-item store-link" title="Open Storefront">
          <Store size={18} className="admin-nav-icon" />
          <span className="admin-nav-text">View Storefront</span>
        </Link>
        <button type="button" className="admin-nav-item logout-btn" onClick={handleLogout}>
          <LogOut size={18} className="admin-nav-icon" />
          <span className="admin-nav-text">Log Out</span>
        </button>
      </div>
    </aside>
  );
}
