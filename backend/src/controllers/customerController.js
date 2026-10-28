const pool = require('../config/db');
const { ok, created, badReq, notFound, conflict, serverErr } = require('../helpers/response');
const { verifyToken, requireAdmin } = require('../middleware/auth');

const getCustomers = async (req, res, params, query) => {
  const user = verifyToken(req, res); if (!user) return;
  try {
    const { search } = query;
    let sql = `SELECT c.*, COUNT(o.id) AS order_count,
                      COALESCE(SUM(o.total_amount) FILTER (WHERE o.payment_status='paid'),0) AS total_spent
               FROM customers c LEFT JOIN orders o ON o.customer_id=c.id WHERE 1=1`;
    const args = [];
    if (search) { args.push(`%${search}%`); sql += ` AND (c.name ILIKE $${args.length} OR c.email ILIKE $${args.length} OR c.phone ILIKE $${args.length})`; }
    sql += ' GROUP BY c.id ORDER BY c.created_at DESC';
    const result = await pool.query(sql, args);
    ok(res, { success: true, customers: result.rows });
  } catch (err) { serverErr(res, err.message); }
};

const getCustomer = async (req, res, params) => {
  const user = verifyToken(req, res); if (!user) return;
  try {
    const customer = await pool.query('SELECT * FROM customers WHERE id=$1', [params.id]);
    if (!customer.rows.length) return notFound(res, 'Customer not found');
    const orders = await pool.query('SELECT * FROM orders WHERE customer_id=$1 ORDER BY created_at DESC', [params.id]);
    ok(res, { success: true, customer: { ...customer.rows[0], orders: orders.rows } });
  } catch (err) { serverErr(res, err.message); }
};

const createCustomer = async (req, res, params, query, body) => {
  const user = verifyToken(req, res); if (!user) return;
  try {
    const { name, email, phone, address } = body;
    if (!name || !email) return badReq(res, 'Name and email required');
    const result = await pool.query(
      'INSERT INTO customers (name,email,phone,address) VALUES ($1,$2,$3,$4) RETURNING *',
      [name, email, phone, address]
    );
    created(res, { success: true, customer: result.rows[0] });
  } catch (err) {
    if (err.code === '23505') return conflict(res, 'Email already exists');
    serverErr(res, err.message);
  }
};

const updateCustomer = async (req, res, params, query, body) => {
  const user = verifyToken(req, res); if (!user) return;
  try {
    const { name, email, phone, address } = body;
    const result = await pool.query(
      'UPDATE customers SET name=$1,email=$2,phone=$3,address=$4,updated_at=NOW() WHERE id=$5 RETURNING *',
      [name, email, phone, address, params.id]
    );
    if (!result.rows.length) return notFound(res, 'Customer not found');
    ok(res, { success: true, customer: result.rows[0] });
  } catch (err) { serverErr(res, err.message); }
};

const deleteCustomer = async (req, res, params) => {
  const user = verifyToken(req, res); if (!user) return;
  if (!requireAdmin(res, user)) return;
  try {
    const result = await pool.query('DELETE FROM customers WHERE id=$1 RETURNING id', [params.id]);
    if (!result.rows.length) return notFound(res, 'Customer not found');
    ok(res, { success: true, message: 'Customer deleted' });
  } catch (err) { serverErr(res, err.message); }
};

module.exports = { getCustomers, getCustomer, createCustomer, updateCustomer, deleteCustomer };
