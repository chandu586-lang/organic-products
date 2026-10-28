import React, { useState, useMemo } from 'react';
import { 
  Package, 
  Plus, 
  Search, 
  Filter, 
  Edit, 
  Trash2, 
  AlertTriangle, 
  Check, 
  X, 
  Eye,
  RotateCcw,
  Upload
} from 'lucide-react';
import { useCart } from '../context/CartContext';
import {
  DEFAULT_PRODUCT_IMAGE,
  DEFAULT_STOCK_QUANTITY,
  DEFAULT_PRODUCT_DESCRIPTION,
  DEFAULT_PRODUCT_INGREDIENTS,
} from '../config/constants';
import AdminLayout from './AdminLayout';
import './AdminProducts.css';

export default function AdminProducts() {
  const { productsList, addProduct, updateProduct, deleteProduct, categories, storeSettings } = useCart();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [stockFilter, setStockFilter] = useState('all'); // 'all' | 'low' | 'out'
  const [modalMode, setModalMode] = useState(null); // null | 'add' | 'edit' | 'delete'
  const [currentProduct, setCurrentProduct] = useState(null);

  const lowStockThreshold = storeSettings.lowStockThreshold || 20;

  // Form State for Add / Edit
  const [formData, setFormData] = useState({
    name: '',
    category: 'Cold-Pressed Oils',
    price: '',
    originalPrice: '',
    stock: '',
    image: '',
    description: '',
    ingredients: '',
    status: 'Active'
  });

  const handleOpenAdd = () => {
    setFormData({
      name: '',
      category: categories[1] || 'Cold-Pressed Oils',
      price: '',
      originalPrice: '',
      stock: String(DEFAULT_STOCK_QUANTITY),
      image: '',
      description: DEFAULT_PRODUCT_DESCRIPTION,
      ingredients: DEFAULT_PRODUCT_INGREDIENTS,
      status: 'Active'
    });
    setModalMode('add');
  };

  const handleImageUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => {
      setFormData((prev) => ({ ...prev, image: reader.result }));
    };
    reader.readAsDataURL(file);
  };

  const handleOpenEdit = (prod) => {
    setCurrentProduct(prod);
    setFormData({
      name: prod.name,
      category: prod.category,
      price: prod.price,
      originalPrice: prod.originalPrice || prod.price,
      stock: prod.stock,
      image: prod.image,
      description: prod.description || '',
      ingredients: prod.ingredients || '',
      status: prod.status || 'Active'
    });
    setModalMode('edit');
  };

  const handleOpenDelete = (prod) => {
    setCurrentProduct(prod);
    setModalMode('delete');
  };

  const handleFormSubmit = (e) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.price) return;

    if (modalMode === 'add') {
      addProduct({
        name: formData.name,
        category: formData.category,
        price: Number(formData.price),
        originalPrice: Number(formData.originalPrice) || Number(formData.price),
        stock: Number(formData.stock) || 0,
        image: formData.image || DEFAULT_PRODUCT_IMAGE,
        description: formData.description,
        ingredients: formData.ingredients,
        status: formData.status
      });
    } else if (modalMode === 'edit' && currentProduct) {
      updateProduct(currentProduct.id, {
        name: formData.name,
        category: formData.category,
        price: Number(formData.price),
        originalPrice: Number(formData.originalPrice) || Number(formData.price),
        stock: Number(formData.stock) || 0,
        image: formData.image,
        description: formData.description,
        ingredients: formData.ingredients,
        status: formData.status
      });
    }

    setModalMode(null);
  };

  const confirmDelete = () => {
    if (currentProduct) {
      deleteProduct(currentProduct.id);
      setModalMode(null);
    }
  };

  // Filtered Products
  const filtered = useMemo(() => {
    return productsList.filter((prod) => {
      // 1. Category
      if (selectedCategory !== 'All' && prod.category !== selectedCategory) {
        return false;
      }
      // 2. Search
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchName = prod.name?.toLowerCase().includes(q);
        const matchCat = prod.category?.toLowerCase().includes(q);
        if (!matchName && !matchCat) return false;
      }
      // 3. Stock Filter
      if (stockFilter === 'low') {
        return (prod.stock || 0) <= lowStockThreshold && (prod.stock || 0) > 0;
      }
      if (stockFilter === 'out') {
        return (prod.stock || 0) <= 0;
      }
      return true;
    });
  }, [productsList, selectedCategory, searchQuery, stockFilter, lowStockThreshold]);

  return (
    <AdminLayout activeTab="Product Management">
      <div className="admin-products-view">
        {/* Top Header */}
        <div className="admin-page-header">
          <div>
            <h2>Products & Stock Inventory</h2>
            <p>Manage product catalog, pricing, SKU variants, and live inventory thresholds</p>
          </div>
          <button type="button" onClick={handleOpenAdd} className="btn-add-harvest">
            <Plus size={16} />
            <span>Add New Product</span>
          </button>
        </div>

        {/* Filters & Search Bar */}
        <div className="inventory-filter-bar">
          <div className="search-box">
            <Search size={16} />
            <input
              type="text"
              placeholder="Search product name, category, SKU..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <div className="filter-controls">
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="admin-select"
            >
              {categories.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>

            <select
              value={stockFilter}
              onChange={(e) => setStockFilter(e.target.value)}
              className="admin-select"
            >
              <option value="all">All Stock Status</option>
              <option value="low">Low Stock (≤ {lowStockThreshold})</option>
              <option value="out">Out of Stock (0)</option>
            </select>

            {(searchQuery || selectedCategory !== 'All' || stockFilter !== 'all') && (
              <button
                type="button"
                onClick={() => {
                  setSearchQuery('');
                  setSelectedCategory('All');
                  setStockFilter('all');
                }}
                className="btn-reset-filters"
                title="Reset filters"
              >
                <RotateCcw size={14} />
              </button>
            )}
          </div>
        </div>

        {/* Products Table Card */}
        <div className="admin-card products-table-card">
          <div className="table-responsive">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Product Details</th>
                  <th>Category</th>
                  <th>Price & MRP</th>
                  <th>Stock Available</th>
                  <th>Status</th>
                  <th style={{ textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((prod) => {
                  const isLow = (prod.stock || 0) <= lowStockThreshold;
                  const isOut = (prod.stock || 0) <= 0;
                  return (
                    <tr key={prod.id}>
                      <td>
                        <div className="product-table-cell">
                          <img src={prod.image} alt={prod.name} className="prod-cell-thumb" />
                          <div>
                            <span className="prod-cell-name">{prod.name}</span>
                            <span className="prod-cell-id">ID: #{prod.id}</span>
                          </div>
                        </div>
                      </td>
                      <td>
                        <span className="category-pill">{prod.category}</span>
                      </td>
                      <td>
                        <div className="price-cell">
                          <span className="current-price">₹{prod.price}</span>
                          {prod.originalPrice > prod.price && (
                            <span className="original-price">₹{prod.originalPrice}</span>
                          )}
                        </div>
                      </td>
                      <td>
                        <div className="stock-cell">
                          <span className={`stock-number ${isOut ? 'out' : isLow ? 'low' : 'good'}`}>
                            {prod.stock} units
                          </span>
                          {isOut && <span className="stock-tag out">Out of Stock</span>}
                          {!isOut && isLow && (
                            <span className="stock-tag low">
                              <AlertTriangle size={11} /> Low Stock
                            </span>
                          )}
                        </div>
                      </td>
                      <td>
                        <button
                          type="button"
                          onClick={() =>
                            updateProduct(prod.id, {
                              status: (prod.status || 'Active') === 'Active' ? 'Inactive' : 'Active'
                            })
                          }
                          className={`status-toggle-btn ${(prod.status || 'Active').toLowerCase()}`}
                          title="Click to toggle status"
                        >
                          <span className="status-dot"></span>
                          <span>{prod.status || 'Active'}</span>
                        </button>
                      </td>
                      <td>
                        <div className="action-buttons-cell">
                          <button
                            type="button"
                            onClick={() => handleOpenEdit(prod)}
                            className="btn-action edit"
                            title="Edit Product"
                          >
                            <Edit size={14} />
                            <span>Edit</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => handleOpenDelete(prod)}
                            className="btn-action delete"
                            title="Delete Product"
                          >
                            <Trash2 size={14} />
                            <span>Delete</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Modal: Add / Edit Product */}
        {(modalMode === 'add' || modalMode === 'edit') && (
          <div className="modal-backdrop">
            <div className="modal-dialog">
              <div className="modal-header">
                <h3>{modalMode === 'add' ? 'Add New Product' : 'Edit Product'}</h3>
                <button type="button" onClick={() => setModalMode(null)} className="close-btn">
                  <X size={18} />
                </button>
              </div>

              <form onSubmit={handleFormSubmit} className="modal-form">
                <div className="form-group">
                  <label>Product Name *</label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="e.g. Traditional Wood-Pressed Groundnut Oil"
                  />
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>Harvest Category *</label>
                    <select
                      value={formData.category}
                      onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    >
                      {categories.filter((c) => c !== 'All').map((c) => (
                        <option key={c} value={c}>
                          {c}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="form-group">
                    <label>Stock Available (Units) *</label>
                    <input
                      type="number"
                      required
                      min="0"
                      value={formData.stock}
                      onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
                    />
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>Selling Price (₹) *</label>
                    <input
                      type="number"
                      required
                      min="1"
                      value={formData.price}
                      onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                    />
                  </div>

                  <div className="form-group">
                    <label>Original MRP (₹)</label>
                    <input
                      type="number"
                      min="1"
                      value={formData.originalPrice}
                      onChange={(e) => setFormData({ ...formData, originalPrice: e.target.value })}
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label>Product Image</label>
                  <div className="image-upload-box">
                    {formData.image && (
                      <div className="image-upload-preview">
                        <img src={formData.image} alt="Product preview" />
                        <button
                          type="button"
                          className="btn-remove-image"
                          onClick={() => setFormData({ ...formData, image: '' })}
                        >
                          Remove
                        </button>
                      </div>
                    )}
                    <label className="image-upload-label">
                      <Upload size={16} />
                      <span>{formData.image ? 'Change Image' : 'Upload Product Image'}</span>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageUpload}
                        className="image-file-input"
                      />
                    </label>
                  </div>
                </div>

                <div className="form-group">
                  <label>Description</label>
                  <textarea
                    rows="3"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  />
                </div>

                <div className="modal-footer">
                  <button type="button" onClick={() => setModalMode(null)} className="btn-cancel">
                    Cancel
                  </button>
                  <button type="submit" className="btn-save">
                    {modalMode === 'add' ? 'Create Product' : 'Save Changes'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Modal: Delete Confirmation */}
        {modalMode === 'delete' && currentProduct && (
          <div className="modal-backdrop">
            <div className="modal-dialog delete-dialog">
              <div className="delete-icon-box">
                <Trash2 size={28} />
              </div>
              <h3>Remove from Inventory?</h3>
              <p>
                Are you sure you want to remove <strong>"{currentProduct.name}"</strong>? This will delete the SKU from the storefront.
              </p>
              <div className="modal-footer">
                <button type="button" onClick={() => setModalMode(null)} className="btn-cancel">
                  Keep Product
                </button>
                <button type="button" onClick={confirmDelete} className="btn-confirm-delete">
                  Yes, Remove
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
