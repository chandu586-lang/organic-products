import React, { useState } from 'react';
import { 
  ShoppingBag, 
  Search, 
  Truck, 
  CheckCircle, 
  Clock, 
  AlertCircle, 
  Printer, 
  Eye, 
  X,
  FileText
} from 'lucide-react';
import { useCart } from '../context/CartContext';
import AdminLayout from './AdminLayout';
import './AdminOrders.css';

export default function AdminOrders() {
  const { ordersList, updateOrderStatus } = useCart();

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [selectedOrder, setSelectedOrder] = useState(null);

  const statuses = ['All', 'Processing', 'In Transit', 'Delivered', 'Cancelled'];

  const filteredOrders = ordersList.filter((order) => {
    // 1. Status Filter
    if (statusFilter !== 'All') {
      if ((order.delivery?.status || 'Processing') !== statusFilter) return false;
    }
    // 2. Search
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchId = order.id?.toLowerCase().includes(q);
      const matchName = order.customer?.name?.toLowerCase().includes(q);
      const matchPhone = order.customer?.phone?.includes(q);
      if (!matchId && !matchName && !matchPhone) return false;
    }
    return true;
  });

  const handlePrintInvoice = (order) => {
    window.print();
  };

  return (
    <AdminLayout activeTab="Orders">
      <div className="admin-orders-view">
        <div className="admin-page-header">
          <div>
            <h2>Orders & Dispatch Hub</h2>
            <p>Live customer order queue, courier tracking numbers, and delivery status updates</p>
          </div>
        </div>

        {/* Filter Bar */}
        <div className="orders-filter-bar">
          <div className="search-box">
            <Search size={16} />
            <input
              type="text"
              placeholder="Search by Order ID, customer name, or phone..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <div className="status-tabs">
            {statuses.map((st) => (
              <button
                key={st}
                type="button"
                className={`status-tab-btn ${statusFilter === st ? 'active' : ''}`}
                onClick={() => setStatusFilter(st)}
              >
                <span>{st}</span>
                <span className="count-pill">
                  {st === 'All'
                    ? ordersList.length
                    : ordersList.filter((o) => (o.delivery?.status || 'Processing') === st).length}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Orders Table */}
        <div className="admin-card orders-table-card">
          <div className="table-responsive">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Order Reference</th>
                  <th>Order Date</th>
                  <th>Customer Information</th>
                  <th>Ordered Harvest</th>
                  <th>Payment</th>
                  <th>Dispatch Status</th>
                  <th>Total</th>
                  <th style={{ textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredOrders.length === 0 ? (
                  <tr>
                    <td colSpan="8" className="empty-table-cell">
                      No matching orders found.
                    </td>
                  </tr>
                ) : (
                  filteredOrders.map((order) => {
                    const currentStatus = order.delivery?.status || 'Processing';
                    return (
                      <tr key={order.id}>
                        <td>
                          <span className="order-id-badge">{order.id}</span>
                          {order.delivery?.awbNumber && (
                            <span className="awb-track">AWB: {order.delivery.awbNumber}</span>
                          )}
                        </td>
                        <td>
                          <span className="order-date-text">
                            {new Date(order.createdAt).toLocaleDateString('en-IN', {
                              month: 'short',
                              day: 'numeric',
                              year: 'numeric'
                            })}
                          </span>
                        </td>
                        <td>
                          <div className="customer-meta">
                            <strong>{order.customer?.name}</strong>
                            <span>{order.customer?.phone}</span>
                            <span className="customer-city-tag">{order.customer?.city}</span>
                          </div>
                        </td>
                        <td>
                          <div className="order-items-preview">
                            {order.items?.map((item, idx) => (
                              <div key={idx} className="preview-line">
                                <span>{item.name}</span>
                                <strong>&times; {item.quantity}</strong>
                              </div>
                            ))}
                          </div>
                        </td>
                        <td>
                          <span className={`payment-tag ${order.payment?.status?.toLowerCase() || 'paid'}`}>
                            {order.payment?.status || 'Paid'}
                          </span>
                          <span className="payment-method">{order.payment?.method || 'UPI'}</span>
                        </td>
                        <td>
                          <select
                            value={currentStatus}
                            onChange={(e) => updateOrderStatus(order.id, e.target.value)}
                            className={`status-dropdown-select ${currentStatus.toLowerCase().replace(/\s+/g, '-')}`}
                          >
                            <option value="Processing">Processing</option>
                            <option value="In Transit">In Transit</option>
                            <option value="Delivered">Delivered</option>
                            <option value="Cancelled">Cancelled</option>
                          </select>
                        </td>
                        <td>
                          <span className="order-total-price">
                            ₹{Math.round(order.pricing?.total || 0).toLocaleString('en-IN')}
                          </span>
                        </td>
                        <td>
                          <div className="actions-cell">
                            <button
                              type="button"
                              onClick={() => setSelectedOrder(order)}
                              className="btn-order-action view"
                              title="View Order Details"
                            >
                              <Eye size={15} />
                            </button>
                            <button
                              type="button"
                              onClick={() => handlePrintInvoice(order)}
                              className="btn-order-action print"
                              title="Print Invoice"
                            >
                              <Printer size={15} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Modal: View Order Details */}
        {selectedOrder && (
          <div className="modal-backdrop">
            <div className="modal-dialog order-details-modal">
              <div className="modal-header">
                <div>
                  <h3>Order Details: {selectedOrder.id}</h3>
                  <p className="modal-sub">
                    Placed on{' '}
                    {new Date(selectedOrder.createdAt).toLocaleDateString('en-IN', {
                      month: 'long',
                      day: 'numeric',
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </p>
                </div>
                <button type="button" onClick={() => setSelectedOrder(null)} className="close-btn">
                  <X size={20} />
                </button>
              </div>

              <div className="modal-body-content">
                {/* Customer and Shipping Information */}
                <div className="details-two-col">
                  <div className="detail-box">
                    <h4>Customer & Shipping Address</h4>
                    <p><strong>{selectedOrder.customer?.name}</strong></p>
                    <p>{selectedOrder.customer?.address}</p>
                    <p>{selectedOrder.customer?.city}, {selectedOrder.customer?.state} - {selectedOrder.customer?.pincode}</p>
                    <p>Phone: {selectedOrder.customer?.phone}</p>
                    <p>Email: {selectedOrder.customer?.email}</p>
                  </div>

                  <div className="detail-box">
                    <h4>Delivery & Logistics</h4>
                    <p>Carrier: <strong>{selectedOrder.delivery?.carrier || 'BlueDart Express'}</strong></p>
                    <p>AWB Tracking: <strong>{selectedOrder.delivery?.awbNumber || 'Assigned upon pickup'}</strong></p>
                    <p>Status: <span className="highlight-status">{selectedOrder.delivery?.status}</span></p>
                    <p>Location: {selectedOrder.delivery?.liveLocation || 'Salem Farm Hub'}</p>
                  </div>
                </div>

                {/* Items */}
                <div className="ordered-items-box">
                  <h4>Ordered Products ({selectedOrder.items?.length})</h4>
                  <div className="items-list">
                    {selectedOrder.items?.map((it, idx) => (
                      <div key={idx} className="item-row">
                        <img src={it.image} alt={it.name} className="item-thumb" />
                        <div className="item-desc">
                          <span className="item-title">{it.name}</span>
                          <span className="item-variant">{it.variantSize || 'Standard Pack'}</span>
                        </div>
                        <div className="item-qty-price">
                          <span>{it.quantity} &times; ₹{it.price}</span>
                          <strong>₹{it.quantity * it.price}</strong>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="pricing-summary-box">
                    <div className="summary-row">
                      <span>Subtotal</span>
                      <span>₹{selectedOrder.pricing?.subtotal || 0}</span>
                    </div>
                    {selectedOrder.pricing?.discount > 0 && (
                      <div className="summary-row discount">
                        <span>Discount Voucher</span>
                        <span>- ₹{selectedOrder.pricing.discount}</span>
                      </div>
                    )}
                    <div className="summary-row">
                      <span>5% Organic GST</span>
                      <span>₹{Math.round(selectedOrder.pricing?.tax || 0)}</span>
                    </div>
                    <div className="summary-row">
                      <span>Delivery Fee</span>
                      <span>{selectedOrder.pricing?.deliveryFee === 0 ? 'FREE' : `₹${selectedOrder.pricing?.deliveryFee}`}</span>
                    </div>
                    <div className="summary-row grand">
                      <span>Grand Total Paid</span>
                      <span>₹{Math.round(selectedOrder.pricing?.total || 0)}</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="modal-footer">
                <button type="button" onClick={() => handlePrintInvoice(selectedOrder)} className="btn-print">
                  <Printer size={15} />
                  <span>Print Official Invoice</span>
                </button>
                <button type="button" onClick={() => setSelectedOrder(null)} className="btn-cancel">
                  Close
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
