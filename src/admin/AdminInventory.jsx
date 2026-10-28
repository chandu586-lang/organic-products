import React, { useState, useMemo } from 'react';
import { 
  Search, 
  Plus,
  PlusCircle,
  Edit2,
  Trash2,
  X,
  Upload
} from 'lucide-react';
import { useCart } from '../context/CartContext';
import {
  DEFAULT_PRODUCT_IMAGE,
  DEFAULT_STOCK_QUANTITY,
  DEFAULT_PRODUCT_DESCRIPTION,
} from '../config/constants';
import AdminLayout from './AdminLayout';
import './AdminInventory.css';

export default function AdminInventory() {
  const { productsList, addProduct, updateProduct, deleteProduct, storeSettings } = useCart();
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('all'); // all, low, out, healthy
  const [selectedCategory, setSelectedCategory] = useState('All');

  // Modals state
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [deletingProduct, setDeletingProduct] = useState(null);
  const [stockingProduct, setStockingProduct] = useState(null);
  const [addStockQuantity, setAddStockQuantity] = useState('10');

  const [addFormData, setAddFormData] = useState({
    name: '',
    category: 'Oils',
    price: '',
    originalPrice: '',
    stock: String(DEFAULT_STOCK_QUANTITY),
    image: DEFAULT_PRODUCT_IMAGE,
    description: DEFAULT_PRODUCT_DESCRIPTION
  });

  const [editFormData, setEditFormData] = useState({
    name: '',
    category: 'Oils',
    price: '',
    originalPrice: '',
    stock: '',
    image: '',
    description: ''
  });

  const lowStockThreshold = storeSettings.lowStockThreshold || 20;

  const categories = ['All', ...new Set(productsList.map(p => p.category).filter(Boolean))];
  const distinctCategories = categories.filter(c => c !== 'All');

  const filteredProducts = useMemo(() => {
    return productsList.filter(p => {
      const matchSearch = p.name?.toLowerCase().includes(search.toLowerCase()) || 
                          p.category?.toLowerCase().includes(search.toLowerCase());
      const matchCategory = selectedCategory === 'All' || p.category === selectedCategory;

      const stock = p.stock || 0;
      let matchStatus = true;
      if (filterStatus === 'low') matchStatus = stock > 0 && stock <= lowStockThreshold;
      else if (filterStatus === 'out') matchStatus = stock <= 0;
      else if (filterStatus === 'healthy') matchStatus = stock > lowStockThreshold;

      return matchSearch && matchCategory && matchStatus;
    });
  }, [productsList, search, filterStatus, selectedCategory, lowStockThreshold]);

  // Add Inventory Handlers
  const handleOpenAddModal = () => {
    setAddFormData({
      name: '',
      category: distinctCategories[0] || 'Oils',
      price: '',
      originalPrice: '',
      stock: String(DEFAULT_STOCK_QUANTITY),
      image: '',
      description: DEFAULT_PRODUCT_DESCRIPTION
    });
    setIsAddModalOpen(true);
  };

  const handleImageFileSelect = (file, mode) => {
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => {
      if (mode === 'add') {
        setAddFormData((prev) => ({ ...prev, image: reader.result }));
      } else {
        setEditFormData((prev) => ({ ...prev, image: reader.result }));
      }
    };
    reader.readAsDataURL(file);
  };

  const handleAddSubmit = (e) => {
    e.preventDefault();
    if (!addFormData.name.trim() || !addFormData.price) return;

    const stockVal = Math.max(0, parseInt(addFormData.stock, 10) || 0);
    const priceVal = Math.max(1, parseFloat(addFormData.price) || 0);
    const origPriceVal = parseFloat(addFormData.originalPrice) || priceVal;

    addProduct({
      name: addFormData.name.trim(),
      category: addFormData.category,
      price: priceVal,
      originalPrice: origPriceVal,
      stock: stockVal,
      image: addFormData.image || DEFAULT_PRODUCT_IMAGE,
      description: addFormData.description || '',
      status: 'Active'
    });

    setIsAddModalOpen(false);
  };

  // Edit Product Handlers
  const handleOpenEditModal = (prod) => {
    setEditingProduct(prod);
    setEditFormData({
      name: prod.name,
      category: prod.category,
      price: prod.price,
      originalPrice: prod.originalPrice || prod.price,
      stock: prod.stock ?? 0,
      image: prod.image || '',
      description: prod.description || ''
    });
  };

  const handleEditSubmit = (e) => {
    e.preventDefault();
    if (!editingProduct || !editFormData.name.trim() || !editFormData.price) return;

    const newStock = Math.max(0, parseInt(editFormData.stock, 10) || 0);

    updateProduct(editingProduct.id, {
      name: editFormData.name.trim(),
      category: editFormData.category,
      price: Math.max(1, parseFloat(editFormData.price) || 0),
      originalPrice: parseFloat(editFormData.originalPrice) || parseFloat(editFormData.price),
      stock: newStock,
      image: editFormData.image || editingProduct.image,
      description: editFormData.description
    });

    setEditingProduct(null);
  };

  // Delete Product Handlers
  const handleOpenDeleteModal = (prod) => {
    setDeletingProduct(prod);
  };

  const handleConfirmDelete = () => {
    if (!deletingProduct) return;

    deleteProduct(deletingProduct.id);
    setDeletingProduct(null);
  };

  // Add Stock Handlers
  const handleOpenAddStock = (prod) => {
    setStockingProduct(prod);
    setAddStockQuantity('10');
  };

  const handleConfirmAddStock = (e) => {
    e.preventDefault();
    if (!stockingProduct) return;
    const qty = parseInt(addStockQuantity, 10);
    if (isNaN(qty) || qty <= 0) return;

    const current = stockingProduct.stock || 0;
    const newStock = current + qty;
    updateProduct(stockingProduct.id, { stock: newStock });
    setStockingProduct(null);
  };

  const lowCount = productsList.filter(p => (p.stock || 0) > 0 && (p.stock || 0) <= lowStockThreshold).length;
  const outCount = productsList.filter(p => (p.stock || 0) <= 0).length;
  const healthyCount = productsList.filter(p => (p.stock || 0) > lowStockThreshold).length;

  return (
    <AdminLayout activeTab="Inventory Management">
      <div className="inventory-view">
        {/* Page Header */}
        <div className="page-head">
          <div>
            <h1 className="page-title">Inventory Management</h1>
            <p className="page-desc">Track real-time stock levels, warnings, and record farm harvest movements</p>
          </div>
          <div className="stock-kpis">
            <div className="kpi-tag healthy">
              <span className="dot"></span> Healthy: {healthyCount}
            </div>
            <div className="kpi-tag low">
              <span className="dot"></span> Low Stock: {lowCount}
            </div>
            <div className="kpi-tag out">
              <span className="dot"></span> Out of Stock: {outCount}
            </div>
          </div>
        </div>

        {/* Filter Controls: All 4 in equal size */}
        <div className="inventory-controls">
          <div className="search-wrap">
            <Search size={16} className="icon" />
            <input 
              type="text" 
              placeholder="Search product..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <button
            type="button"
            className="btn-add-inventory"
            onClick={handleOpenAddModal}
            title="Add New Inventory"
          >
            <Plus size={15} />
            <span>Add Inventory</span>
          </button>

          <select value={selectedCategory} onChange={(e) => setSelectedCategory(e.target.value)} className="select-input">
            {categories.map(c => <option key={c} value={c}>{c}</option>)}
          </select>

          <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)} className="select-input">
            <option value="all">All Inventory Status</option>
            <option value="low">Low Stock (≤ {lowStockThreshold})</option>
            <option value="out">Out of Stock</option>
            <option value="healthy">Healthy Stock</option>
          </select>
        </div>

        {/* Full-Width Inventory Table */}
        <div className="inventory-table-card">
          <div className="table-responsive">
            <table className="inv-table">
              <thead>
                <tr>
                  <th>Product</th>
                  <th>Category</th>
                  <th>Price</th>
                  <th>Available Stock</th>
                  <th>Status</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {filteredProducts.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="table-empty">No products found matching filter criteria.</td>
                  </tr>
                ) : (
                  filteredProducts.map(prod => {
                    const stock = prod.stock || 0;
                    const isLow = stock > 0 && stock <= lowStockThreshold;
                    const isOut = stock <= 0;

                    return (
                      <tr key={prod.id}>
                        <td>
                          <div className="inv-product-cell">
                            <img src={prod.image} alt={prod.name} className="inv-thumb" />
                            <div className="inv-prod-details">
                              <span className="inv-name">{prod.name}</span>
                              <span className="inv-sku">ID: #{prod.id}</span>
                            </div>
                          </div>
                        </td>
                        <td>{prod.category}</td>
                        <td className="fw-semibold">₹{prod.price}</td>
                        <td>
                          <div className="stock-number-row">
                            <span className="stock-number">{stock} units</span>
                            <button
                              type="button"
                              className="btn-stock-quick-add"
                              onClick={() => handleOpenAddStock(prod)}
                              title="Add Stock (+)"
                            >
                              <Plus size={11} />
                            </button>
                          </div>
                        </td>
                        <td>
                          <span className={`status-badge ${isOut ? 'out' : isLow ? 'low' : 'healthy'}`}>
                            {isOut ? 'Out of Stock' : isLow ? 'Low Stock' : 'In Stock'}
                          </span>
                        </td>
                        <td>
                          <div className="inv-action-buttons">
                            <button
                              type="button"
                              className="btn-inv-action add-stock"
                              onClick={() => handleOpenAddStock(prod)}
                              title="Add Stock"
                            >
                              <PlusCircle size={12} />
                              <span>Add Stock</span>
                            </button>
                            <button
                              type="button"
                              className="btn-inv-action edit"
                              onClick={() => handleOpenEditModal(prod)}
                              title="Edit Product"
                            >
                              <Edit2 size={12} />
                              <span>Edit</span>
                            </button>
                            <button
                              type="button"
                              className="btn-inv-action delete"
                              onClick={() => handleOpenDeleteModal(prod)}
                              title="Delete Product"
                            >
                              <Trash2 size={12} />
                              <span>Delete</span>
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Modal 1: Add Inventory */}
        {isAddModalOpen && (
          <div className="inv-modal-backdrop">
            <div className="inv-modal-dialog">
              <div className="inv-modal-header">
                <div>
                  <h3 className="inv-modal-title">Add New Inventory</h3>
                  <p className="inv-modal-desc">Add a new organic harvest to inventory tracking and storefront catalog</p>
                </div>
                <button type="button" onClick={() => setIsAddModalOpen(false)} className="inv-close-btn">
                  <X size={18} />
                </button>
              </div>

              <form onSubmit={handleAddSubmit} className="inv-modal-form">
                <div className="form-group">
                  <label>Product Name *</label>
                  <input
                    type="text"
                    required
                    value={addFormData.name}
                    onChange={(e) => setAddFormData({ ...addFormData, name: e.target.value })}
                    placeholder="e.g. Pure Wood-Pressed Gingelly Oil"
                  />
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>Category *</label>
                    <select
                      value={addFormData.category}
                      onChange={(e) => setAddFormData({ ...addFormData, category: e.target.value })}
                    >
                      {distinctCategories.map(c => (
                        <option key={c} value={c}>{c}</option>
                      ))}
                    </select>
                  </div>

                  <div className="form-group">
                    <label>Initial Stock Quantity (Units) *</label>
                    <input
                      type="number"
                      required
                      min="0"
                      value={addFormData.stock}
                      onChange={(e) => setAddFormData({ ...addFormData, stock: e.target.value })}
                      placeholder="e.g. 50"
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
                      value={addFormData.price}
                      onChange={(e) => setAddFormData({ ...addFormData, price: e.target.value })}
                      placeholder="e.g. 399"
                    />
                  </div>

                  <div className="form-group">
                    <label>Original MRP (₹)</label>
                    <input
                      type="number"
                      min="1"
                      value={addFormData.originalPrice}
                      onChange={(e) => setAddFormData({ ...addFormData, originalPrice: e.target.value })}
                      placeholder="e.g. 499"
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label>Product Image</label>
                  <div className="inv-image-upload-box">
                    {addFormData.image && (
                      <div className="inv-image-preview">
                        <img src={addFormData.image} alt="Preview" />
                        <button
                          type="button"
                          className="btn-inv-remove-img"
                          onClick={() => setAddFormData({ ...addFormData, image: '' })}
                        >
                          Remove
                        </button>
                      </div>
                    )}
                    <label className="inv-image-upload-label">
                      <Upload size={15} />
                      <span>{addFormData.image ? 'Change Image' : 'Upload Product Image'}</span>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => handleImageFileSelect(e.target.files?.[0], 'add')}
                        className="inv-image-file-input"
                      />
                    </label>
                  </div>
                </div>

                <div className="form-group">
                  <label>Product Description</label>
                  <textarea
                    rows="3"
                    value={addFormData.description}
                    onChange={(e) => setAddFormData({ ...addFormData, description: e.target.value })}
                    placeholder="Brief description of the organic harvest..."
                  />
                </div>

                <div className="inv-modal-footer">
                  <button type="button" onClick={() => setIsAddModalOpen(false)} className="btn-modal-cancel">
                    Cancel
                  </button>
                  <button type="submit" className="btn-modal-submit">
                    Add Inventory
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Modal 2: Edit Product */}
        {editingProduct && (
          <div className="inv-modal-backdrop">
            <div className="inv-modal-dialog">
              <div className="inv-modal-header">
                <div>
                  <h3 className="inv-modal-title">Edit Product Details & Stock</h3>
                  <p className="inv-modal-desc">Update product name, category, pricing, and available stock</p>
                </div>
                <button type="button" onClick={() => setEditingProduct(null)} className="inv-close-btn">
                  <X size={18} />
                </button>
              </div>

              <form onSubmit={handleEditSubmit} className="inv-modal-form">
                <div className="form-group">
                  <label>Product Name *</label>
                  <input
                    type="text"
                    required
                    value={editFormData.name}
                    onChange={(e) => setEditFormData({ ...editFormData, name: e.target.value })}
                  />
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>Category *</label>
                    <select
                      value={editFormData.category}
                      onChange={(e) => setEditFormData({ ...editFormData, category: e.target.value })}
                    >
                      {distinctCategories.map(c => (
                        <option key={c} value={c}>{c}</option>
                      ))}
                    </select>
                  </div>

                  <div className="form-group">
                    <label>Available Stock (Units) *</label>
                    <input
                      type="number"
                      required
                      min="0"
                      value={editFormData.stock}
                      onChange={(e) => setEditFormData({ ...editFormData, stock: e.target.value })}
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
                      value={editFormData.price}
                      onChange={(e) => setEditFormData({ ...editFormData, price: e.target.value })}
                    />
                  </div>

                  <div className="form-group">
                    <label>Original MRP (₹)</label>
                    <input
                      type="number"
                      min="1"
                      value={editFormData.originalPrice}
                      onChange={(e) => setEditFormData({ ...editFormData, originalPrice: e.target.value })}
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label>Product Image</label>
                  <div className="inv-image-upload-box">
                    {editFormData.image && (
                      <div className="inv-image-preview">
                        <img src={editFormData.image} alt="Preview" />
                        <button
                          type="button"
                          className="btn-inv-remove-img"
                          onClick={() => setEditFormData({ ...editFormData, image: '' })}
                        >
                          Remove
                        </button>
                      </div>
                    )}
                    <label className="inv-image-upload-label">
                      <Upload size={15} />
                      <span>{editFormData.image ? 'Change Image' : 'Upload Product Image'}</span>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => handleImageFileSelect(e.target.files?.[0], 'edit')}
                        className="inv-image-file-input"
                      />
                    </label>
                  </div>
                </div>

                <div className="form-group">
                  <label>Product Description</label>
                  <textarea
                    rows="3"
                    value={editFormData.description}
                    onChange={(e) => setEditFormData({ ...editFormData, description: e.target.value })}
                  />
                </div>

                <div className="inv-modal-footer">
                  <button type="button" onClick={() => setEditingProduct(null)} className="btn-modal-cancel">
                    Cancel
                  </button>
                  <button type="submit" className="btn-modal-submit">
                    Save Changes
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Modal: Add Stock / Restock */}
        {stockingProduct && (
          <div className="inv-modal-backdrop">
            <div className="inv-modal-dialog stock-modal-dialog">
              <div className="inv-modal-header">
                <div>
                  <h3 className="inv-modal-title">Add Stock / Restock</h3>
                  <p className="inv-modal-desc">Quickly replenish units for this organic harvest</p>
                </div>
                <button type="button" onClick={() => setStockingProduct(null)} className="inv-close-btn">
                  <X size={18} />
                </button>
              </div>

              <form onSubmit={handleConfirmAddStock} className="inv-modal-form">
                <div className="stock-modal-product-summary">
                  <img src={stockingProduct.image} alt={stockingProduct.name} className="stock-summary-thumb" />
                  <div className="stock-summary-info">
                    <span className="stock-summary-name">{stockingProduct.name}</span>
                    <span className="stock-summary-category">{stockingProduct.category} • Current Stock: <strong>{stockingProduct.stock || 0} units</strong></span>
                  </div>
                </div>

                <div className="form-group">
                  <label>Units to Add *</label>
                  <input
                    type="number"
                    required
                    min="1"
                    value={addStockQuantity}
                    onChange={(e) => setAddStockQuantity(e.target.value)}
                    placeholder="e.g. 20"
                    autoFocus
                  />
                </div>

                <div className="quick-qty-pills">
                  <span className="quick-qty-label">Quick add:</span>
                  {[5, 10, 20, 50, 100].map(amt => (
                    <button
                      key={amt}
                      type="button"
                      className="btn-qty-pill"
                      onClick={() => setAddStockQuantity(String(amt))}
                    >
                      +{amt}
                    </button>
                  ))}
                </div>

                <div className="stock-calculation-preview">
                  <span>Current: <strong>{stockingProduct.stock || 0}</strong></span>
                  <span className="math-sign">+</span>
                  <span>Adding: <strong>{parseInt(addStockQuantity, 10) || 0}</strong></span>
                  <span className="math-sign">=</span>
                  <span className="new-total-highlight">
                    New Stock: <strong>{(stockingProduct.stock || 0) + (parseInt(addStockQuantity, 10) || 0)} units</strong>
                  </span>
                </div>

                <div className="inv-modal-footer">
                  <button type="button" onClick={() => setStockingProduct(null)} className="btn-modal-cancel">
                    Cancel
                  </button>
                  <button type="submit" className="btn-modal-submit">
                    Add to Stock
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Modal 3: Delete Product Confirmation Dialog */}
        {deletingProduct && (
          <div className="inv-modal-backdrop">
            <div className="inv-modal-dialog delete-dialog-box">
              <div className="delete-icon-wrapper">
                <Trash2 size={24} />
              </div>
              <h3 className="delete-dialog-title">Delete Product?</h3>
              <p className="delete-dialog-desc">
                Are you sure you want to permanently delete <strong>"{deletingProduct.name}"</strong> (ID: #{deletingProduct.id}) from inventory? This action cannot be undone.
              </p>
              <div className="inv-modal-footer delete-footer">
                <button type="button" onClick={() => setDeletingProduct(null)} className="btn-modal-cancel">
                  Keep Product
                </button>
                <button type="button" onClick={handleConfirmDelete} className="btn-modal-delete">
                  Yes, Delete
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}


