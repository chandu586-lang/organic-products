const path    = require('path');
const bcrypt  = require('bcryptjs');
const jwt     = require('jsonwebtoken');
const pool    = require('../config/db');
const { ok, created, badReq, unauth, notFound, conflict, serverErr } = require('../helpers/response');
const { verifyToken, requireAdmin } = require('../middleware/auth');
require('dotenv').config({ path: path.join(__dirname, '../../.env') });

const signup = async (req, res, body) => {
  try {
    const { name, email, password } = body || {};
    if (!name || !name.trim() || !email || !email.trim() || !password) {
      return badReq(res, 'Full name, email, and password are required.');
    }
    const cleanName = name.trim();
    const cleanEmail = email.trim().toLowerCase();

    if (!/^\S+@\S+\.\S+$/.test(cleanEmail)) {
      return badReq(res, 'Please enter a valid email address.');
    }
    if (String(password).length < 6) {
      return badReq(res, 'Password must be at least 6 characters.');
    }

    const existing = await pool.query('SELECT id FROM users WHERE LOWER(email) = LOWER($1)', [cleanEmail]);
    if (existing.rows.length > 0) {
      return conflict(res, 'An account with this email already exists. Please sign in.');
    }

    const hashedPassword = await bcrypt.hash(String(password), 10);
    const result = await pool.query(
      "INSERT INTO users (name, email, password, role) VALUES ($1, $2, $3, 'customer') RETURNING id, name, email, role, created_at",
      [cleanName, cleanEmail, hashedPassword]
    );
    const user = result.rows[0];

    // Also sync to customers table
    await pool.query(
      'INSERT INTO customers (name, email) VALUES ($1, $2) ON CONFLICT (email) DO NOTHING',
      [cleanName, cleanEmail]
    ).catch(() => {});

    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role, name: user.name },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
    );

    created(res, {
      success: true,
      message: 'Account created successfully.',
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        created_at: user.created_at
      }
    });
  } catch (err) {
    if (err.code === '23505') return conflict(res, 'An account with this email already exists. Please sign in.');
    serverErr(res, err.message);
  }
};

const login = async (req, res, body) => {
  try {
    const { email, password } = body || {};
    if (!email || !email.trim() || !password) {
      return badReq(res, 'Email and password required');
    }
    const cleanEmail = email.trim().toLowerCase();
    const result = await pool.query(
      'SELECT * FROM users WHERE LOWER(email) = LOWER($1) AND is_active = TRUE',
      [cleanEmail]
    );
    if (!result.rows.length) {
      return notFound(res, 'Account not found. Please sign up first.');
    }
    const user = result.rows[0];
    const isMatch = await bcrypt.compare(String(password), user.password);
    if (!isMatch) {
      return unauth(res, 'Invalid email or password.');
    }
    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role, name: user.name },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
    );
    ok(res, {
      success: true,
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        created_at: user.created_at
      }
    });
  } catch (err) {
    serverErr(res, err.message);
  }
};

const getMe = async (req, res) => {
  const user = verifyToken(req, res); if (!user) return;
  try {
    const result = await pool.query(
      'SELECT id, name, email, role, created_at FROM users WHERE id = $1 AND is_active = TRUE',
      [user.id]
    );
    if (!result.rows.length) {
      return notFound(res, 'Account not found. Please sign up first.');
    }
    ok(res, { success: true, user: result.rows[0] });
  } catch (err) {
    serverErr(res, err.message);
  }
};

const getWorkers = async (req, res) => {
  const user = verifyToken(req, res); if (!user) return;
  if (!requireAdmin(res, user)) return;
  try {
    const result = await pool.query("SELECT id,name,email,role,is_active,created_at FROM users WHERE role='worker' ORDER BY created_at DESC");
    ok(res, { success: true, workers: result.rows });
  } catch (err) { serverErr(res, err.message); }
};

const registerWorker = async (req, res, body) => {
  const user = verifyToken(req, res); if (!user) return;
  if (!requireAdmin(res, user)) return;
  try {
    const { name, email, password, role = 'worker' } = body;
    if (!name || !email || !password) return badReq(res, 'Name, email and password required');
    const hashed = await bcrypt.hash(password, 10);
    const result = await pool.query(
      'INSERT INTO users (name,email,password,role) VALUES ($1,$2,$3,$4) RETURNING id,name,email,role',
      [name, email, hashed, role]
    );
    created(res, { success: true, user: result.rows[0] });
  } catch (err) {
    if (err.code === '23505') return conflict(res, 'Email already exists');
    serverErr(res, err.message);
  }
};

module.exports = { signup, login, getMe, getWorkers, registerWorker };
