import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Sparkles, TrendingUp, ShieldCheck, Zap, Award, CheckCircle } from 'lucide-react';
import { useCart } from '../context/CartContext';
import ProductCard from '../components/ProductCard';
import './Home.css';

/**
 * 1. Home Page Component
 * Attractive organic banner, hero section, categories, trending products,
 * new arrivals, and harvest trust pillars.
 */
function Home() {
  const { productsList: products, categories } = useCart();
  const trendingProducts = products.filter((p) => p.isTrending);
  const newArrivals = products.filter((p) => p.isNew);

  return (
    <div className="home-page fade-in">
      {/* 1. Hero Section */}
      <section className="hero-section">
        <div className="container hero-container">
          <div className="hero-content">
            <div className="hero-pill">
              <Sparkles size={16} />
              <span>100% Traditional Cold-Pressed & Farm-Direct</span>
            </div>
            <h1 className="hero-title">
              Pure Cold-Pressed Oils, Raw Forest Honey & Organic Grains.
            </h1>
            <p className="hero-subtitle">
              Authentic wood-pressed (marachekku) oils, unheated wildflower honey,
              and unpolished native heritage grains sourced directly from rural generational farmers.
            </p>
            <div className="hero-cta-group">
              <Link to="/products" className="btn btn-primary hero-btn">
                <span>Explore All Harvest</span>
                <ArrowRight size={18} />
              </Link>
              <Link to="/products?category=Cold-Pressed%20Oils" className="btn btn-secondary hero-btn-secondary">
                Cold-Pressed Oils
              </Link>
            </div>

            {/* Quick Farm Stats */}
            <div className="hero-stats">
              <div className="stat-unit">
                <span className="stat-number">100%</span>
                <span className="stat-label">Chemical Free</span>
              </div>
              <div className="stat-divider"></div>
              <div className="stat-unit">
                <span className="stat-number">4.9★</span>
                <span className="stat-label">Purity Rating</span>
              </div>
              <div className="stat-divider"></div>
              <div className="stat-unit">
                <span className="stat-number">Direct</span>
                <span className="stat-label">From Farmers</span>
              </div>
            </div>
          </div>

          <div className="hero-visual">
            <div className="hero-card-featured">
              <img 
                src="https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?w=800&q=80" 
                alt="Wood-Pressed Groundnut Oil"
                className="hero-featured-img" 
              />
              <div className="hero-featured-badge">
                <span className="badge badge-sale">FEATURED HARVEST</span>
                <h4>Wood-Pressed Groundnut Oil</h4>
                <p className="featured-price">₹195 <span>₹220</span></p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. Category Navigation Chips */}
      <section className="categories-strip">
        <div className="container">
          <div className="categories-header-row">
            <h3>Explore by Category</h3>
            <Link to="/products" className="view-all-cats">View All ➔</Link>
          </div>
          <div className="categories-scroll-wrapper">
            {categories.map((cat) => (
              <Link
                key={cat}
                to={cat === 'All' ? '/products' : `/products?category=${encodeURIComponent(cat)}`}
                className="category-pill-card"
              >
                <span>{cat}</span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* 3. Featured / Trending Products */}
      <section className="section-padding">
        <div className="container">
          <div className="section-header">
            <div>
              <div className="section-badge">
                <TrendingUp size={15} />
                <span>CUSTOMER FAVORITES</span>
              </div>
              <h2 className="section-title">Trending Organic Harvest</h2>
            </div>
            <Link to="/products" className="view-all-link">
              <span>View all harvest</span>
              <ArrowRight size={16} />
            </Link>
          </div>

          <div className="product-grid">
            {trendingProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </div>
      </section>

      {/* 4. Promotional Banner */}
      <section className="promo-banner-section">
        <div className="container">
          <div className="promo-banner-box">
            <div className="promo-content">
              <span className="promo-tag">FARM WELCOME OFFER</span>
              <h2>Flat 10% Off On Your First Organic Order</h2>
              <p>Apply coupon code <strong>ORGANIC10</strong> during checkout to unlock special welcome discounts.</p>
              <div className="promo-code-pill">
                <span>Code: <strong>ORGANIC10</strong></span>
              </div>
            </div>
            <div className="promo-action">
              <Link to="/products" className="btn btn-primary promo-btn">
                Shop Harvest Now
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* 5. Fresh Harvest & New Arrivals */}
      {newArrivals.length > 0 && (
        <section className="section-padding">
          <div className="container">
            <div className="section-header">
              <div>
                <div className="section-badge">
                  <Zap size={15} />
                  <span>JUST PRESSED & HARVESTED</span>
                </div>
                <h2 className="section-title">Fresh Batches & New Arrivals</h2>
              </div>
              <Link to="/products" className="view-all-link">
                <span>Explore all</span>
                <ArrowRight size={16} />
              </Link>
            </div>

            <div className="product-grid">
              {newArrivals.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* 6. Why Shop With Us Pillars */}
      <section className="why-us-section">
        <div className="container">
          <div className="why-us-grid">
            <div className="why-card">
              <div className="why-icon">
                <ShieldCheck size={28} />
              </div>
              <h3>100% Vaagai Wood-Pressed</h3>
              <p>Extracted slowly at room temperature without friction heat, preserving natural vitamins and taste.</p>
            </div>
            <div className="why-card">
              <div className="why-icon">
                <CheckCircle size={28} />
              </div>
              <h3>Lab-Tested Zero Trans-Fats</h3>
              <p>Strict quality assurance with zero chemical refining, zero mineral oils, and zero preservatives.</p>
            </div>
            <div className="why-card">
              <div className="why-icon">
                <Award size={28} />
              </div>
              <h3>Direct Native Farmer Support</h3>
              <p>Every purchase supports rural farming families with fair pricing and sustainable practices.</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

export default Home;
