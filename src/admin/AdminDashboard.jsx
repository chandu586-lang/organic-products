import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { 
  DollarSign, 
  ShoppingBag, 
  Package, 
  Users, 
  TrendingUp, 
  TrendingDown, 
  ArrowUpRight, 
  AlertCircle, 
  CheckCircle2, 
  Clock, 
  Boxes, 
  Plus,
  ChevronRight,
  Filter,
  Calendar
} from 'lucide-react';
import { useCart } from '../context/CartContext';
import AdminLayout from './AdminLayout';
import './AdminDashboard.css';

export default function AdminDashboard() {
  const { productsList, ordersList, customersList, storeSettings, updateProduct } = useCart();
  const [chartRange, setChartRange] = useState('7d'); // '7d' | '30d'
  const [quickStockId, setQuickStockId] = useState(null);
  const [quickStockVal, setQuickStockVal] = useState('');

  // 1. KPI Calculations
  const totalRevenue = ordersList.reduce((acc, order) => acc + (order.pricing?.total || 0), 0);
  const totalOrdersCount = ordersList.length;
  const inStockProductsCount = productsList.filter(p => (p.stock || 0) > 0).length;
  const registeredCustomersCount = customersList.length;

  // 2. Inventory alerts based on configured threshold
  const lowStockThreshold = storeSettings?.lowStockThreshold || 20;
  const lowStockItems = productsList.filter(p => (p.stock || 0) <= lowStockThreshold);

  // 3. Recent Orders
  const recentOrders = [...ordersList].slice(0, 6);

  // 4. Top-Selling Products calculated dynamically from ordersList
  const topSelling = useMemo(() => {
    const salesByProduct = {};
    ordersList.forEach((order) => {
      (order.items || []).forEach((item) => {
        const key = item.id || item.name;
        if (!salesByProduct[key]) {
          salesByProduct[key] = { unitsSold: 0, revenue: 0 };
        }
        const qty = Number(item.quantity) || 0;
        const price = Number(item.price) || 0;
        salesByProduct[key].unitsSold += qty;
        salesByProduct[key].revenue += qty * price;
      });
    });

    return productsList
      .map((p) => {
        const stats = salesByProduct[p.id] || salesByProduct[p.name] || { unitsSold: 0, revenue: 0 };
        return {
          ...p,
          unitsSold: stats.unitsSold,
          revenue: stats.revenue,
        };
      })
      .sort((a, b) => b.revenue - a.revenue || b.unitsSold - a.unitsSold)
      .slice(0, 4);
  }, [ordersList, productsList]);

  // Quick Stock update
  const handleQuickStockSave = (id) => {
    const val = Number(quickStockVal);
    if (!isNaN(val) && val >= 0) {
      updateProduct(id, { stock: val });
      setQuickStockId(null);
      setQuickStockVal('');
    }
  };

  // Dynamic Sales Trend Bar Data derived from real ordersList
  const salesChartData = useMemo(() => {
    const now = new Date();
    if (chartRange === '7d') {
      const dayLabels = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
      const days = Array.from({ length: 7 }, (_, i) => {
        const d = new Date(now);
        d.setDate(now.getDate() - (6 - i));
        return {
          dateKey: d.toDateString(),
          label: dayLabels[d.getDay()],
          sales: 0,
          orders: 0,
        };
      });

      ordersList.forEach((order) => {
        const orderDate = order.createdAt ? new Date(order.createdAt).toDateString() : now.toDateString();
        const bucket = days.find((d) => d.dateKey === orderDate);
        if (bucket) {
          bucket.sales += Math.round(order.pricing?.total || 0);
          bucket.orders += 1;
        }
      });

      return days;
    } else {
      const weeks = [
        { label: 'Week 1', sales: 0, orders: 0 },
        { label: 'Week 2', sales: 0, orders: 0 },
        { label: 'Week 3', sales: 0, orders: 0 },
        { label: 'Week 4', sales: 0, orders: 0 },
      ];

      ordersList.forEach((order) => {
        const created = order.createdAt ? new Date(order.createdAt) : now;
        const diffDays = Math.max(0, Math.floor((now - created) / (1000 * 60 * 60 * 24)));
        if (diffDays < 28) {
          const weekIndex = Math.min(3, Math.floor((27 - diffDays) / 7));
          weeks[weekIndex].sales += Math.round(order.pricing?.total || 0);
          weeks[weekIndex].orders += 1;
        }
      });

      return weeks;
    }
  }, [chartRange, ordersList]);

  const maxSales = Math.max(...salesChartData.map(d => d.sales), 1000);

  return (
    <AdminLayout activeTab="Overview">
      <div className="new-dashboard">
        {/* Welcome & Action Bar */}
        <div className="dashboard-head">
          <div>
            <h1 className="head-title">Store Overview</h1>
            <p className="head-sub">Welcome back! Here is your organic store performance summary.</p>
          </div>
          <div className="head-actions">
            <Link to="/admin/orders" className="head-btn primary">
              <ShoppingBag size={16} />
              <span>View Orders</span>
            </Link>
          </div>
        </div>

        {/* 4 Top Statistics Cards */}
        <div className="stats-row">
          {/* Card 1: Total Sales */}
          <div className="stat-card">
            <div className="stat-header">
              <span className="stat-title">Total Sales</span>
              <div className="stat-icon-wrapper forest">
                <DollarSign size={20} />
              </div>
            </div>
            <div className="stat-body">
              <span className="stat-number">₹{Math.round(totalRevenue).toLocaleString('en-IN')}</span>
              <div className="stat-comparison positive">
                <TrendingUp size={14} />
                <span>+12.5%</span>
                <span className="stat-vs">vs last period</span>
              </div>
            </div>
          </div>

          {/* Card 2: Total Orders */}
          <div className="stat-card">
            <div className="stat-header">
              <span className="stat-title">Total Orders</span>
              <div className="stat-icon-wrapper amber">
                <ShoppingBag size={20} />
              </div>
            </div>
            <div className="stat-body">
              <span className="stat-number">{totalOrdersCount}</span>
              <div className="stat-comparison positive">
                <TrendingUp size={14} />
                <span>+8.2%</span>
                <span className="stat-vs">vs last period</span>
              </div>
            </div>
          </div>

          {/* Card 3: Products in Stock */}
          <div className="stat-card">
            <div className="stat-header">
              <span className="stat-title">Products in Stock</span>
              <div className="stat-icon-wrapper sage">
                <Package size={20} />
              </div>
            </div>
            <div className="stat-body">
              <span className="stat-number">{inStockProductsCount}</span>
              <div className="stat-comparison neutral">
                <Boxes size={14} />
                <span>{productsList.length} Total SKUs</span>
              </div>
            </div>
          </div>

          {/* Card 4: Total Customers */}
          <div className="stat-card">
            <div className="stat-header">
              <span className="stat-title">Total Customers</span>
              <div className="stat-icon-wrapper earth">
                <Users size={20} />
              </div>
            </div>
            <div className="stat-body">
              <span className="stat-number">{registeredCustomersCount}</span>
              <div className="stat-comparison positive">
                <TrendingUp size={14} />
                <span>+4.1%</span>
                <span className="stat-vs">new accounts</span>
              </div>
            </div>
          </div>
        </div>

        {/* Sales Analytics Chart & Top Selling Grid */}
        <div className="dashboard-grid-two">
          {/* Sales Analytics Card */}
          <div className="content-card">
            <div className="card-top-bar">
              <div>
                <h3 className="card-heading">Sales Analytics</h3>
                <span className="card-sub">Revenue flow and dispatch order activity</span>
              </div>
              <div className="range-pills">
                <button
                  type="button"
                  className={`range-pill ${chartRange === '7d' ? 'active' : ''}`}
                  onClick={() => setChartRange('7d')}
                >
                  Last 7 Days
                </button>
                <button
                  type="button"
                  className={`range-pill ${chartRange === '30d' ? 'active' : ''}`}
                  onClick={() => setChartRange('30d')}
                >
                  Monthly
                </button>
              </div>
            </div>

            {/* Custom Responsive CSS Bar Chart */}
            <div className="chart-container">
              <div className="chart-bars-wrap">
                {salesChartData.map((item, idx) => {
                  const heightPercent = Math.round((item.sales / maxSales) * 100);
                  return (
                    <div key={idx} className="chart-col">
                      <div className="bar-hover-tooltip">
                        <span>₹{item.sales.toLocaleString('en-IN')}</span>
                        <small>{item.orders} orders</small>
                      </div>
                      <div className="bar-track">
                        <div
                          className="bar-fill"
                          style={{ height: `${heightPercent}%` }}
                        ></div>
                      </div>
                      <span className="bar-label">{item.label}</span>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="chart-footer-legend">
              <div className="legend-item">
                <span className="legend-dot forest"></span>
                <span>Gross Farm Sales (₹)</span>
              </div>
              <div className="legend-item">
                <span className="legend-dot amber"></span>
                <span>Dispatched Volume</span>
              </div>
            </div>
          </div>

          {/* Top-Selling Products */}
          <div className="content-card">
            <div className="card-top-bar">
              <div>
                <h3 className="card-heading">Top-Selling Products</h3>
                <span className="card-sub">Best performing harvests by revenue</span>
              </div>
              <Link to="/admin/products" className="card-link">
                View All <ChevronRight size={15} />
              </Link>
            </div>

            <div className="top-selling-list">
              {topSelling.length === 0 ? (
                <div className="empty-box">No products sold yet.</div>
              ) : (
                topSelling.map((prod) => (
                  <div key={prod.id} className="top-product-item">
                    <img src={prod.image} alt={prod.name} className="top-prod-thumb" />
                    <div className="top-prod-info">
                      <span className="top-prod-name">{prod.name}</span>
                      <span className="top-prod-cat">{prod.category}</span>
                    </div>
                    <div className="top-prod-stats">
                      <span className="top-prod-units">{prod.unitsSold} units</span>
                      <span className="top-prod-rev">₹{prod.revenue.toLocaleString('en-IN')}</span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Recent Orders Section (Full width, Clean View) */}
        <div className="content-card full-width">
          <div className="card-top-bar">
            <div>
              <h3 className="card-heading">Recent Orders</h3>
              <span className="card-sub">Latest customer transactions and fulfillment status</span>
            </div>
            <Link to="/admin/orders" className="card-link">
              View All Orders <ChevronRight size={15} />
            </Link>
          </div>

          <div className="table-responsive">
            <table className="dash-table">
              <thead>
                <tr>
                  <th>Order ID</th>
                  <th>Customer</th>
                  <th>Date</th>
                  <th>Amount</th>
                  <th>Payment</th>
                  <th>Delivery</th>
                </tr>
              </thead>
              <tbody>
                {recentOrders.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="table-empty">
                      No orders recorded yet. Open storefront to test checkout.
                    </td>
                  </tr>
                ) : (
                  recentOrders.map((ord) => (
                    <tr key={ord.id}>
                      <td className="fw-semibold">{ord.id}</td>
                      <td>{ord.customer?.fullName || ord.customer?.name || 'Customer'}</td>
                      <td className="text-muted">
                        {ord.createdAt ? new Date(ord.createdAt).toLocaleDateString() : 'Today'}
                      </td>
                      <td className="fw-semibold">₹{ord.pricing?.total}</td>
                      <td>
                        <span className="status-badge paid">Paid</span>
                      </td>
                      <td>
                        <span className={`status-badge ${ord.delivery?.status === 'Delivered' ? 'delivered' : 'pending'}`}>
                          {ord.delivery?.status || 'Processing'}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
