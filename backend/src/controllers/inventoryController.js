const pool = require('../config/db');
const { ok, badReq, notFound, serverErr } = require('../helpers/response');
const { verifyToken, requireAdmin } = require('../middleware/auth');

const getInventory = async (req, res, params, query) => {
  const user = verifyToken(req, res); if (!user) return;
  try {
    const { search, status } = query;
    let sql = `SELECT p.id, p.name, p.sku, p.price, p.image_url, c.name AS category,
                      i.stock_qty, i.low_stock_alert, i.updated_at,
                      CASE WHEN i.stock_qty=0 THEN 'out'
                           WHEN i.stock_qty<=i.low_stock_alert THEN 'low' ELSE 'healthy' END AS stock_status
               FROM products p LEFT JOIN categories c ON p.category_id=c.id
               LEFT JOIN inventory i ON i.product_id=p.id WHERE p.is_active=TRUE`;
    const args = [];
    if (search) { args.push(`%${search}%`); sql += ` AND (p.name ILIKE $${args.length} OR p.sku ILIKE $${args.length})`; }
    if (status==='healthy') sql += ` AND i.stock_qty > i.low_stock_alert`;
    if (status==='low')     sql += ` AND i.stock_qty > 0 AND i.stock_qty <= i.low_stock_alert`;
    if (status==='out')     sql += ` AND i.stock_qty = 0`;
    sql += ' ORDER BY p.id ASC';
    const result = await pool.query(sql, args);
    ok(res, { success: true, inventory: result.rows });
  } catch (err) { serverErr(res, err.message); }
};

const getInventoryStats = async (req, res) => {
  const user = verifyToken(req, res); if (!user) return;
  try {
    const result = await pool.query(`
      SELECT COUNT(*) FILTER (WHERE stock_qty > low_stock_alert)             AS healthy,
             COUNT(*) FILTER (WHERE stock_qty > 0 AND stock_qty<=low_stock_alert) AS low,
             COUNT(*) FILTER (WHERE stock_qty = 0)                           AS out_of_stock,
             COUNT(*) AS total FROM inventory`);
    ok(res, { success: true, stats: result.rows[0] });
  } catch (err) { serverErr(res, err.message); }
};

const getInventoryLogs = async (req, res) => {
  const user = verifyToken(req, res); if (!user) return;
  try {
    const result = await pool.query(`
      SELECT l.*, p.name AS product_name, u.name AS done_by_name
      FROM inventory_logs l LEFT JOIN products p ON l.product_id=p.id LEFT JOIN users u ON l.done_by=u.id
      ORDER BY l.created_at DESC LIMIT 100`);
    ok(res, { success: true, logs: result.rows });
  } catch (err) { serverErr(res, err.message); }
};

const addStock = async (req, res, params, query, body) => {
  const user = verifyToken(req, res); if (!user) return;
  const client = await pool.connect();
  try {
    const { qty, reason='Manual addition', note } = body;
    if (!qty || qty <= 0) return badReq(res, 'Quantity must be greater than 0');
    await client.query('BEGIN');
    const inv = await client.query(
      'UPDATE inventory SET stock_qty=stock_qty+$1,updated_at=NOW() WHERE product_id=$2 RETURNING *',
      [qty, params.productId]
    );
    if (!inv.rows.length) return notFound(res, 'Inventory not found');
    await client.query('INSERT INTO inventory_logs (product_id,change_qty,reason,note,done_by) VALUES ($1,$2,$3,$4,$5)',
      [params.productId, qty, reason, note, user.id]);
    await client.query('COMMIT');
    ok(res, { success: true, inventory: inv.rows[0], message: `Added ${qty} units successfully` });
  } catch (err) { await client.query('ROLLBACK'); serverErr(res, err.message); }
  finally { client.release(); }
};

const updateStock = async (req, res, params, query, body) => {
  const user = verifyToken(req, res); if (!user) return;
  if (!requireAdmin(res, user)) return;
  try {
    const { stock_qty, low_stock_alert } = body;
    const result = await pool.query(
      'UPDATE inventory SET stock_qty=$1,low_stock_alert=$2,updated_at=NOW() WHERE product_id=$3 RETURNING *',
      [stock_qty, low_stock_alert, params.productId]
    );
    if (!result.rows.length) return notFound(res, 'Inventory not found');
    ok(res, { success: true, inventory: result.rows[0] });
  } catch (err) { serverErr(res, err.message); }
};

module.exports = { getInventory, getInventoryStats, getInventoryLogs, addStock, updateStock };
