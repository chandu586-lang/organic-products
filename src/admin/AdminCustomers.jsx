import React, { useState } from 'react';
import { 
  Users, 
  Search, 
  Mail, 
  Phone, 
  MapPin, 
  ShoppingBag, 
  Award, 
  Calendar,
  X,
  ExternalLink
} from 'lucide-react';
import { useCart } from '../context/CartContext';
import AdminLayout from './AdminLayout';
import './AdminCustomers.css';

export default function AdminCustomers() {
  const { customersList, ordersList } = useCart();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCustomer, setSelectedCustomer] = useState(null);

  const filteredCustomers = customersList.filter((c) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      c.name?.toLowerCase().includes(q) ||
      c.email?.toLowerCase().includes(q) ||
      c.phone?.includes(q) ||
      c.city?.toLowerCase().includes(q)
    );
  });

  // Find customer's order history
  const getCustomerOrders = (email) => {
    if (!email) return [];
    return ordersList.filter(
      (o) => o.customer?.email?.toLowerCase() === email.toLowerCase()
    );
  };

  return (
    <AdminLayout activeTab="Customers">
      <div className="admin-crm-view">
        <div className="admin-page-header">
          <div>
            <h2>Customer Relationship Management (CRM)</h2>
            <p>Direct consumer profiles, repeat purchase intent, and lifetime value records</p>
          </div>
        </div>

        {/* Search */}
        <div className="crm-search-bar">
          <div className="search-box">
            <Search size={16} />
            <input
              type="text"
              placeholder="Search customer by name, email, phone number, or city..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <span className="total-customers-badge">
            {filteredCustomers.length} Verified Members
          </span>
        </div>

        {/* Customers Table */}
        <div className="admin-card crm-table-card">
          <div className="table-responsive">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Customer Profile</th>
                  <th>Contact Details</th>
                  <th>Location</th>
                  <th>Orders Count</th>
                  <th>Total Spent</th>
                  <th>Member Since</th>
                  <th style={{ textAlign: 'right' }}>Action</th>
                </tr>
              </thead>
              <tbody>
                {filteredCustomers.length === 0 ? (
                  <tr>
                    <td colSpan="7" className="empty-table-cell">
                      No matching customer records found.
                    </td>
                  </tr>
                ) : (
                  filteredCustomers.map((cust) => (
                    <tr key={cust.id}>
                      <td>
                        <div className="cust-avatar-cell">
                          <div className="cust-avatar">
                            {cust.name?.charAt(0).toUpperCase() || 'U'}
                          </div>
                          <div>
                            <span className="cust-name">{cust.name}</span>
                            <span className="cust-tier">🌱 Organic Club Member</span>
                          </div>
                        </div>
                      </td>
                      <td>
                        <div className="contact-cell">
                          <span className="email-line">
                            <Mail size={12} /> {cust.email}
                          </span>
                          <span className="phone-line">
                            <Phone size={12} /> {cust.phone}
                          </span>
                        </div>
                      </td>
                      <td>
                        <span className="location-tag">
                          <MapPin size={12} /> {cust.city || 'Tamil Nadu'}
                        </span>
                      </td>
                      <td>
                        <span className="orders-count-pill">
                          <ShoppingBag size={12} /> {cust.ordersCount} orders
                        </span>
                      </td>
                      <td>
                        <span className="spent-val">
                          ₹{Math.round(cust.totalSpent).toLocaleString('en-IN')}
                        </span>
                      </td>
                      <td>
                        <span className="member-date">{cust.memberSince}</span>
                      </td>
                      <td style={{ textAlign: 'right' }}>
                        <button
                          type="button"
                          onClick={() => setSelectedCustomer(cust)}
                          className="btn-view-crm"
                        >
                          View CRM Profile
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Modal: Customer Details & Purchase History */}
        {selectedCustomer && (
          <div className="modal-backdrop">
            <div className="modal-dialog crm-modal">
              <div className="modal-header">
                <div className="cust-modal-profile">
                  <div className="cust-modal-avatar">
                    {selectedCustomer.name?.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <h3>{selectedCustomer.name}</h3>
                    <p className="cust-subtitle">{selectedCustomer.email} • {selectedCustomer.phone}</p>
                  </div>
                </div>
                <button type="button" onClick={() => setSelectedCustomer(null)} className="close-btn">
                  <X size={20} />
                </button>
              </div>

              <div className="crm-modal-body">
                <div className="crm-stats-grid">
                  <div className="crm-stat-box">
                    <span className="stat-label">Total Lifetime Spend</span>
                    <span className="stat-num text-emerald">₹{Math.round(selectedCustomer.totalSpent).toLocaleString('en-IN')}</span>
                  </div>
                  <div className="crm-stat-box">
                    <span className="stat-label">Total Orders Placed</span>
                    <span className="stat-num">{selectedCustomer.ordersCount} Orders</span>
                  </div>
                  <div className="crm-stat-box">
                    <span className="stat-label">Member Community</span>
                    <span className="stat-num">Verified Since {selectedCustomer.memberSince}</span>
                  </div>
                </div>

                <div className="crm-history-section">
                  <h4>Order History & Delivery Timeline</h4>
                  {getCustomerOrders(selectedCustomer.email).length === 0 ? (
                    <p className="no-orders-hint">Customer placed orders via in-person farm pickup.</p>
                  ) : (
                    <div className="crm-orders-list">
                      {getCustomerOrders(selectedCustomer.email).map((ord) => (
                        <div key={ord.id} className="crm-order-card">
                          <div className="crm-order-header">
                            <div>
                              <strong className="order-id-txt">{ord.id}</strong>
                              <span className="order-date-sub">
                                {new Date(ord.createdAt).toLocaleDateString('en-IN', {
                                  month: 'short',
                                  day: 'numeric',
                                  year: 'numeric'
                                })}
                              </span>
                            </div>
                            <span className={`order-status-pill ${ord.delivery?.status?.toLowerCase() || 'delivered'}`}>
                              {ord.delivery?.status || 'Delivered'}
                            </span>
                          </div>

                          <div className="crm-order-items">
                            {ord.items?.map((it, idx) => (
                              <span key={idx} className="crm-item-chip">
                                {it.name} ({it.variantSize || '1 pack'}) &times; {it.quantity}
                              </span>
                            ))}
                          </div>

                          <div className="crm-order-footer">
                            <span>Paid via {ord.payment?.method || 'UPI'}</span>
                            <strong>₹{Math.round(ord.pricing?.total || 0).toLocaleString('en-IN')}</strong>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              <div className="modal-footer">
                <button type="button" onClick={() => setSelectedCustomer(null)} className="btn-cancel">
                  Close CRM Record
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
