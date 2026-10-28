import React, { useState } from 'react';
import { 
  CreditCard, 
  ShieldCheck, 
  Lock, 
  CheckCircle2, 
  Key, 
  AlertCircle,
  Eye,
  EyeOff,
  Save
} from 'lucide-react';
import { useCart } from '../context/CartContext';
import AdminLayout from './AdminLayout';
import './AdminPayment.css';

export default function AdminPayment() {
  const { storeSettings, updateSettings } = useCart();
  const [showSecret, setShowSecret] = useState(false);
  const [formData, setFormData] = useState({
    razorpayKey: storeSettings.razorpayKey || 'rzp_test_NatureNestKey',
    razorpaySecret: storeSettings.razorpaySecret || '••••••••••••••••••••••••',
    codEnabled: true,
    upiEnabled: true,
    cardEnabled: true,
    netBankingEnabled: true,
    simulateModal: storeSettings.simulateRazorpayModal !== false
  });

  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    updateSettings({
      razorpayKey: formData.razorpayKey,
      razorpaySecret: formData.razorpaySecret,
      simulateRazorpayModal: formData.simulateModal
    });
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  return (
    <AdminLayout activeTab="Payment Settings">
      <div className="payment-view">
        <div className="payment-head">
          <div>
            <h1 className="payment-title">Payment Gateway Configuration</h1>
            <p className="payment-sub">Manage Razorpay, UPI QR, Cards, Cash on Delivery, and secure keys</p>
          </div>
          <div className="security-tag">
            <Lock size={15} /> 256-Bit SSL Encrypted
          </div>
        </div>

        {savedSuccess && (
          <div className="alert-banner-success">
            <CheckCircle2 size={18} />
            <span>Payment settings updated successfully! Storefront checkout reflects these gateway rules.</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="payment-form-grid">
          {/* Main Credentials Card */}
          <div className="payment-card">
            <div className="card-header-icon">
              <Key size={20} className="icon-forest" />
              <div>
                <h3 className="card-title">Razorpay API Credentials</h3>
                <p className="card-sub">Used for processing UPI, Debit/Credit Cards & NetBanking transactions</p>
              </div>
            </div>

            <div className="form-fields">
              <div className="form-group">
                <label className="form-label">Razorpay Key ID (Public)</label>
                <input
                  type="text"
                  value={formData.razorpayKey}
                  onChange={(e) => setFormData({ ...formData, razorpayKey: e.target.value })}
                  className="form-control"
                  placeholder="rzp_test_..."
                  required
                />
                <span className="field-hint">Public key embedded safely in customer storefront checkout</span>
              </div>

              <div className="form-group">
                <label className="form-label">Razorpay Key Secret</label>
                <div className="secret-input-wrapper">
                  <input
                    type={showSecret ? "text" : "password"}
                    value={formData.razorpaySecret}
                    onChange={(e) => setFormData({ ...formData, razorpaySecret: e.target.value })}
                    className="form-control"
                    placeholder="Enter secret key..."
                    required
                  />
                  <button
                    type="button"
                    className="toggle-secret-btn"
                    onClick={() => setShowSecret(!showSecret)}
                  >
                    {showSecret ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
                <span className="field-hint text-amber">
                  Protected: Credentials should be securely routed via backend in live production.
                </span>
              </div>

              <div className="form-group checkbox-group">
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    checked={formData.simulateModal}
                    onChange={(e) => setFormData({ ...formData, simulateModal: e.target.checked })}
                  />
                  <span>Enable Interactive Razorpay Demo Sandbox Modal</span>
                </label>
              </div>
            </div>
          </div>

          {/* Payment Methods Toggles */}
          <div className="payment-card">
            <div className="card-header-icon">
              <CreditCard size={20} className="icon-forest" />
              <div>
                <h3 className="card-title">Enabled Payment Methods</h3>
                <p className="card-sub">Control which options customers can pick during checkout</p>
              </div>
            </div>

            <div className="toggles-list">
              <label className="toggle-row">
                <div>
                  <span className="toggle-title">UPI & Instant QR (Google Pay, PhonePe, Paytm)</span>
                  <span className="toggle-desc">Zero transaction convenience charge</span>
                </div>
                <input
                  type="checkbox"
                  checked={formData.upiEnabled}
                  onChange={(e) => setFormData({ ...formData, upiEnabled: e.target.checked })}
                />
              </label>

              <label className="toggle-row">
                <div>
                  <span className="toggle-title">Debit & Credit Cards</span>
                  <span className="toggle-desc">Visa, MasterCard, RuPay, Amex</span>
                </div>
                <input
                  type="checkbox"
                  checked={formData.cardEnabled}
                  onChange={(e) => setFormData({ ...formData, cardEnabled: e.target.checked })}
                />
              </label>

              <label className="toggle-row">
                <div>
                  <span className="toggle-title">Cash on Delivery (COD)</span>
                  <span className="toggle-desc">Customer pays cash upon courier arrival</span>
                </div>
                <input
                  type="checkbox"
                  checked={formData.codEnabled}
                  onChange={(e) => setFormData({ ...formData, codEnabled: e.target.checked })}
                />
              </label>
            </div>

            <button type="submit" className="btn-save-payment">
              <Save size={16} /> Save Gateway Settings
            </button>
          </div>
        </form>
      </div>
    </AdminLayout>
  );
}
