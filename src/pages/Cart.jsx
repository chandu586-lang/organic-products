import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import './Cart.css';

export default function Cart() {
  const {
    cartItems,
    updateQuantity,
    removeFromCart,
    clearCart,
    totals,
    appliedPromo,
    promoError,
    applyPromoCode,
    removePromoCode,
    currentUser,
    storeSettings
  } = useCart();

  const gstRate = storeSettings?.gstRate ?? 5;
  const freeShippingThreshold = storeSettings?.freeShippingThreshold ?? 500;

  const [couponInput, setCouponInput] = useState('');
  const navigate = useNavigate();

  const handleApplyCoupon = (e) => {
    e.preventDefault();
    if (couponInput.trim()) {
      applyPromoCode(couponInput);
    }
  };

  if (!cartItems || cartItems.length === 0) {
    return (
      <div className="cart-page">
        <div className="empty-cart-container">
          <div className="empty-cart-icon">🛒</div>
          <h2>Your Organic Basket is Empty</h2>
          <p>
            Looks like you haven't added any farm-fresh goodness to your cart yet.
            Discover our cold-pressed oils, pure forest honey, and heirloom grains!
          </p>
          <Link to="/products" className="btn btn-primary start-shopping-btn">
            Explore All Harvest 🌿
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="cart-page">
      <div className="cart-header">
        <h1>Your Shopping Basket</h1>
        <p>Review your selected organic goods before checkout ({totals.totalCount} {totals.totalCount === 1 ? 'item' : 'items'})</p>
      </div>

      <div className="cart-grid">
        {/* Left Column: Cart Items List */}
        <div className="cart-items-section">
          <div className="cart-table-header">
            <span>Product</span>
            <span>Price</span>
            <span>Quantity</span>
            <span>Subtotal</span>
            <span></span>
          </div>

          <div className="cart-items-list">
            {cartItems.map((item) => (
              <div key={item.id} className="cart-item-card">
                <div className="cart-item-info">
                  <img src={item.image} alt={item.name} className="cart-item-img" />
                  <div>
                    <span className="cart-item-category">{item.category}</span>
                    <Link to={`/products/${item.id}`} className="cart-item-name">
                      {item.name}
                    </Link>
                    <span className="cart-item-pack">{item.volume || item.quantityPackage || '500 ml'}</span>
                  </div>
                </div>

                <div className="cart-item-price">
                  ₹{item.price.toLocaleString('en-IN')}
                </div>

                <div className="cart-item-qty">
                  <div className="qty-counter">
                    <button
                      type="button"
                      onClick={() => updateQuantity(item.id, -1)}
                      aria-label="Decrease quantity"
                    >
                      −
                    </button>
                    <span>{item.quantity}</span>
                    <button
                      type="button"
                      onClick={() => updateQuantity(item.id, 1)}
                      aria-label="Increase quantity"
                    >
                      +
                    </button>
                  </div>
                </div>

                <div className="cart-item-subtotal">
                  ₹{(item.price * item.quantity).toLocaleString('en-IN')}
                </div>

                <div className="cart-item-remove">
                  <button
                    type="button"
                    onClick={() => removeFromCart(item.id)}
                    className="remove-btn"
                    title="Remove item"
                  >
                    ✕
                  </button>
                </div>
              </div>
            ))}
          </div>

          <div className="cart-actions-bar">
            <Link to="/products" className="continue-shopping-link">
              ← Continue Shopping
            </Link>
            <button
              type="button"
              onClick={clearCart}
              className="clear-cart-btn"
            >
              Clear Basket
            </button>
          </div>
        </div>

        {/* Right Column: Order Summary & Voucher */}
        <div className="cart-summary-section">
          <div className="summary-card">
            <h3>Order Summary</h3>

            {/* Voucher input */}
            <div className="coupon-box">
              <label htmlFor="coupon">Have a Coupon or Voucher?</label>
              {appliedPromo ? (
                <div className="applied-coupon-pill">
                  <span>Applied: <strong>{appliedPromo.code}</strong></span>
                  <button type="button" onClick={removePromoCode} className="remove-coupon-btn">
                    Remove
                  </button>
                </div>
              ) : (
                <form onSubmit={handleApplyCoupon} className="coupon-form">
                  <input
                    type="text"
                    id="coupon"
                    placeholder="e.g. ORGANIC10 or PURE20"
                    value={couponInput}
                    onChange={(e) => setCouponInput(e.target.value)}
                  />
                  <button type="submit" className="apply-coupon-btn">Apply</button>
                </form>
              )}
              {promoError && <p className="promo-error">{promoError}</p>}
              <div className="coupon-hints">
                <span>Try <strong>ORGANIC10</strong> (10% off) or <strong>PURE20</strong> (20% off)</span>
              </div>
            </div>

            <div className="summary-lines">
              <div className="summary-line">
                <span>Items Subtotal</span>
                <span>₹{totals.subtotal.toLocaleString('en-IN')}</span>
              </div>

              {totals.discount > 0 && (
                <div className="summary-line discount-line">
                  <span>Discount</span>
                  <span>- ₹{Math.round(totals.discount).toLocaleString('en-IN')}</span>
                </div>
              )}

              <div className="summary-line">
                <span>{gstRate}% Organic Goods GST</span>
                <span>₹{Math.round(totals.tax).toLocaleString('en-IN')}</span>
              </div>

              <div className="summary-line">
                <span>Estimated Shipping</span>
                <span>
                  {totals.shipping === 0 ? (
                    <span className="free-shipping-tag">FREE</span>
                  ) : (
                    `₹${totals.shipping}`
                  )}
                </span>
              </div>

              {totals.subtotal < freeShippingThreshold && (
                <p className="free-shipping-tip">
                  Add ₹{(freeShippingThreshold - totals.subtotal).toLocaleString('en-IN')} more to unlock <strong>Free Delivery!</strong>
                </p>
              )}

              <div className="summary-divider"></div>

              <div className="summary-line total-line">
                <span>Total Amount</span>
                <span>₹{Math.round(totals.grandTotal).toLocaleString('en-IN')}</span>
              </div>
            </div>

            <button
              type="button"
              onClick={() => {
                if (!currentUser) {
                  navigate('/auth', {
                    state: {
                      from: '/checkout',
                      message: 'Please sign in to proceed to checkout.'
                    }
                  });
                } else {
                  navigate('/checkout');
                }
              }}
              className="btn btn-primary checkout-btn"
            >
              Proceed to Checkout →
            </button>

            <div className="security-badges">
              <span>🔒 256-Bit SSL Encrypted Checkout</span>
              <span>🌾 100% Certified Chemical-Free Delivery</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
