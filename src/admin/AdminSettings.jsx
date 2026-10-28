import React, { useState } from 'react';
import { 
  Settings, 
  CreditCard, 
  Truck, 
  Store, 
  Bell, 
  ShieldAlert, 
  Save, 
  RotateCcw,
  CheckCircle,
  Key
} from 'lucide-react';
import { useCart } from '../context/CartContext';
import AdminLayout from './AdminLayout';
import './AdminSettings.css';

export default function AdminSettings() {
  const { storeSettings, updateSettings } = useCart();

  const [formData, setFormData] = useState({ ...storeSettings });
  const [showSecret, setShowSecret] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    updateSettings(formData);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  return (
    <AdminLayout activeTab="Store Settings">
      <div className="admin-settings-view">
        <div className="admin-page-header">
          <div>
            <h2>Gateway & Merchant Configuration</h2>
            <p>Payment gateway credentials, shipping rules, tax settings, and store identity</p>
          </div>
          {savedSuccess && (
            <div className="saved-pill">
              <CheckCircle size={15} />
              <span>All Settings Saved!</span>
            </div>
          )}
        </div>

        <form onSubmit={handleSubmit} className="settings-form">
          {/* 1. Payment Gateway Configuration (Razorpay) */}
          <div className="admin-card settings-section-card">
            <div className="section-head-with-icon">
              <div className="section-icon-box bg-amber">
                <CreditCard size={20} />
              </div>
              <div>
                <h3>Payment Gateway Configuration (Razorpay)</h3>
                <p>Configure online UPI, Cards, Netbanking, and webhook callbacks</p>
              </div>
            </div>

            <div className="form-fields-grid">
              <div className="form-group full-col">
                <div className="sandbox-toggle-row">
                  <label className="switch-label">
                    <input
                      type="checkbox"
                      name="simulateRazorpayModal"
                      checked={formData.simulateRazorpayModal}
                      onChange={handleChange}
                    />
                    <span className="slider-switch"></span>
                  </label>
                  <div>
                    <strong>Simulate Razorpay Modal (Sandbox / Test Mode)</strong>
                    <p className="field-hint">
                      Enables test payments without charging real bank accounts. Turn off for live production.
                    </p>
                  </div>
                </div>
              </div>

              <div className="form-group">
                <label>Razorpay Key ID</label>
                <div className="key-input-wrapper">
                  <Key size={15} />
                  <input
                    type="text"
                    name="razorpayKey"
                    value={formData.razorpayKey}
                    onChange={handleChange}
                    placeholder="rzp_test_... or rzp_live_..."
                  />
                </div>
                <span className="field-hint">Found under Razorpay Dashboard &gt; API Keys</span>
              </div>

              <div className="form-group">
                <label>Razorpay Key Secret (Server Verification)</label>
                <div className="key-input-wrapper">
                  <Key size={15} />
                  <input
                    type={showSecret ? 'text' : 'password'}
                    name="razorpaySecret"
                    value={formData.razorpaySecret}
                    onChange={handleChange}
                    placeholder="••••••••••••••••"
                  />
                  <button
                    type="button"
                    onClick={() => setShowSecret(!showSecret)}
                    className="btn-toggle-secret"
                  >
                    {showSecret ? 'Hide' : 'Show'}
                  </button>
                </div>
                <span className="field-hint">Used for webhook and payment capture signature verification</span>
              </div>
            </div>
          </div>

          {/* 2. Store Identity & Farmer Hub */}
          <div className="admin-card settings-section-card">
            <div className="section-head-with-icon">
              <div className="section-icon-box bg-emerald">
                <Store size={20} />
              </div>
              <div>
                <h3>Store Identity & Farmer Extraction Hub</h3>
                <p>Storefront branding, support helpline numbers, and farm origin details</p>
              </div>
            </div>

            <div className="form-fields-grid">
              <div className="form-group">
                <label>Store Brand Name</label>
                <input
                  type="text"
                  name="storeName"
                  value={formData.storeName}
                  onChange={handleChange}
                />
              </div>

              <div className="form-group">
                <label>Support Helpline Number</label>
                <input
                  type="text"
                  name="supportPhone"
                  value={formData.supportPhone}
                  onChange={handleChange}
                />
              </div>

              <div className="form-group">
                <label>Support Email Address</label>
                <input
                  type="email"
                  name="supportEmail"
                  value={formData.supportEmail}
                  onChange={handleChange}
                />
              </div>

              <div className="form-group">
                <label>FSSAI & Organic Certification Tagline</label>
                <input
                  type="text"
                  name="tagline"
                  value={formData.tagline}
                  onChange={handleChange}
                />
              </div>

              <div className="form-group full-col">
                <label>Farmer Extraction Hub & Registered Address</label>
                <input
                  type="text"
                  name="storeAddress"
                  value={formData.storeAddress}
                  onChange={handleChange}
                />
              </div>
            </div>
          </div>

          {/* 3. Shipping & Inventory Rules */}
          <div className="admin-card settings-section-card">
            <div className="section-head-with-icon">
              <div className="section-icon-box bg-blue">
                <Truck size={20} />
              </div>
              <div>
                <h3>Shipping Thresholds & Inventory Stock Rules</h3>
                <p>Free delivery qualification, standard courier rates, and low stock warnings</p>
              </div>
            </div>

            <div className="form-fields-grid three-col">
              <div className="form-group">
                <label>Free Delivery Threshold (₹)</label>
                <input
                  type="number"
                  name="freeShippingThreshold"
                  value={formData.freeShippingThreshold}
                  onChange={handleChange}
                />
                <span className="field-hint">Orders above this qualify for ₹0 shipping</span>
              </div>

              <div className="form-group">
                <label>Standard Shipping Fee (₹)</label>
                <input
                  type="number"
                  name="standardShippingFee"
                  value={formData.standardShippingFee}
                  onChange={handleChange}
                />
                <span className="field-hint">Applied for orders below threshold</span>
              </div>

              <div className="form-group">
                <label>Low Stock Warning Threshold (Units)</label>
                <input
                  type="number"
                  name="lowStockThreshold"
                  value={formData.lowStockThreshold}
                  onChange={handleChange}
                />
                <span className="field-hint">Triggers inventory alert in dashboard</span>
              </div>
            </div>
          </div>

          {/* Save Button */}
          <div className="settings-footer-actions">
            <button type="submit" className="btn-save-settings">
              <Save size={16} />
              <span>Save All Merchant Configurations</span>
            </button>
          </div>
        </form>
      </div>
    </AdminLayout>
  );
}
