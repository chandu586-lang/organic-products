import React from 'react';
import { Link } from 'react-router-dom';
import { Truck, ShieldCheck, Award, Heart, Mail } from 'lucide-react';
import './Footer.css';

/**
 * Footer Component for MSV Naturals Organic Store
 * Trust badges, farm credentials, category links, and newsletter
 */
function Footer() {
  return (
    <footer className="site-footer">
      {/* Trust Pillars */}
      <div className="footer-trust-strip">
        <div className="container trust-grid">
          <div className="trust-item">
            <Truck size={24} className="trust-icon" />
            <div>
              <h4>Farm-Direct Express Shipping</h4>
              <p>Direct from rural village farms to your home</p>
            </div>
          </div>
          <div className="trust-item">
            <ShieldCheck size={24} className="trust-icon" />
            <div>
              <h4>100% Traditional Chekku</h4>
              <p>Vaagai wood-pressed without chemicals</p>
            </div>
          </div>
          <div className="trust-item">
            <Award size={24} className="trust-icon" />
            <div>
              <h4>Lab-Tested Purity</h4>
              <p>Zero trans-fats, zero mineral oil or additives</p>
            </div>
          </div>
          <div className="trust-item">
            <Heart size={24} className="trust-icon" />
            <div>
              <h4>Fair Farmer Support</h4>
              <p>Empowering native organic growers</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Footer Links */}
      <div className="container footer-main-content">
        <div className="footer-column brand-col">
          <div className="footer-brand">
            <span className="brand-logo-emoji">🌿</span>
            <span className="brand-name">Nature<span>Nest</span></span>
          </div>
          <p className="footer-desc">
            Committed to bringing authentic, chemical-free cold-pressed oils,
            unprocessed forest honey, Vedic A2 cow ghee, and unpolished heritage
            grains directly from native farmers.
          </p>
          <div className="organic-cert-badge">
            🌱 100% Certified Organic & Chemical-Free
          </div>
        </div>

        <div className="footer-column">
          <h4 className="footer-title">Harvest Departments</h4>
          <ul className="footer-links">
            <li><Link to="/products?category=Cold-Pressed%20Oils">Cold-Pressed Oils</Link></li>
            <li><Link to="/products?category=Raw%20Honey">Raw Wild Forest Honey</Link></li>
            <li><Link to="/products?category=A2%20Dairy%20%26%20Ghee">A2 Vedic Desi Ghee</Link></li>
            <li><Link to="/products?category=Heritage%20Grains">Heirloom Rice & Grains</Link></li>
            <li><Link to="/products?category=Natural%20Sweeteners">Organic Palm Jaggery</Link></li>
          </ul>
        </div>

        <div className="footer-column">
          <h4 className="footer-title">Customer Care</h4>
          <ul className="footer-links">
            <li><Link to="/cart">Harvest Basket (Cart)</Link></li>
            <li><Link to="/checkout">Checkout Portal</Link></li>
            <li><Link to="/auth">Customer Login / Signup</Link></li>
            <li><Link to="/products">All Products</Link></li>
          </ul>
        </div>

        <div className="footer-column newsletter-col">
          <h4 className="footer-title">Fresh Harvest Updates</h4>
          <p className="newsletter-text">Subscribe to receive notifications when fresh seasonal honey and oil batches arrive.</p>
          <form onSubmit={(e) => { e.preventDefault(); alert("Thank you for subscribing to NatureNest!"); }} className="footer-newsletter-form">
            <input type="email" placeholder="Enter your email" required className="newsletter-input" />
            <button type="submit" className="newsletter-btn">Subscribe</button>
          </form>
        </div>
      </div>

      <div className="footer-bottom-bar">
        <div className="container bottom-content">
          <p>© {new Date().getFullYear()} NatureNest. Pure Organic Foods. All rights reserved.</p>
          <p>Handcrafted with ❤️ for healthy living</p>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
