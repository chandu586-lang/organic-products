import React, { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  Check, 
  Truck, 
  ShieldCheck, 
  ShoppingBasket,
  Plus,
  Minus,
  CheckCircle,
  Package 
} from 'lucide-react';
import { useCart } from '../context/CartContext';
import StarRating from '../components/StarRating';
import ProductCard from '../components/ProductCard';
import './ProductDetails.css';

/**
 * 3. Product Details Page Component
 * Large images, gallery, pricing, stock, ingredients, benefits, quantity selector,
 * Add to Cart button, and related products.
 */
function ProductDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart, productsList: products } = useCart();

  const product = products.find((p) => p.id === parseInt(id));

  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState('benefits'); // 'benefits' | 'ingredients' | 'specs'

  if (!product) {
    return (
      <div className="container not-found-container">
        <h2>Organic Product Not Found</h2>
        <p>The harvest item you are looking for does not exist or has been removed.</p>
        <Link to="/products" className="btn btn-primary">
          <ArrowLeft size={18} />
          <span>Back to All Products</span>
        </Link>
      </div>
    );
  }

  const galleryImages = product.images && product.images.length > 0 ? product.images : [product.image];

  const relatedProducts = products
    .filter((p) => p.category === product.category && p.id !== product.id)
    .slice(0, 3);

  const handleDecrease = () => setQuantity((prev) => Math.max(1, prev - 1));
  const handleIncrease = () => setQuantity((prev) => Math.min(product.stock, prev + 1));

  const handleAddToCart = () => {
    addToCart(product, quantity);
  };

  const handleBuyNow = () => {
    addToCart(product, quantity);
    navigate('/checkout');
  };

  return (
    <div className="product-details-page fade-in">
      <div className="container">
        {/* Breadcrumb Navigation */}
        <nav className="details-breadcrumb">
          <Link to="/">Home</Link>
          <span className="crumb-sep">/</span>
          <Link to="/products">Harvest</Link>
          <span className="crumb-sep">/</span>
          <Link to={`/products?category=${encodeURIComponent(product.category)}`}>
            {product.category}
          </Link>
          <span className="crumb-sep">/</span>
          <span className="crumb-current">{product.name}</span>
        </nav>

        {/* Product Showcase Grid */}
        <div className="product-showcase-grid">
          {/* Left: Gallery Column */}
          <div className="gallery-column">
            <div className="main-image-viewport">
              <img
                src={galleryImages[selectedImage] || product.image}
                alt={product.name}
                className="main-display-image"
              />
              {product.discountPercent > 0 && (
                <span className="badge badge-sale gallery-badge">
                  {product.discountPercent}% OFF
                </span>
              )}
            </div>

            {/* Gallery Thumbnails */}
            {galleryImages.length > 1 && (
              <div className="thumbnails-strip">
                {galleryImages.map((imgUrl, index) => (
                  <button
                    key={index}
                    type="button"
                    className={`thumb-btn ${selectedImage === index ? 'active' : ''}`}
                    onClick={() => setSelectedImage(index)}
                  >
                    <img src={imgUrl} alt={`Thumbnail ${index + 1}`} />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Right: Info Column */}
          <div className="info-column">
            <div className="product-category-tag">{product.category}</div>
            <h1 className="details-product-title">{product.name}</h1>

            {/* Rating & Stock Availability */}
            <div className="rating-stock-row">
              <StarRating rating={product.rating} count={product.reviewCount} />
              <div className="stock-pill">
                <span className="stock-dot"></span>
                <span>In Stock ({product.stock} units available)</span>
              </div>
            </div>

            {/* Price Box */}
            <div className="details-price-box">
              <span className="details-current-price">₹{product.price.toFixed(2)}</span>
              {product.originalPrice && (
                <span className="details-orig-price">₹{product.originalPrice.toFixed(2)}</span>
              )}
              {product.discountPercent > 0 && (
                <span className="save-amount-badge">
                  Save ₹{(product.originalPrice - product.price).toFixed(2)}
                </span>
              )}
            </div>

            <p className="details-short-desc">{product.description}</p>

            {/* Key Benefits Bulletpoints */}
            {product.benefits && (
              <ul className="details-benefits-list">
                {product.benefits.slice(0, 3).map((item, idx) => (
                  <li key={idx}>
                    <Check size={16} className="benefit-check" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            )}

            {/* Quantity Selector & Action Buttons */}
            <div className="purchase-controls">
              <div className="quantity-picker">
                <button 
                  type="button" 
                  onClick={handleDecrease} 
                  disabled={quantity <= 1}
                  aria-label="Decrease quantity"
                >
                  <Minus size={16} />
                </button>
                <span className="qty-number">{quantity}</span>
                <button 
                  type="button" 
                  onClick={handleIncrease} 
                  disabled={quantity >= product.stock}
                  aria-label="Increase quantity"
                >
                  <Plus size={16} />
                </button>
              </div>

              <button 
                type="button" 
                className="btn btn-primary add-cart-btn-large"
                onClick={handleAddToCart}
              >
                <ShoppingBasket size={20} />
                <span>Add to Cart</span>
              </button>

              <button 
                type="button" 
                className="btn btn-secondary buy-now-btn"
                onClick={handleBuyNow}
              >
                Buy Now
              </button>
            </div>

            {/* Trust Badges */}
            <div className="details-trust-strip">
              <div className="trust-badge-unit">
                <Truck size={18} />
                <span>Farm-Direct Express</span>
              </div>
              <div className="trust-badge-unit">
                <ShieldCheck size={18} />
                <span>100% Traditional Chekku</span>
              </div>
              <div className="trust-badge-unit">
                <Package size={18} />
                <span>Food-Grade Glass Packaging</span>
              </div>
            </div>
          </div>
        </div>

        {/* Detailed Tabs: Benefits, Ingredients, Specifications */}
        <div className="details-tabs-section">
          <div className="tabs-header-bar">
            <button
              type="button"
              className={`tab-btn ${activeTab === 'benefits' ? 'active' : ''}`}
              onClick={() => setActiveTab('benefits')}
            >
              Health Benefits
            </button>
            <button
              type="button"
              className={`tab-btn ${activeTab === 'ingredients' ? 'active' : ''}`}
              onClick={() => setActiveTab('ingredients')}
            >
              Ingredients & Purity
            </button>
            <button
              type="button"
              className={`tab-btn ${activeTab === 'specs' ? 'active' : ''}`}
              onClick={() => setActiveTab('specs')}
            >
              Harvest Specifications
            </button>
          </div>

          <div className="tab-body-card">
            {activeTab === 'benefits' && (
              <div className="tab-pane-content">
                <h3>Authentic Traditional Benefits</h3>
                <ul className="full-benefits-list">
                  {product.benefits?.map((b, i) => (
                    <li key={i}>
                      <CheckCircle size={18} className="check-icon" />
                      <span>{b}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {activeTab === 'ingredients' && (
              <div className="tab-pane-content">
                <h3>100% Single-Origin Farm Ingredients</h3>
                <p className="ingredients-lead">{product.ingredients}</p>
                <p className="ingredients-note">
                  Zero synthetic preservatives, zero added color, zero chemical deodorizing,
                  and zero artificial additives. What you get is pure nature in its freshest state.
                </p>
              </div>
            )}

            {activeTab === 'specs' && product.specs && (
              <div className="specs-table-view">
                {Object.entries(product.specs).map(([key, val]) => (
                  <div key={key} className="spec-row">
                    <span className="spec-label">{key}</span>
                    <span className="spec-value">{val}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Related Organic Harvest */}
        {relatedProducts.length > 0 && (
          <div className="related-products-section">
            <h2 className="related-title">You May Also Like</h2>
            <div className="product-grid">
              {relatedProducts.map((relProd) => (
                <ProductCard key={relProd.id} product={relProd} />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default ProductDetails;
