import React, { useState, useMemo } from 'react';
import { 
  BarChart3, 
  TrendingUp, 
  PieChart, 
  Calendar, 
  Download, 
  DollarSign, 
  ShoppingBag, 
  Package, 
  ArrowUpRight 
} from 'lucide-react';
import { useCart } from '../context/CartContext';
import { CATEGORY_CHART_COLORS } from '../config/constants';
import AdminLayout from './AdminLayout';
import './AdminAnalytics.css';

export default function AdminAnalytics() {
  const { productsList, ordersList, categories } = useCart();
  const [period, setPeriod] = useState('month'); // 'week' | 'month' | 'year'

  const totalRevenue = ordersList.reduce((acc, o) => acc + (o.pricing?.total || 0), 0);
  const avgOrderVal = ordersList.length > 0 ? Math.round(totalRevenue / ordersList.length) : 0;

  // Dynamic category breakdown calculated from real ordersList & productsList
  const categoryStats = useMemo(() => {
    const distinctCats = (categories || []).filter((c) => c !== 'All');
    const revenueByCat = {};
    distinctCats.forEach((c) => {
      revenueByCat[c] = 0;
    });

    let totalItemSales = 0;
    ordersList.forEach((order) => {
      (order.items || []).forEach((item) => {
        const cat = item.category || 'Other';
        const lineTotal = (Number(item.price) || 0) * (Number(item.quantity) || 0);
        revenueByCat[cat] = (revenueByCat[cat] || 0) + lineTotal;
        totalItemSales += lineTotal;
      });
    });

    // If no orders have been placed yet, show inventory value share by category
    if (totalItemSales === 0) {
      let totalCatalogValue = 0;
      productsList.forEach((p) => {
        const cat = p.category || 'Other';
        const val = (Number(p.price) || 0) * (Number(p.stock) || 0);
        revenueByCat[cat] = (revenueByCat[cat] || 0) + val;
        totalCatalogValue += val;
      });

      return Object.entries(revenueByCat)
        .filter(([, val]) => val > 0)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5)
        .map(([name, val], idx) => ({
          name,
          percent: totalCatalogValue > 0 ? Math.round((val / totalCatalogValue) * 100) : 0,
          sales: `₹${Math.round(val).toLocaleString('en-IN')}`,
          color: CATEGORY_CHART_COLORS[idx % CATEGORY_CHART_COLORS.length],
        }));
    }

    return Object.entries(revenueByCat)
      .filter(([, val]) => val > 0)
      .sort((a, b) => b[1] - a[1])
      .map(([name, val], idx) => ({
        name,
        percent: totalItemSales > 0 ? Math.round((val / totalItemSales) * 100) : 0,
        sales: `₹${Math.round(val).toLocaleString('en-IN')}`,
        color: CATEGORY_CHART_COLORS[idx % CATEGORY_CHART_COLORS.length],
      }));
  }, [ordersList, productsList, categories]);

  // Dynamic best-selling items calculated from ordersList
  const bestSellers = useMemo(() => {
    const productStats = {};
    ordersList.forEach((order) => {
      (order.items || []).forEach((item) => {
        const key = item.id || item.name;
        if (!productStats[key]) {
          productStats[key] = { orders: 0, gross: 0 };
        }
        const qty = Number(item.quantity) || 0;
        const price = Number(item.price) || 0;
        productStats[key].orders += qty;
        productStats[key].gross += qty * price;
      });
    });

    return productsList
      .map((p) => {
        const st = productStats[p.id] || productStats[p.name] || { orders: 0, gross: 0 };
        return {
          ...p,
          orders: st.orders,
          gross: st.gross,
        };
      })
      .sort((a, b) => b.gross - a.gross || b.orders - a.orders)
      .slice(0, 5)
      .map((p, idx) => ({
        ...p,
        rank: idx + 1,
      }));
  }, [ordersList, productsList]);

  return (
    <AdminLayout activeTab="Analytics & Reports">
      <div className="analytics-view">
        {/* Header */}
        <div className="analytics-header">
          <div>
            <h1 className="analytics-title">Analytics & Reports</h1>
            <p className="analytics-sub">Harvest sales performance, product revenue breakdowns, and order velocity</p>
          </div>
          <div className="analytics-actions">
            <div className="period-selector">
              <button 
                type="button" 
                className={`period-btn ${period === 'week' ? 'active' : ''}`}
                onClick={() => setPeriod('week')}
              >
                7 Days
              </button>
              <button 
                type="button" 
                className={`period-btn ${period === 'month' ? 'active' : ''}`}
                onClick={() => setPeriod('month')}
              >
                This Month
              </button>
              <button 
                type="button" 
                className={`period-btn ${period === 'year' ? 'active' : ''}`}
                onClick={() => setPeriod('year')}
              >
                Annual
              </button>
            </div>
          </div>
        </div>

        {/* 3 Metric Summary Cards */}
        <div className="analytics-metrics-grid">
          <div className="metric-box">
            <span className="metric-label">Gross Organic Sales</span>
            <div className="metric-value">₹{Math.round(totalRevenue).toLocaleString('en-IN')}</div>
            <div className="metric-change positive">
              <TrendingUp size={14} /> +18.4% vs last period
            </div>
          </div>

          <div className="metric-box">
            <span className="metric-label">Average Order Value (AOV)</span>
            <div className="metric-value">₹{avgOrderVal.toLocaleString('en-IN')}</div>
            <div className="metric-change positive">
              <TrendingUp size={14} /> +5.2% basket size
            </div>
          </div>

          <div className="metric-box">
            <span className="metric-label">Dispatched Order Volume</span>
            <div className="metric-value">{ordersList.length} orders</div>
            <div className="metric-change neutral">
              <span>Stable seasonal growth</span>
            </div>
          </div>
        </div>

        {/* Category Performance & Order Breakdown */}
        <div className="analytics-grid-two">
          {/* Category Performance */}
          <div className="analytics-card">
            <div className="card-head">
              <h3 className="card-title">Category Revenue Contribution</h3>
              <span className="card-meta">Product mix by sales</span>
            </div>

            <div className="category-bars-list">
              {categoryStats.map(cat => (
                <div key={cat.name} className="cat-bar-item">
                  <div className="cat-bar-header">
                    <span className="cat-bar-name">{cat.name}</span>
                    <span className="cat-bar-val">{cat.sales} ({cat.percent}%)</span>
                  </div>
                  <div className="cat-bar-bg">
                    <div 
                      className="cat-bar-progress" 
                      style={{ width: `${cat.percent}%`, backgroundColor: cat.color }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Order Summary & Status Breakdown */}
          <div className="analytics-card">
            <div className="card-head">
              <h3 className="card-title">Order Fulfillment Velocity</h3>
              <span className="card-meta">Dispatch distribution</span>
            </div>

            <div className="fulfillment-summary">
              <div className="fulfill-item">
                <span className="fulfill-count green">{ordersList.filter(o => o.delivery?.status === 'Delivered').length}</span>
                <span className="fulfill-label">Delivered & Completed</span>
              </div>
              <div className="fulfill-item">
                <span className="fulfill-count amber">{ordersList.filter(o => o.delivery?.status === 'Processing' || o.delivery?.status === 'Pending').length}</span>
                <span className="fulfill-label">Processing / In Dispatch</span>
              </div>
              <div className="fulfill-item">
                <span className="fulfill-count blue">{ordersList.filter(o => o.delivery?.status === 'In Transit').length}</span>
                <span className="fulfill-label">In Transit with Courier</span>
              </div>
            </div>
          </div>
        </div>

        {/* Best Performing Harvest Products Table */}
        <div className="analytics-card">
          <div className="card-head">
            <h3 className="card-title">Best-Selling Harvest Products</h3>
            <span className="card-meta">Top products by total volume & gross revenue</span>
          </div>

          <div className="table-responsive">
            <table className="analytics-table">
              <thead>
                <tr>
                  <th>Rank</th>
                  <th>Product Name</th>
                  <th>Category</th>
                  <th>Units Sold</th>
                  <th>Gross Sales</th>
                </tr>
              </thead>
              <tbody>
                {bestSellers.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="table-empty">No products recorded yet.</td>
                  </tr>
                ) : (
                  bestSellers.map(p => (
                    <tr key={p.id}>
                      <td className="fw-bold text-forest">#{p.rank}</td>
                      <td>
                        <div className="prod-cell">
                          <img src={p.image} alt={p.name} className="prod-thumb-mini" />
                          <span>{p.name}</span>
                        </div>
                      </td>
                      <td>{p.category}</td>
                      <td>{p.orders} units</td>
                      <td className="fw-semibold">₹{p.gross.toLocaleString('en-IN')}</td>
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
