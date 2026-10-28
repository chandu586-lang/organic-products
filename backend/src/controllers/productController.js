const pool = require('../config/db');
const { ok, created, badReq, notFound, conflict, serverErr } = require('../helpers/response');
const { verifyToken, requireAdmin } = require('../middleware/auth');

const getProducts = async (req, res, params, query) => {
  const user = verifyToken(req, res); if (!user) return;
  try {
    const { category, search, active } = query;
    let sql = `SELECT p.*, c.name AS category_name, i.stock_qty, i.low_stock_alert
               FROM products p
               LEFT JOIN categories c ON p.category_id=c.id
               LEFT JOIN inventory i  ON i.product_id=p.id WHERE 1=1`;
    const args = [];
    if (active !== undefined)  { args.push(active==='true'); sql += ` AND p.is_active=$${args.length}`; }
    if (category)              { args.push(category);        sql += ` AND c.name ILIKE $${args.length}`; }
    if (search)                { args.push(`%${search}%`);  sql += ` AND (p.name ILIKE $${args.length} OR p.sku ILIKE $${args.length})`; }
    sql += ' ORDER BY p.created_at DESC';
    const result = await pool.query(sql, args);
    ok(res, { success: true, products: result.rows });
  } catch (err) { serverErr(res, err.message); }
};

const getProduct = async (req, res, params) => {
  const user = verifyToken(req, res); if (!user) return;
  try {
    const result = await pool.query(
      `SELECT p.*, c.name AS category_name, i.stock_qty, i.low_stock_alert
       FROM products p LEFT JOIN categories c ON p.category_id=c.id LEFT JOIN inventory i ON i.product_id=p.id WHERE p.id=$1`,
      [params.id]
    );
    if (!result.rows.length) return notFound(res, 'Product not found');
    ok(res, { success: true, product: result.rows[0] });
  } catch (err) { serverErr(res, err.message); }
};

const createProduct = async (req, res, params, query, body) => {
  const user = verifyToken(req, res); if (!user) return;
  if (user.role !== 'admin' && user.role !== 'worker') return requireAdmin(res, user);
  const client = await pool.connect();
  try {
    const {
      name,
      sku,
      category,
      category_id,
      price,
      description = '',
      image,
      image_url,
      stock,
      stock_qty = 0,
      low_stock_alert = 10,
    } = body;
    const finalSku = sku || `SKU-${Date.now()}`;
    const finalImage = image_url ?? image ?? null;
    const finalStock = stock !== undefined ? Number(stock) : Number(stock_qty) || 0;

    await client.query('BEGIN');

    let resolvedCategoryId = category_id || null;
    if (!resolvedCategoryId && category) {
      const catRes = await client.query(
        'INSERT INTO categories (name) VALUES ($1) ON CONFLICT (name) DO UPDATE SET name = EXCLUDED.name RETURNING id',
        [category.trim()]
      );
      resolvedCategoryId = catRes.rows[0]?.id || null;
    }

    const prod = await client.query(
      'INSERT INTO products (name,sku,category_id,price,description,image_url) VALUES ($1,$2,$3,$4,$5,$6) RETURNING *',
      [name, finalSku, resolvedCategoryId, price, description, finalImage]
    );
    await client.query(
      'INSERT INTO inventory (product_id,stock_qty,low_stock_alert) VALUES ($1,$2,$3)',
      [prod.rows[0].id, finalStock, low_stock_alert]
    );
    await client.query('COMMIT');
    created(res, { success: true, product: prod.rows[0] });
  } catch (err) {
    await client.query('ROLLBACK');
    if (err.code === '23505') return conflict(res, 'SKU already exists');
    serverErr(res, err.message);
  } finally { client.release(); }
};

const updateProduct = async (req, res, params, query, body) => {
  const user = verifyToken(req, res); if (!user) return;
  if (user.role !== 'admin' && user.role !== 'worker') return requireAdmin(res, user);
  const client = await pool.connect();
  try {
    const {
      name,
      sku,
      category,
      category_id,
      price,
      description,
      image,
      image_url,
      stock,
      stock_qty,
      is_active,
      status,
    } = body;

    await client.query('BEGIN');

    // Find target product by id or name
    let existing = await client.query('SELECT * FROM products WHERE id = $1', [Number(params.id) || 0]);
    if (!existing.rows.length && name) {
      existing = await client.query('SELECT * FROM products WHERE LOWER(name) = LOWER($1)', [name.trim()]);
    }
    if (!existing.rows.length) {
      await client.query('ROLLBACK');
      return notFound(res, 'Product not found');
    }

    const current = existing.rows[0];
    let resolvedCategoryId = category_id !== undefined ? category_id : current.category_id;
    if (category) {
      const catRes = await client.query(
        'INSERT INTO categories (name) VALUES ($1) ON CONFLICT (name) DO UPDATE SET name = EXCLUDED.name RETURNING id',
        [category.trim()]
      );
      resolvedCategoryId = catRes.rows[0]?.id || resolvedCategoryId;
    }

    const finalImage = image_url !== undefined ? image_url : image !== undefined ? image : current.image_url;
    const finalActive =
      is_active !== undefined ? is_active : status !== undefined ? status === 'Active' : current.is_active;

    const result = await client.query(
      'UPDATE products SET name=$1,sku=$2,category_id=$3,price=$4,description=$5,image_url=$6,is_active=$7,updated_at=NOW() WHERE id=$8 RETURNING *',
      [
        name ?? current.name,
        sku ?? current.sku,
        resolvedCategoryId,
        price !== undefined ? price : current.price,
        description !== undefined ? description : current.description,
        finalImage,
        finalActive,
        current.id,
      ]
    );

    const newStock = stock !== undefined ? Number(stock) : stock_qty !== undefined ? Number(stock_qty) : null;
    if (newStock !== null && !Number.isNaN(newStock)) {
      await client.query(
        'INSERT INTO inventory (product_id, stock_qty) VALUES ($1, $2) ON CONFLICT (product_id) DO UPDATE SET stock_qty = $2, updated_at = NOW()',
        [current.id, newStock]
      );
    }

    await client.query('COMMIT');
    ok(res, { success: true, product: result.rows[0] });
  } catch (err) {
    await client.query('ROLLBACK');
    serverErr(res, err.message);
  } finally { client.release(); }
};

const deleteProduct = async (req, res, params) => {
  const user = verifyToken(req, res); if (!user) return;
  if (!requireAdmin(res, user)) return;
  try {
    const result = await pool.query('DELETE FROM products WHERE id=$1 RETURNING id', [params.id]);
    if (!result.rows.length) return notFound(res, 'Product not found');
    ok(res, { success: true, message: 'Product deleted' });
  } catch (err) { serverErr(res, err.message); }
};

module.exports = { getProducts, getProduct, createProduct, updateProduct, deleteProduct };
