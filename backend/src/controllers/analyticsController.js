const pool = require('../config/db');
const { ok, serverErr } = require('../helpers/response');
const { verifyToken } = require('../middleware/auth');

const getDashboardStats = async (req, res) => {
  const user = verifyToken(req, res); if (!user) return;
  try {
    const [orders, customers, inventory, revenue, recentOrders, topProducts] = await Promise.all([
      pool.query(`SELECT COUNT(*) AS total, COUNT(*) FILTER (WHERE status='pending') AS pending FROM orders`),
      pool.query(`SELECT COUNT(*) AS total FROM customers`),
      pool.query(`SELECT COUNT(*) FILTER (WHERE stock_qty>low_stock_alert) AS healthy,
                        COUNT(*) FILTER (WHERE stock_qty>0 AND stock_qty<=low_stock_alert) AS low,
                        COUNT(*) FILTER (WHERE stock_qty=0) AS out_of_stock FROM inventory`),
      pool.query(`SELECT COALESCE(SUM(total_amount),0) AS total FROM orders WHERE payment_status='paid'`),
      pool.query(`SELECT o.id,o.total_amount,o.status,o.created_at,c.name AS customer_name
                  FROM orders o LEFT JOIN customers c ON o.customer_id=c.id ORDER BY o.created_at DESC LIMIT 5`),
      pool.query(`SELECT p.name, SUM(oi.qty) AS total_sold, SUM(oi.subtotal) AS total_revenue
                  FROM order_items oi JOIN products p ON oi.product_id=p.id GROUP BY p.id,p.name ORDER BY total_sold DESC LIMIT 5`)
    ]);
    ok(res, { success: true, stats: {
      orders: orders.rows[0], customers: customers.rows[0], inventory: inventory.rows[0],
      total_revenue: revenue.rows[0].total, recent_orders: recentOrders.rows, top_products: topProducts.rows
    }});
  } catch (err) { serverErr(res, err.message); }
};

const getSalesAnalytics = async (req, res, params, query) => {
  const user = verifyToken(req, res); if (!user) return;
  try {
    const days = parseInt(query.period) || 30;
    const result = await pool.query(`
      SELECT DATE(created_at) AS date, COUNT(*) AS order_count, SUM(total_amount) AS revenue
      FROM orders WHERE created_at >= NOW() - INTERVAL '${days} days' AND payment_status='paid'
      GROUP BY DATE(created_at) ORDER BY date ASC`);
    ok(res, { success: true, sales: result.rows });
  } catch (err) { serverErr(res, err.message); }
};

const getCategoryAnalytics = async (req, res) => {
  const user = verifyToken(req, res); if (!user) return;
  try {
    const result = await pool.query(`
      SELECT c.name AS category, COUNT(p.id) AS product_count, COALESCE(SUM(oi.subtotal),0) AS revenue
      FROM categories c LEFT JOIN products p ON p.category_id=c.id LEFT JOIN order_items oi ON oi.product_id=p.id
      GROUP BY c.id,c.name ORDER BY revenue DESC`);
    ok(res, { success: true, categories: result.rows });
  } catch (err) { serverErr(res, err.message); }
};

module.exports = { getDashboardStats, getSalesAnalytics, getCategoryAnalytics };
