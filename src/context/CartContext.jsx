import React, { createContext, useContext, useState, useEffect } from 'react';
import { products as initialProducts, promoCodes, categories as defaultCategories } from '../data/products';
import { initialOrders, initialCustomers, initialSettings } from '../data/adminData';
import { authAPI, productAPI } from '../services/api';

const CartContext = createContext();

export function CartProvider({ children }) {
  // Products Management
  const [productsList, setProductsList] = useState(() => {
    try {
      const saved = localStorage.getItem('naturenest_products');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
      return initialProducts;
    } catch {
      return initialProducts;
    }
  });

  // Orders Management (Initialized to empty [] so Revenue = 0, Orders = 0)
  const [ordersList, setOrdersList] = useState(() => {
    try {
      const saved = localStorage.getItem('naturenest_orders');
      return saved ? JSON.parse(saved) : initialOrders;
    } catch {
      return [];
    }
  });

  // Customers Management (Initialized to empty [] so Registered Customers = 0)
  const [customersList, setCustomersList] = useState(() => {
    try {
      const saved = localStorage.getItem('naturenest_customers');
      return saved ? JSON.parse(saved) : initialCustomers;
    } catch {
      return [];
    }
  });

  // Store & Gateway Settings
  const [storeSettings, setStoreSettings] = useState(() => {
    try {
      const saved = localStorage.getItem('naturenest_settings');
      return saved ? JSON.parse(saved) : initialSettings;
    } catch {
      return initialSettings;
    }
  });

  // Load saved cart from localStorage
  const [cartItems, setCartItems] = useState(() => {
    try {
      const saved = localStorage.getItem('msv_organic_cart');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // Load saved user from localStorage ONLY if a valid JWT token exists
  const [currentUser, setCurrentUser] = useState(() => {
    try {
      const token = localStorage.getItem('msv_organic_token');
      const saved = localStorage.getItem('msv_organic_user');
      if (!token || !saved) {
        localStorage.removeItem('msv_organic_user');
        localStorage.removeItem('msv_organic_token');
        return null;
      }
      return JSON.parse(saved);
    } catch {
      return null;
    }
  });
  const [authLoading, setAuthLoading] = useState(true);

  const [appliedPromo, setAppliedPromo] = useState(null);
  const [promoError, setPromoError] = useState('');
  const [toastMessage, setToastMessage] = useState('');

  // Persist Products
  useEffect(() => {
    try {
      localStorage.setItem('naturenest_products', JSON.stringify(productsList));
    } catch (e) {
      console.warn("Storage error", e);
    }
  }, [productsList]);

  // Persist Orders
  useEffect(() => {
    try {
      localStorage.setItem('naturenest_orders', JSON.stringify(ordersList));
    } catch (e) {
      console.warn("Storage error", e);
    }
  }, [ordersList]);

  // Persist Customers
  useEffect(() => {
    try {
      localStorage.setItem('naturenest_customers', JSON.stringify(customersList));
    } catch (e) {
      console.warn("Storage error", e);
    }
  }, [customersList]);

  // Persist Settings
  useEffect(() => {
    try {
      localStorage.setItem('naturenest_settings', JSON.stringify(storeSettings));
    } catch (e) {
      console.warn("Storage error", e);
    }
  }, [storeSettings]);

  // Persist Cart
  useEffect(() => {
    try {
      localStorage.setItem('msv_organic_cart', JSON.stringify(cartItems));
    } catch (e) {
      console.warn("Storage error", e);
    }
  }, [cartItems]);

  // Persist User
  useEffect(() => {
    try {
      if (currentUser && localStorage.getItem('msv_organic_token')) {
        localStorage.setItem('msv_organic_user', JSON.stringify(currentUser));
      } else if (!currentUser) {
        localStorage.removeItem('msv_organic_user');
      }
    } catch (e) {
      console.warn("User storage error", e);
    }
  }, [currentUser]);

  // Verify customer session token against backend database on mount
  useEffect(() => {
    const token = localStorage.getItem('msv_organic_token');
    if (!token) {
      setCurrentUser(null);
      localStorage.removeItem('msv_organic_user');
      setAuthLoading(false);
      return;
    }

    authAPI
      .getCustomerMe(token)
      .then((res) => {
        if (res && res.user) {
          setCurrentUser(res.user);
          if (res.user.role !== 'admin' && res.user.role !== 'worker') {
            setAdminUser(null);
            localStorage.removeItem('naturenest_admin_user');
            localStorage.removeItem('naturenest_token');
          }
        } else {
          setCurrentUser(null);
          localStorage.removeItem('msv_organic_user');
          localStorage.removeItem('msv_organic_token');
        }
      })
      .catch(() => {
        setCurrentUser(null);
        localStorage.removeItem('msv_organic_user');
        localStorage.removeItem('msv_organic_token');
      })
      .finally(() => {
        setAuthLoading(false);
      });
  }, []);

  // Admin / Worker Session Management (Guard against direct access)
  const [adminUser, setAdminUser] = useState(() => {
    try {
      const saved = localStorage.getItem('naturenest_admin_user');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  // Persist Admin User
  useEffect(() => {
    try {
      if (adminUser) {
        localStorage.setItem('naturenest_admin_user', JSON.stringify(adminUser));
      } else {
        localStorage.removeItem('naturenest_admin_user');
      }
    } catch (e) {
      console.warn("Admin user storage error", e);
    }
  }, [adminUser]);

  // ── Login: calls real Node.js backend API ────────────────────
  const loginAdmin = async ({ email, password }) => {
    try {
      const data = await authAPI.login(email, password);
      const u = data.user;
      if (u.role !== 'admin' && u.role !== 'worker') {
        return { success: false, error: 'Authorized staff & admin personnel only.' };
      }
      // Save JWT token to localStorage
      localStorage.setItem('naturenest_token', data.token);
      const user = {
        id:     u.id,
        name:   u.name,
        email:  u.email,
        role:   u.role === 'admin' ? 'Store Administrator' : 'Inventory Worker',
        avatar: u.role === 'admin' ? '🛡️' : '🌾',
      };
      setAdminUser(user);
      triggerToast(`Welcome back, ${user.name}! Access granted.`);
      return { success: true, user };
    } catch (err) {
      return { success: false, error: err.message || 'Invalid credentials. Please try again.' };
    }
  };

  const logoutAdmin = () => {
    setAdminUser(null);
    setCurrentUser(null);
    localStorage.removeItem('naturenest_admin_user');
    localStorage.removeItem('naturenest_token');
    localStorage.removeItem('msv_organic_user');
    localStorage.removeItem('msv_organic_token');
    triggerToast('Logged out of Admin Portal.');
  };

  const triggerToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 3000);
  };

  /**
   * Add Product to Cart with specific quantity
   */
  const addToCart = (product, quantity = 1) => {
    if (!product) return;
    const addQty = Math.max(1, parseInt(quantity) || 1);

    setCartItems((prevItems) => {
      const existingIndex = prevItems.findIndex((item) => item.id === product.id);
      if (existingIndex > -1) {
        const updated = [...prevItems];
        updated[existingIndex] = {
          ...updated[existingIndex],
          quantity: updated[existingIndex].quantity + addQty
        };
        return updated;
      }
      return [...prevItems, { ...product, quantity: addQty }];
    });

    triggerToast(`Added ${product.name} (${addQty}) to basket! 🌿`);
  };

  /**
   * Update Quantity (increment or decrement)
   */
  const updateQuantity = (productId, delta) => {
    setCartItems((prevItems) => {
      return prevItems
        .map((item) => {
          if (item.id === productId) {
            const newQty = item.quantity + delta;
            return newQty > 0 ? { ...item, quantity: newQty } : null;
          }
          return item;
        })
        .filter(Boolean);
    });
  };

  /**
   * Remove item from cart
   */
  const removeFromCart = (productId) => {
    setCartItems((prevItems) => prevItems.filter((item) => item.id !== productId));
    triggerToast("Item removed from basket.");
  };

  /**
   * Clear entire cart
   */
  const clearCart = () => {
    setCartItems([]);
    setAppliedPromo(null);
  };

  /**
   * Apply Promo Voucher
   */
  const applyPromoCode = (code) => {
    const clean = (code || '').trim().toUpperCase();
    if (!clean) {
      setPromoError('Please enter a voucher code.');
      return false;
    }
    if (promoCodes[clean]) {
      setAppliedPromo({
        code: clean,
        rate: promoCodes[clean]
      });
      setPromoError('');
      triggerToast(`Promo code "${clean}" applied successfully! 🎉`);
      return true;
    } else {
      setPromoError('Invalid promo code. Try ORGANIC10 or PURE20.');
      return false;
    }
  };

  const removePromoCode = () => {
    setAppliedPromo(null);
    setPromoError('');
    triggerToast('Coupon removed.');
  };

  // User Auth Actions (connected to backend database via JWT)
  const registerUser = async ({ name, email, password }) => {
    try {
      const data = await authAPI.signup(name, email, password);
      return { success: true, user: data.user, token: data.token };
    } catch (err) {
      return { success: false, error: err.message || 'Registration failed. Please try again.' };
    }
  };

  const loginUser = async ({ email, password }) => {
    try {
      const data = await authAPI.login(email, password);
      localStorage.setItem('msv_organic_token', data.token);
      localStorage.setItem('msv_organic_user', JSON.stringify(data.user));
      setCurrentUser(data.user);

      if (data.user.role === 'admin' || data.user.role === 'worker') {
        localStorage.setItem('naturenest_token', data.token);
        const staffUser = {
          id:     data.user.id,
          name:   data.user.name,
          email:  data.user.email,
          role:   data.user.role === 'admin' ? 'Store Administrator' : 'Inventory Worker',
          avatar: data.user.role === 'admin' ? '🛡️' : '🌾',
        };
        setAdminUser(staffUser);
      } else {
        setAdminUser(null);
        localStorage.removeItem('naturenest_admin_user');
        localStorage.removeItem('naturenest_token');
      }

      triggerToast(`Welcome back, ${data.user.name}! 🌿`);
      return { success: true, user: data.user };
    } catch (err) {
      return { success: false, error: err.message || 'Invalid email or password.' };
    }
  };

  const logoutUser = () => {
    setCurrentUser(null);
    setAdminUser(null);
    localStorage.removeItem('msv_organic_user');
    localStorage.removeItem('msv_organic_token');
    localStorage.removeItem('naturenest_admin_user');
    localStorage.removeItem('naturenest_token');
    triggerToast("Logged out successfully.");
  };

  // ================= ADMIN ACTIONS ================= //

  /**
   * Product Management
   */
  const addProduct = (newProduct) => {
    const id = Date.now();
    const productWithDefaults = {
      ...newProduct,
      id,
      rating: newProduct.rating || 5.0,
      reviewCount: 0,
      stock: Number(newProduct.stock) || 0,
      price: Number(newProduct.price) || 0,
      originalPrice: Number(newProduct.originalPrice) || Number(newProduct.price),
      discountPercent: newProduct.originalPrice && newProduct.originalPrice > newProduct.price
        ? Math.round(((newProduct.originalPrice - newProduct.price) / newProduct.originalPrice) * 100)
        : 0,
      status: newProduct.status || 'Active',
      images: newProduct.images || [newProduct.image]
    };
    setProductsList((prev) => [productWithDefaults, ...prev]);

    // Persist new product & uploaded image to PostgreSQL database
    productAPI
      .create({
        name: productWithDefaults.name,
        category: productWithDefaults.category,
        price: productWithDefaults.price,
        description: productWithDefaults.description || '',
        image_url: productWithDefaults.image || '',
        stock_qty: productWithDefaults.stock,
      })
      .then((res) => {
        if (res?.product?.id) {
          setProductsList((prev) =>
            prev.map((item) => (item.id === id ? { ...item, dbId: res.product.id } : item))
          );
        }
      })
      .catch((err) => console.warn('DB sync warning (createProduct):', err.message));

    triggerToast(`Product "${newProduct.name}" added successfully! ✨`);
    return productWithDefaults;
  };

  const updateProduct = (id, updatedFields) => {
    let targetItem = null;
    setProductsList((prev) =>
      prev.map((item) => {
        if (item.id === id) {
          targetItem = {
            ...item,
            ...updatedFields,
            ...(updatedFields.image ? { images: [updatedFields.image] } : {}),
          };
          return targetItem;
        }
        return item;
      })
    );

    // Sync updated product & image to PostgreSQL database
    const dbTargetId = targetItem?.dbId || id;
    productAPI
      .update(dbTargetId, {
        name: updatedFields.name ?? targetItem?.name,
        category: updatedFields.category ?? targetItem?.category,
        price: updatedFields.price ?? targetItem?.price,
        description: updatedFields.description ?? targetItem?.description,
        image_url: updatedFields.image ?? targetItem?.image,
        stock: updatedFields.stock ?? targetItem?.stock,
        status: updatedFields.status ?? targetItem?.status,
      })
      .catch((err) => console.warn('DB sync warning (updateProduct):', err.message));

    triggerToast(`Product updated successfully! 💾`);
  };

  const deleteProduct = (id) => {
    const targetItem = productsList.find((item) => item.id === id);
    setProductsList((prev) => prev.filter((item) => item.id !== id));

    const dbTargetId = targetItem?.dbId || id;
    productAPI
      .delete(dbTargetId)
      .catch((err) => console.warn('DB sync warning (deleteProduct):', err.message));

    triggerToast(`Product removed from catalog.`);
  };

  /**
   * Order Management
   */
  const placeOrder = (orderData) => {
    const newOrder = {
      ...orderData,
      id: `MSV-ORD-${Math.floor(1000 + Math.random() * 9000)}`,
      orderNumber: `MSV-${Math.floor(1000 + Math.random() * 9000)}`,
      createdAt: new Date().toISOString(),
      delivery: {
        status: "Processing",
        carrier: "BlueDart Express",
        awbNumber: `BD-${Math.floor(100000000 + Math.random() * 900000000)}IN`,
        estimatedDelivery: "In 2-3 business days",
        deliveryExecutive: "Assigned upon dispatch",
        liveLocation: "Salem Farm Extraction Facility, Tamil Nadu",
        ...(orderData.delivery || {})
      }
    };

    setOrdersList((prev) => [newOrder, ...prev]);

    // Update customer stats or add new customer
    setCustomersList((prev) => {
      const existing = prev.find(
        (c) => c.email.toLowerCase() === orderData.customer.email.toLowerCase()
      );
      if (existing) {
        return prev.map((c) =>
          c.id === existing.id
            ? {
                ...c,
                ordersCount: c.ordersCount + 1,
                totalSpent: c.totalSpent + orderData.pricing.total,
                phone: orderData.customer.phone || c.phone,
                city: orderData.customer.city || c.city
              }
            : c
        );
      } else {
        return [
          {
            id: `cust-${Date.now()}`,
            name: orderData.customer.fullName || orderData.customer.name,
            email: orderData.customer.email,
            phone: orderData.customer.phone,
            city: orderData.customer.city,
            state: orderData.customer.state || 'Tamil Nadu',
            ordersCount: 1,
            totalSpent: orderData.pricing.total,
            memberSince: "Just now"
          },
          ...prev
        ];
      }
    });

    clearCart();
    return newOrder;
  };

  const updateOrderStatus = (orderId, newStatus) => {
    setOrdersList((prev) =>
      prev.map((ord) => {
        if (ord.id === orderId) {
          return {
            ...ord,
            delivery: {
              ...ord.delivery,
              status: newStatus
            }
          };
        }
        return ord;
      })
    );
    triggerToast(`Order ${orderId} marked as ${newStatus}! 🚚`);
  };

  /**
   * Settings Management
   */
  const updateSettings = (newSettings) => {
    setStoreSettings((prev) => ({ ...prev, ...newSettings }));
    triggerToast(`Settings saved successfully! ⚙️`);
  };

  // Compute live Totals
  const totalCount = cartItems.reduce((acc, item) => acc + item.quantity, 0);
  const subtotal = cartItems.reduce((acc, item) => acc + (item.price * item.quantity), 0);

  let discount = 0;
  let isFreeShipping = subtotal >= (storeSettings.freeShippingThreshold || 500);

  if (appliedPromo) {
    if (typeof appliedPromo.rate === 'number') {
      discount = subtotal * appliedPromo.rate;
    } else if (appliedPromo.rate === 'FREE_SHIPPING') {
      isFreeShipping = true;
    }
  }

  const shipping = subtotal > 0 && !isFreeShipping ? (storeSettings.standardShippingFee || 50) : 0;
  const tax = subtotal * ((storeSettings.gstRate || 5) / 100);
  const grandTotal = Math.max(0, subtotal - discount + shipping + tax);

  const totals = {
    totalCount,
    subtotal,
    discount,
    shipping,
    tax,
    grandTotal,
    isFreeShipping
  };

  return (
    <CartContext.Provider
      value={{
        // Storefront Cart
        cartItems,
        addToCart,
        updateQuantity,
        removeFromCart,
        clearCart,
        appliedPromo,
        promoError,
        applyPromoCode,
        removePromoCode,
        totals,
        currentUser,
        authLoading,
        registerUser,
        loginUser,
        logoutUser,
        toastMessage,

        // Admin & Worker Auth
        adminUser,
        loginAdmin,
        logoutAdmin,

        // Admin State & Actions
        productsList,
        categories: defaultCategories,
        addProduct,
        updateProduct,
        deleteProduct,
        ordersList,
        placeOrder,
        updateOrderStatus,
        customersList,
        storeSettings,
        updateSettings
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}
