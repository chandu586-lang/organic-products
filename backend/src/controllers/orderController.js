const pool = require('../config/db');
const { ok, created, notFound, serverErr } = require('../helpers/response');
const { verifyToken, requireAdmin } = require('../middleware/auth');

const getOrders = async (req, res, params, query) => {
  const user = verifyToken(req, res); if (!user) return;
  try {
    const { status, search } = query;
    let sql = `SELECT o.*, c.name AS customer_name, c.email AS customer_email, COUNT(oi.id) AS item_count
               FROM orders o LEFT JOIN customers c ON o.customer_id=c.id LEFT JOIN order_items oi ON oi.order_id=o.id WHERE 1=1`;
    const args = [];
    if (status) { args.push(status);         sql += ` AND o.status=$${args.length}`; }
    if (search) { args.push(`%${search}%`);  sql += ` AND (c.name ILIKE $${args.length} OR c.email ILIKE $${args.length})`; }
    sql += ' GROUP BY o.id,c.name,c.email ORDER BY o.created_at DESC';
    const result = await pool.query(sql, args);
    ok(res, { success: true, orders: result.rows });
  } catch (err) { serverErr(res, err.message); }
};

const getOrderStats = async (req, res) => {
  const user = verifyToken(req, res); if (!user) return;
  try {
    const result = await pool.query(`
      SELECT COUNT(*) AS total_orders,
             COUNT(*) FILTER (WHERE status='pending')    AS pending,
             COUNT(*) FILTER (WHERE status='processing') AS processing,
             COUNT(*) FILTER (WHERE status='delivered')  AS delivered,
             COUNT(*) FILTER (WHERE status='cancelled')  AS cancelled,
             COALESCE(SUM(total_amount) FILTER (WHERE payment_status='paid'),0) AS total_revenue
      FROM orders`);
    ok(res, { success: true, stats: result.rows[0] });
  } catch (err) { serverErr(res, err.message); }
};

const getOrder = async (req, res, params) => {
  const user = verifyToken(req, res); if (!user) return;
  try {
    const order = await pool.query(
      `SELECT o.*, c.name AS customer_name, c.email AS customer_email, c.phone FROM orders o LEFT JOIN customers c ON o.customer_id=c.id WHERE o.id=$1`,
      [params.id]
    );
    if (!order.rows.length) return notFound(res, 'Order not found');
    const items = await pool.query(
      `SELECT oi.*, p.name AS product_name, p.image_url FROM order_items oi LEFT JOIN products p ON oi.product_id=p.id WHERE oi.order_id=$1`,
      [params.id]
    );
    ok(res, { success: true, order: { ...order.rows[0], items: items.rows } });
  } catch (err) { serverErr(res, err.message); }
};

const createOrder = async (req, res, params, query, body) => {
  const user = verifyToken(req, res); if (!user) return;
  const client = await pool.connect();
  try {
    const { customer_id, items, payment_mode='cod', notes } = body;
    await client.query('BEGIN');
    const total = items.reduce((sum, i) => sum + i.qty * i.unit_price, 0);
    const order = await client.query(
      'INSERT INTO orders (customer_id,total_amount,payment_mode,notes) VALUES ($1,$2,$3,$4) RETURNING *',
      [customer_id, total, payment_mode, notes]
    );
    for (const item of items) {
      await client.query('INSERT INTO order_items (order_id,product_id,qty,unit_price) VALUES ($1,$2,$3,$4)',
        [order.rows[0].id, item.product_id, item.qty, item.unit_price]);
    }
    await client.query('COMMIT');
    created(res, { success: true, order: order.rows[0] });
  } catch (err) { await client.query('ROLLBACK'); serverErr(res, err.message); }
  finally { client.release(); }
};

const updateOrderStatus = async (req, res, params, query, body) => {
  const user = verifyToken(req, res); if (!user) return;
  if (!requireAdmin(res, user)) return;
  try {
    const { status, payment_status } = body;
    const result = await pool.query(
      'UPDATE orders SET status=$1,payment_status=$2,updated_at=NOW() WHERE id=$3 RETURNING *',
      [status, payment_status, params.id]
    );
    if (!result.rows.length) return notFound(res, 'Order not found');
    ok(res, { success: true, order: result.rows[0] });
  } catch (err) { serverErr(res, err.message); }
};

module.exports = { getOrders, getOrder, createOrder, updateOrderStatus, getOrderStats };
