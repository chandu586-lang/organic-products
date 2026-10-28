import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  ShieldCheck, 
  Lock, 
  User, 
  Eye, 
  EyeOff, 
  ArrowRight, 
  Leaf, 
  Store, 
  AlertCircle,
  KeyRound
} from 'lucide-react';
import { useCart } from '../context/CartContext';
import './AdminLogin.css';

export default function AdminLogin() {
  const { loginAdmin } = useCart();
  const [email, setEmail]           = useState('');
  const [password, setPassword]     = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError]           = useState('');
  const [isLoading, setIsLoading]   = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!email.trim() || !password.trim()) {
      setError('Please enter both email and password.');
      return;
    }
    setIsLoading(true);
    const res = await loginAdmin({ email: email.trim(), password });
    setIsLoading(false);
    if (!res.success) {
      setError(res.error || 'Invalid credentials. Please try again.');
    }
  };

  const handleQuickLogin = async (em, pass) => {
    setEmail(em);
    setPassword(pass);
    setError('');
    setIsLoading(true);
    const res = await loginAdmin({ email: em, password: pass });
    setIsLoading(false);
    if (!res.success) setError(res.error || 'Login failed.');
  };

  return (
    <div className="admin-login-viewport">
      <div className="admin-login-card">
        {/* Brand & Security Header */}
        <div className="admin-login-head">
          <div className="admin-login-badge">
            <Leaf size={28} className="text-leaf" />
          </div>
          <h1 className="admin-login-title">
            Nature<span className="text-forest">Nest</span>
          </h1>
          <div className="restricted-pill">
            <ShieldCheck size={14} />
            <span>Staff & Worker Admin Portal</span>
          </div>
          <p className="admin-login-desc">
            Authorized personnel only. Please verify your staff credentials to access inventory and store operations.
          </p>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="admin-login-error">
            <AlertCircle size={16} />
            <span>{error}</span>
          </div>
        )}

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="admin-login-form">
          <div className="admin-form-group">
            <label>Email Address</label>
            <div className="input-with-icon">
              <User size={16} className="input-icon" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => { setEmail(e.target.value); if (error) setError(''); }}
                placeholder="e.g. admin@naturenest.com"
                autoFocus
              />
            </div>
          </div>

          <div className="admin-form-group">
            <label>Password</label>
            <div className="input-with-icon">
              <Lock size={16} className="input-icon" />
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  if (error) setError('');
                }}
                placeholder="Enter password"
              />
              <button
                type="button"
                className="btn-toggle-eye"
                onClick={() => setShowPassword(!showPassword)}
                title={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            className="btn-admin-login-submit"
            disabled={isLoading}
          >
            {isLoading ? (
              <span>Verifying Credentials...</span>
            ) : (
              <>
                <span>Sign In to Admin Portal</span>
                <ArrowRight size={16} />
              </>
            )}
          </button>
        </form>

        {/* Quick Demo Worker Credentials Card */}
        <div className="demo-credentials-card">
          <div className="demo-header">
            <KeyRound size={14} className="text-amber" />
            <span>Quick Staff Access Credentials</span>
          </div>
          <p className="demo-desc">Click below to auto-fill and log in immediately:</p>
          <div className="demo-buttons-grid">
            <button
              type="button"
              className="btn-demo-account worker"
              onClick={() => handleQuickLogin('ramesh@naturenest.com', 'password')}
            >
              <div className="demo-acc-top">
                <span className="demo-icon">🌾</span>
                <strong>Inventory Worker</strong>
              </div>
              <span className="demo-sub">ramesh@naturenest.com • password</span>
            </button>

            <button
              type="button"
              className="btn-demo-account admin"
              onClick={() => handleQuickLogin('admin@naturenest.com', 'password')}
            >
              <div className="demo-acc-top">
                <span className="demo-icon">🛡️</span>
                <strong>Store Manager</strong>
              </div>
              <span className="demo-sub">admin@naturenest.com • password</span>
            </button>
          </div>
        </div>

        {/* Footer Link back to Storefront */}
        <div className="admin-login-footer">
          <Link to="/" className="storefront-return-link">
            <Store size={15} />
            <span>Return to Customer Storefront</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
