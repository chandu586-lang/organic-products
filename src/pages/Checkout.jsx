import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { INDIAN_STATES } from '../config/constants';
import './Checkout.css';

export default function Checkout() {
  const { cartItems, totals, clearCart, currentUser, placeOrder, storeSettings } = useCart();
  const navigate = useNavigate();
  const gstRate = storeSettings?.gstRate ?? 5;

  const [formData, setFormData] = useState({
    fullName: currentUser ? currentUser.name : '',
    email: currentUser ? currentUser.email : '',
    phone: '',
    address: '',
    city: '',
    state: 'Tamil Nadu',
    pincode: '',
    paymentMethod: 'upi',
    orderNotes: ''
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [orderComplete, setOrderComplete] = useState(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  const validate = () => {
    const newErrors = {};
    if (!formData.fullName.trim()) newErrors.fullName = 'Full name is required';
    if (!formData.email.trim()) {
      newErrors.email = 'Email address is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email';
    }

    if (!formData.phone.trim()) {
      newErrors.phone = 'Phone number is required';
    } else if (!/^[6-9]\d{9}$/.test(formData.phone.replace(/\D/g, ''))) {
      newErrors.phone = 'Enter a valid 10-digit Indian phone number';
    }

    if (!formData.address.trim()) newErrors.address = 'Street address is required';
    if (!formData.city.trim()) newErrors.city = 'City is required';
    if (!formData.pincode.trim()) {
      newErrors.pincode = 'PIN Code is required';
    } else if (!/^\d{6}$/.test(formData.pincode.trim())) {
      newErrors.pincode = 'Enter a valid 6-digit PIN code';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validate()) return;

    setIsSubmitting(true);

    // Save order through CartContext into persistent Admin ordersList
    setTimeout(() => {
      const placed = placeOrder({
        customer: {
          name: formData.fullName,
          fullName: formData.fullName,
          email: formData.email,
          phone: formData.phone,
          address: formData.address,
          city: formData.city,
          state: formData.state,
          pincode: formData.pincode
        },
        items: [...cartItems],
        pricing: {
          subtotal: totals.subtotal,
          discount: totals.discount,
          tax: totals.tax,
          deliveryFee: totals.shipping,
          total: totals.grandTotal
        },
        payment: {
          method: formData.paymentMethod === 'upi' ? 'Instant UPI' : formData.paymentMethod === 'card' ? 'Card / Netbanking' : 'Cash on Delivery',
          status: formData.paymentMethod === 'cod' ? 'Pending' : 'Paid'
        }
      });

      setOrderComplete({
        orderId: placed.orderNumber || placed.id,
        customerName: formData.fullName,
        email: formData.email,
        phone: formData.phone,
        address: `${formData.address}, ${formData.city}, ${formData.state} - ${formData.pincode}`,
        paymentMethod: formData.paymentMethod,
        items: [...cartItems],
        totalAmount: totals.grandTotal,
        date: new Date().toLocaleDateString('en-IN', {
          year: 'numeric',
          month: 'long',
          day: 'numeric'
        })
      });

      setIsSubmitting(false);
    }, 1000);
  };

  // If cart is empty and no order completed, redirect or show message
  if ((!cartItems || cartItems.length === 0) && !orderComplete) {
    return (
      <div className="checkout-page">
        <div className="empty-checkout-card">
          <h2>No Items to Checkout</h2>
          <p>Your basket is currently empty. Please choose products before placing an order.</p>
          <Link to="/products" className="btn btn-primary">
            Explore Harvest 🌾
          </Link>
        </div>
      </div>
    );
  }

  // Order Success Screen
  if (orderComplete) {
    return (
      <div className="checkout-page">
        <div className="order-success-card">
          <div className="success-badge-icon">🌿</div>
          <span className="order-confirmed-pill">Order Confirmed</span>
          <h1>Thank You for Choosing Pure Organic!</h1>
          <p className="order-success-sub">
            Your harvest order <strong>#{orderComplete.orderId}</strong> has been received and is being prepared fresh.
          </p>

          <div className="order-details-grid">
            <div className="detail-box">
              <h4>Shipping Details</h4>
              <p><strong>{orderComplete.customerName}</strong></p>
              <p>{orderComplete.address}</p>
              <p>Phone: +91 {orderComplete.phone}</p>
              <p>Email: {orderComplete.email}</p>
            </div>

            <div className="detail-box">
              <h4>Payment & Date</h4>
              <p>Payment: <span className="payment-tag">{orderComplete.paymentMethod.toUpperCase()}</span></p>
              <p>Date: {orderComplete.date}</p>
              <p>Status: <span className="status-tag">Payment Verified / Confirmed</span></p>
              <p>Total Paid: <strong>₹{Math.round(orderComplete.totalAmount).toLocaleString('en-IN')}</strong></p>
            </div>
          </div>

          <div className="order-items-summary">
            <h4>Ordered Items</h4>
            {orderComplete.items.map((item) => (
              <div key={item.id} className="success-item-row">
                <span>{item.name} × {item.quantity}</span>
                <span>₹{(item.price * item.quantity).toLocaleString('en-IN')}</span>
              </div>
            ))}
          </div>

          <div className="success-actions">
            <Link to="/products" className="btn btn-primary">
              Continue Shopping 🌾
            </Link>
            <Link to="/" className="btn btn-outline">
              Back to Home
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="checkout-page">
      <div className="checkout-header">
        <h1>Secure Checkout</h1>
        <p>Complete your delivery and payment details to receive fresh organic harvests</p>
      </div>

      <div className="checkout-grid">
        {/* Left: Form */}
        <div className="checkout-form-container">
          <form onSubmit={handleSubmit} noValidate>
            {/* Customer Information */}
            <div className="form-section">
              <h2 className="section-title">
                <span className="step-num">1</span> Customer Information
              </h2>
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="fullName">Full Name *</label>
                  <input
                    type="text"
                    id="fullName"
                    name="fullName"
                    placeholder="e.g. Ramesh Kumar"
                    value={formData.fullName}
                    onChange={handleChange}
                    className={errors.fullName ? 'input-error' : ''}
                  />
                  {errors.fullName && <span className="field-error">{errors.fullName}</span>}
                </div>

                <div className="form-group">
                  <label htmlFor="email">Email Address *</label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    placeholder="e.g. ramesh@example.com"
                    value={formData.email}
                    onChange={handleChange}
                    className={errors.email ? 'input-error' : ''}
                  />
                  {errors.email && <span className="field-error">{errors.email}</span>}
                </div>
              </div>

              <div className="form-row single">
                <div className="form-group">
                  <label htmlFor="phone">Phone Number (+91) *</label>
                  <input
                    type="tel"
                    id="phone"
                    name="phone"
                    placeholder="e.g. 9876543210"
                    value={formData.phone}
                    onChange={handleChange}
                    className={errors.phone ? 'input-error' : ''}
                  />
                  {errors.phone && <span className="field-error">{errors.phone}</span>}
                </div>
              </div>
            </div>

            {/* Delivery Address */}
            <div className="form-section">
              <h2 className="section-title">
                <span className="step-num">2</span> Delivery Address
              </h2>
              <div className="form-group">
                <label htmlFor="address">Street Address, Flat / House No *</label>
                <input
                  type="text"
                  id="address"
                  name="address"
                  placeholder="e.g. Flat 302, Green Fields Residency, Main Road"
                  value={formData.address}
                  onChange={handleChange}
                  className={errors.address ? 'input-error' : ''}
                />
                {errors.address && <span className="field-error">{errors.address}</span>}
              </div>

              <div className="form-row three-col">
                <div className="form-group">
                  <label htmlFor="city">City / Town *</label>
                  <input
                    type="text"
                    id="city"
                    name="city"
                    placeholder="e.g. Chennai"
                    value={formData.city}
                    onChange={handleChange}
                    className={errors.city ? 'input-error' : ''}
                  />
                  {errors.city && <span className="field-error">{errors.city}</span>}
                </div>

                <div className="form-group">
                  <label htmlFor="state">State *</label>
                  <select
                    id="state"
                    name="state"
                    value={formData.state}
                    onChange={handleChange}
                  >
                    {INDIAN_STATES.map((st) => (
                      <option key={st} value={st}>
                        {st === 'Other' ? 'Other State' : st}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label htmlFor="pincode">PIN Code *</label>
                  <input
                    type="text"
                    id="pincode"
                    name="pincode"
                    placeholder="600001"
                    maxLength="6"
                    value={formData.pincode}
                    onChange={handleChange}
                    className={errors.pincode ? 'input-error' : ''}
                  />
                  {errors.pincode && <span className="field-error">{errors.pincode}</span>}
                </div>
              </div>
            </div>

            {/* Payment Method */}
            <div className="form-section">
              <h2 className="section-title">
                <span className="step-num">3</span> Payment Method
              </h2>
              <div className="payment-options">
                <label className={`payment-card ${formData.paymentMethod === 'upi' ? 'selected' : ''}`}>
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="upi"
                    checked={formData.paymentMethod === 'upi'}
                    onChange={handleChange}
                  />
                  <div className="payment-meta">
                    <span className="payment-title">⚡ Instant UPI / QR (GPay, PhonePe, Paytm)</span>
                    <span className="payment-desc">Fastest and contactless payment</span>
                  </div>
                </label>

                <label className={`payment-card ${formData.paymentMethod === 'card' ? 'selected' : ''}`}>
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="card"
                    checked={formData.paymentMethod === 'card'}
                    onChange={handleChange}
                  />
                  <div className="payment-meta">
                    <span className="payment-title">💳 Credit / Debit Card / Netbanking</span>
                    <span className="payment-desc">Visa, Mastercard, RuPay & all major banks</span>
                  </div>
                </label>

                <label className={`payment-card ${formData.paymentMethod === 'cod' ? 'selected' : ''}`}>
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="cod"
                    checked={formData.paymentMethod === 'cod'}
                    onChange={handleChange}
                  />
                  <div className="payment-meta">
                    <span className="payment-title">💵 Cash on Delivery (COD)</span>
                    <span className="payment-desc">Pay in cash or UPI upon doorstep arrival</span>
                  </div>
                </label>
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="btn btn-primary place-order-btn"
            >
              {isSubmitting ? 'Processing Order...' : `Place Order • ₹${Math.round(totals.grandTotal).toLocaleString('en-IN')}`}
            </button>
          </form>
        </div>

        {/* Right: Order Summary Sidebar */}
        <div className="checkout-summary-sidebar">
          <div className="summary-box">
            <h3>Items in Your Order ({totals.totalCount})</h3>
            <div className="summary-items-scroll">
              {cartItems.map((item) => (
                <div key={item.id} className="summary-item-row">
                  <img src={item.image} alt={item.name} className="summary-item-thumb" />
                  <div className="summary-item-details">
                    <span className="summary-item-title">{item.name}</span>
                    <span className="summary-item-qty">Qty: {item.quantity}</span>
                  </div>
                  <span className="summary-item-price">
                    ₹{(item.price * item.quantity).toLocaleString('en-IN')}
                  </span>
                </div>
              ))}
            </div>

            <div className="summary-price-breakdown">
              <div className="price-row">
                <span>Subtotal</span>
                <span>₹{totals.subtotal.toLocaleString('en-IN')}</span>
              </div>
              {totals.discount > 0 && (
                <div className="price-row discount">
                  <span>Voucher Discount</span>
                  <span>- ₹{Math.round(totals.discount).toLocaleString('en-IN')}</span>
                </div>
              )}
              <div className="price-row">
                <span>{gstRate}% GST</span>
                <span>₹{Math.round(totals.tax).toLocaleString('en-IN')}</span>
              </div>
              <div className="price-row">
                <span>Shipping</span>
                <span>{totals.shipping === 0 ? 'FREE' : `₹${totals.shipping}`}</span>
              </div>
              <div className="price-divider"></div>
              <div className="price-row grand-total">
                <span>Grand Total</span>
                <span>₹{Math.round(totals.grandTotal).toLocaleString('en-IN')}</span>
              </div>
            </div>

            <div className="checkout-guarantee">
              <p>🌱 <strong>Fresh Harvest Guarantee:</strong> 100% natural, no synthetic chemicals or adulterants.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
