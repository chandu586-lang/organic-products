import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import './Auth.css';

export default function Auth() {
  const location = useLocation();
  const [isLogin, setIsLogin] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [errors, setErrors] = useState({});
  const [authError, setAuthError] = useState(location?.state?.message || '');
  const [authSuccess, setAuthSuccess] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { loginUser, registerUser, currentUser, logoutUser, ordersList } = useCart();
  const navigate = useNavigate();

  // If already logged in, show user dashboard view
  if (currentUser) {
    const memberYear = currentUser.created_at
      ? new Date(currentUser.created_at).getFullYear()
      : new Date().getFullYear();
    const userOrders = (ordersList || []).filter(
      (o) => o.customer?.email?.toLowerCase() === currentUser.email?.toLowerCase()
    );
    const totalSpent = userOrders.reduce((sum, o) => sum + (o.pricing?.total || 0), 0);
    const harvestPoints = Math.max(0, Math.floor(totalSpent / 10));

    return (
      <div className="auth-page">
        <div className="auth-card profile-card">
          <div className="avatar-circle">
            {currentUser.name ? currentUser.name.charAt(0).toUpperCase() : '🌿'}
          </div>
          <h2>Welcome, {currentUser.name}!</h2>
          <p className="profile-email">{currentUser.email}</p>
          <div className="profile-status">
            <span className="organic-member-badge">🌱 Verified Organic Club Member</span>
          </div>

          <div className="profile-details-box">
            <p><strong>Member Since:</strong> {memberYear}</p>
            <p><strong>Orders Placed:</strong> {userOrders.length}</p>
            <p><strong>Harvest Points:</strong> {harvestPoints} Pts</p>
            <p><strong>Preferred Delivery:</strong> Express Organic Direct</p>
          </div>

          <div className="profile-actions">
            <button
              type="button"
              onClick={() => navigate('/products')}
              className="btn btn-primary"
            >
              Explore Fresh Harvest 🌾
            </button>
            <button
              type="button"
              onClick={() => navigate('/cart')}
              className="btn btn-outline"
            >
              View Basket 🛒
            </button>
            <button
              type="button"
              onClick={logoutUser}
              className="btn btn-logout"
            >
              Log Out
            </button>
          </div>
        </div>
      </div>
    );
  }

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
    if (authError) {
      setAuthError('');
    }
  };

  const validate = () => {
    const errs = {};
    if (!formData.email.trim()) {
      errs.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      errs.email = 'Please enter a valid email address';
    }

    if (!formData.password) {
      errs.password = 'Password is required';
    } else if (!isLogin && formData.password.length < 6) {
      errs.password = 'Password must be at least 6 characters';
    }

    if (!isLogin) {
      if (!formData.name.trim()) {
        errs.name = 'Full name is required';
      }
      if (formData.password !== formData.confirmPassword) {
        errs.confirmPassword = 'Passwords do not match';
      }
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setAuthError('');
    setAuthSuccess('');
    if (!validate()) return;

    setIsSubmitting(true);
    try {
      if (isLogin) {
        const res = await loginUser({
          email: formData.email.trim(),
          password: formData.password
        });
        if (!res.success) {
          setAuthError(res.error || 'Invalid email or password.');
          return;
        }
        setAuthSuccess('Logged in successfully! Redirecting...');
        const defaultRedirect =
          res.user?.role === 'admin' || res.user?.role === 'worker' ? '/admin' : '/products';
        const redirectTo = location.state?.from || defaultRedirect;
        setTimeout(() => {
          navigate(redirectTo, { replace: true });
        }, 600);
      } else {
        const res = await registerUser({
          name: formData.name.trim(),
          email: formData.email.trim(),
          password: formData.password
        });
        if (!res.success) {
          setAuthError(res.error || 'Registration failed. Please try again.');
          return;
        }
        setAuthSuccess('Account created successfully! Please sign in with your credentials.');
        setIsLogin(true);
        setFormData((prev) => ({
          ...prev,
          password: '',
          confirmPassword: ''
        }));
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        {/* Toggle tabs */}
        <div className="auth-tabs">
          <button
            type="button"
            className={`auth-tab ${isLogin ? 'active' : ''}`}
            onClick={() => {
              setIsLogin(true);
              setErrors({});
              setAuthError('');
              setAuthSuccess('');
            }}
          >
            Sign In
          </button>
          <button
            type="button"
            className={`auth-tab ${!isLogin ? 'active' : ''}`}
            onClick={() => {
              setIsLogin(false);
              setErrors({});
              setAuthError('');
              setAuthSuccess('');
            }}
          >
            Create Account
          </button>
        </div>

        <div className="auth-header">
          <h2>{isLogin ? 'Welcome Back!' : 'Join Our Organic Family'}</h2>
          <p>
            {isLogin
              ? 'Access your orders, saved addresses, and farm rewards'
              : 'Sign up to receive 100% natural, unadulterated farm foods'}
          </p>
        </div>

        {authError && <div className="auth-alert error">{authError}</div>}
        {authSuccess && <div className="auth-alert success">{authSuccess}</div>}

        <form onSubmit={handleSubmit} noValidate className="auth-form">
          {!isLogin && (
            <div className="form-group">
              <label htmlFor="name">Full Name</label>
              <input
                type="text"
                id="name"
                name="name"
                placeholder="e.g. Ramesh Kumar"
                value={formData.name}
                onChange={handleChange}
                className={errors.name ? 'input-error' : ''}
              />
              {errors.name && <span className="field-error">{errors.name}</span>}
            </div>
          )}

          <div className="form-group">
            <label htmlFor="auth-email">Email Address</label>
            <input
              type="email"
              id="auth-email"
              name="email"
              placeholder="e.g. name@example.com"
              value={formData.email}
              onChange={handleChange}
              className={errors.email ? 'input-error' : ''}
            />
            {errors.email && <span className="field-error">{errors.email}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="auth-password">Password</label>
            <div className="password-input-wrapper">
              <input
                type={showPassword ? 'text' : 'password'}
                id="auth-password"
                name="password"
                placeholder="At least 6 characters"
                value={formData.password}
                onChange={handleChange}
                className={errors.password ? 'input-error' : ''}
              />
              <button
                type="button"
                className="toggle-password-btn"
                onClick={() => setShowPassword(!showPassword)}
                tabIndex="-1"
              >
                {showPassword ? 'Hide' : 'Show'}
              </button>
            </div>
            {errors.password && <span className="field-error">{errors.password}</span>}
          </div>

          {!isLogin && (
            <div className="form-group">
              <label htmlFor="confirmPassword">Confirm Password</label>
              <input
                type={showPassword ? 'text' : 'password'}
                id="confirmPassword"
                name="confirmPassword"
                placeholder="Re-enter password"
                value={formData.confirmPassword}
                onChange={handleChange}
                className={errors.confirmPassword ? 'input-error' : ''}
              />
              {errors.confirmPassword && (
                <span className="field-error">{errors.confirmPassword}</span>
              )}
            </div>
          )}

          <button type="submit" disabled={isSubmitting} className="btn btn-primary auth-submit-btn">
            {isSubmitting
              ? isLogin
                ? 'Signing In...'
                : 'Creating Account...'
              : isLogin
                ? 'Sign In to Account'
                : 'Register Account'}
          </button>
        </form>

        <div className="auth-footer">
          <p>
            {isLogin ? "Don't have an account yet? " : 'Already registered? '}
            <button
              type="button"
              className="toggle-auth-link"
              onClick={() => {
                setIsLogin(!isLogin);
                setErrors({});
                setAuthError('');
                setAuthSuccess('');
              }}
            >
              {isLogin ? 'Sign up here' : 'Sign in here'}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}
