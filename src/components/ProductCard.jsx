import React from 'react';
import { Link } from 'react-router-dom';
import { ShoppingBasket, Eye } from 'lucide-react';
import StarRating from './StarRating';
import { useCart } from '../context/CartContext';
import './ProductCard.css';

/**
 * ProductCard Component for MSV Naturals Organic Products
 * Reusable card with Add to Cart, View Details, badges, and rating.
 */
function ProductCard({ product }) {
  const { addToCart } = useCart();

  if (!product) return null;

  return (
    <article className="product-card">
      <div className="card-image-wrapper">
        <Link to={`/products/${product.id}`}>
          <img 
            src={product.image} 
            alt={product.name} 
            loading="lazy" 
            className="card-image"
          />
        </Link>

        {/* Badges */}
        <div className="card-badge-container">
          {product.discountPercent > 0 && (
            <span className="badge badge-sale">{product.discountPercent}% OFF</span>
          )}
          {product.isNew && (
            <span className="badge badge-new">FRESH HARVEST</span>
          )}
        </div>

        {/* Quick View Details Button on Hover */}
        <Link to={`/products/${product.id}`} className="card-quick-view-btn">
          <Eye size={15} />
          <span>View Details</span>
        </Link>
      </div>

      <div className="card-content">
        <span className="card-category">{product.category}</span>
        
        <h3 className="card-title">
          <Link to={`/products/${product.id}`}>{product.name}</Link>
        </h3>

        <div className="card-rating">
          <StarRating rating={product.rating} count={product.reviewCount} />
        </div>

        <div className="card-footer">
          <div className="card-pricing">
            <span className="card-price">₹{product.price.toFixed(2)}</span>
            {product.originalPrice && (
              <span className="card-original-price">₹{product.originalPrice.toFixed(2)}</span>
            )}
          </div>

          <button 
            type="button"
            className="card-add-btn"
            onClick={() => addToCart(product, 1)}
            aria-label={`Add ${product.name} to cart`}
            title="Add to Cart"
          >
            <ShoppingBasket size={18} />
            <span>Add to Cart</span>
          </button>
        </div>
      </div>
    </article>
  );
}

export default ProductCard;
