const pool = require('../config/db');
const { ok, notFound, serverErr } = require('../helpers/response');
const { verifyToken, requireAdmin } = require('../middleware/auth');

const getStoreSettings = async (req, res) => {
  const user = verifyToken(req, res); if (!user) return;
  try {
    const result = await pool.query('SELECT key,value FROM store_settings');
    const settings = {};
    result.rows.forEach(r => { settings[r.key] = r.value; });
    ok(res, { success: true, settings });
  } catch (err) { serverErr(res, err.message); }
};

const updateStoreSettings = async (req, res, params, query, body) => {
  const user = verifyToken(req, res); if (!user) return;
  if (!requireAdmin(res, user)) return;
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    for (const [key, value] of Object.entries(body)) {
      await client.query(
        `INSERT INTO store_settings (key,value) VALUES ($1,$2) ON CONFLICT (key) DO UPDATE SET value=$2,updated_at=NOW()`,
        [key, value]
      );
    }
    await client.query('COMMIT');
    ok(res, { success: true, message: 'Settings updated' });
  } catch (err) { await client.query('ROLLBACK'); serverErr(res, err.message); }
  finally { client.release(); }
};

const getPaymentSettings = async (req, res) => {
  const user = verifyToken(req, res); if (!user) return;
  try {
    const result = await pool.query('SELECT * FROM payment_settings ORDER BY id');
    ok(res, { success: true, payments: result.rows });
  } catch (err) { serverErr(res, err.message); }
};

const updatePaymentSetting = async (req, res, params, query, body) => {
  const user = verifyToken(req, res); if (!user) return;
  if (!requireAdmin(res, user)) return;
  try {
    const { is_enabled, config_json } = body;
    const result = await pool.query(
      `UPDATE payment_settings SET is_enabled=$1,config_json=$2,updated_at=NOW() WHERE method=$3 RETURNING *`,
      [is_enabled, JSON.stringify(config_json || {}), params.method]
    );
    if (!result.rows.length) return notFound(res, 'Payment method not found');
    ok(res, { success: true, payment: result.rows[0] });
  } catch (err) { serverErr(res, err.message); }
};

const getCategories = async (req, res) => {
  const user = verifyToken(req, res); if (!user) return;
  try {
    const result = await pool.query('SELECT * FROM categories ORDER BY name');
    ok(res, { success: true, categories: result.rows });
  } catch (err) { serverErr(res, err.message); }
};

module.exports = { getStoreSettings, updateStoreSettings, getPaymentSettings, updatePaymentSetting, getCategories };
