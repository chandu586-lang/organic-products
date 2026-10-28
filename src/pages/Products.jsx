import React, { useState, useMemo, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Search, SlidersHorizontal, RotateCcw, PackageX } from 'lucide-react';
import { useCart } from '../context/CartContext';
import ProductCard from '../components/ProductCard';
import './Products.css';

/**
 * 2. Products Page Component
 * Responsive grid, search, category filters, price sorting, and instant Add to Cart.
 */
function Products() {
  const { productsList: products, categories } = useCart();
  const [searchParams, setSearchParams] = useSearchParams();

  const categoryParam = searchParams.get('category') || 'All';
  const searchParam = searchParams.get('search') || '';

  const [selectedCategory, setSelectedCategory] = useState(categoryParam);
  const [searchKeyword, setSearchKeyword] = useState(searchParam);
  const [maxPrice, setMaxPrice] = useState(1000);
  const [sortBy, setSortBy] = useState('featured');
  const [onlyInStock, setOnlyInStock] = useState(false);

  useEffect(() => {
    if (categoryParam) setSelectedCategory(categoryParam);
    if (searchParam) setSearchKeyword(searchParam);
  }, [categoryParam, searchParam]);

  const handleCategorySelect = (category) => {
    setSelectedCategory(category);
    if (category === 'All') {
      searchParams.delete('category');
    } else {
      searchParams.set('category', category);
    }
    setSearchParams(searchParams);
  };

  const handleResetFilters = () => {
    setSelectedCategory('All');
    setSearchKeyword('');
    setMaxPrice(1000);
    setSortBy('featured');
    setOnlyInStock(false);
    setSearchParams({});
  };

  // Filter & Sort Logic
  const filteredProducts = useMemo(() => {
    let result = [...products];

    // 1. Category
    if (selectedCategory && selectedCategory !== 'All') {
      result = result.filter(
        (p) => p.category.toLowerCase() === selectedCategory.toLowerCase()
      );
    }

    // 2. Keyword Search
    if (searchKeyword.trim()) {
      const q = searchKeyword.toLowerCase().trim();
      result = result.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.category.toLowerCase().includes(q) ||
          p.description.toLowerCase().includes(q)
      );
    }

    // 3. Price Filter
    result = result.filter((p) => p.price <= maxPrice);

    // 4. In-Stock Filter
    if (onlyInStock) {
      result = result.filter((p) => p.stock > 0);
    }

    // 5. Sorting
    if (sortBy === 'price-low') {
      result.sort((a, b) => a.price - b.price);
    } else if (sortBy === 'price-high') {
      result.sort((a, b) => b.price - a.price);
    } else if (sortBy === 'rating') {
      result.sort((a, b) => b.rating - a.rating);
    } else {
      result.sort((a, b) => (b.isTrending ? 1 : 0) - (a.isTrending ? 1 : 0));
    }

    return result;
  }, [selectedCategory, searchKeyword, maxPrice, sortBy, onlyInStock]);

  return (
    <div className="products-page fade-in">
      <div className="container">
        {/* Page Top Header */}
        <div className="catalog-header-bar">
          <div>
            <h1 className="catalog-title">All Organic Harvest</h1>
            <p className="catalog-subtitle">
              Showing <strong>{filteredProducts.length}</strong> farm-direct items
              {selectedCategory !== 'All' ? ` in "${selectedCategory}"` : ''}
            </p>
          </div>

          {/* Quick Sort Dropdown */}
          <div className="catalog-sort-box">
            <label htmlFor="sortSelect">Sort by:</label>
            <select
              id="sortSelect"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="sort-dropdown"
            >
              <option value="featured">Featured Picks</option>
              <option value="price-low">Price: Low to High</option>
              <option value="price-high">Price: High to Low</option>
              <option value="rating">Highest Purity Rating</option>
            </select>
          </div>
        </div>

        {/* Layout: Sidebar Filter + Product Grid */}
        <div className="catalog-layout">
          {/* Filters Sidebar */}
          <aside className="filter-sidebar">
            <div className="filter-sidebar-header">
              <div className="filter-title-group">
                <SlidersHorizontal size={18} />
                <h3>Filters</h3>
              </div>
              <button 
                type="button" 
                onClick={handleResetFilters} 
                className="reset-filter-btn"
                title="Reset filters"
              >
                <RotateCcw size={14} />
                <span>Reset</span>
              </button>
            </div>

            {/* Keyword Search */}
            <div className="filter-group">
              <label className="filter-label">Search Harvest</label>
              <div className="filter-search-box">
                <Search size={16} />
                <input
                  type="text"
                  placeholder="e.g. Groundnut, Honey, Ghee..."
                  value={searchKeyword}
                  onChange={(e) => setSearchKeyword(e.target.value)}
                />
              </div>
            </div>

            {/* Categories */}
            <div className="filter-group">
              <label className="filter-label">Harvest Category</label>
              <div className="category-options">
                {categories.map((cat) => (
                  <button
                    key={cat}
                    type="button"
                    className={`category-filter-btn ${selectedCategory === cat ? 'active' : ''}`}
                    onClick={() => handleCategorySelect(cat)}
                  >
                    <span>{cat}</span>
                    <span className="cat-count">
                      {cat === 'All'
                        ? products.length
                        : products.filter((p) => p.category === cat).length}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* Price Slider */}
            <div className="filter-group">
              <div className="price-slider-header">
                <label className="filter-label">Max Price</label>
                <span className="price-display-val">₹{maxPrice}</span>
              </div>
              <input
                type="range"
                min="100"
                max="1000"
                step="20"
                value={maxPrice}
                onChange={(e) => setMaxPrice(Number(e.target.value))}
                className="price-range-slider"
              />
              <div className="slider-limits">
                <span>₹100</span>
                <span>₹1,000</span>
              </div>
            </div>

            {/* Stock Filter Checkbox */}
            <div className="filter-group">
              <label className="stock-checkbox-label">
                <input
                  type="checkbox"
                  checked={onlyInStock}
                  onChange={(e) => setOnlyInStock(e.target.checked)}
                />
                <span>Only In-Stock Harvest</span>
              </label>
            </div>
          </aside>

          {/* Products Content */}
          <main className="catalog-products-content">
            {filteredProducts.length > 0 ? (
              <div className="catalog-grid">
                {filteredProducts.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            ) : (
              <div className="no-products-fallback">
                <PackageX size={48} className="empty-catalog-icon" />
                <h3>No Matching Harvest Found</h3>
                <p>Try clearing your search query or adjusting your filters.</p>
                <button 
                  type="button" 
                  onClick={handleResetFilters} 
                  className="btn btn-primary"
                >
                  Clear All Filters
                </button>
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  );
}

export default Products;
