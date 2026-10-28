-- ============================================================
-- NatureNest Organic Store — PostgreSQL Database Schema
-- ============================================================

-- Drop existing tables (in dependency order)
DROP TABLE IF EXISTS order_items CASCADE;
DROP TABLE IF EXISTS orders CASCADE;
DROP TABLE IF EXISTS inventory_logs CASCADE;
DROP TABLE IF EXISTS inventory CASCADE;
DROP TABLE IF EXISTS products CASCADE;
DROP TABLE IF EXISTS categories CASCADE;
DROP TABLE IF EXISTS customers CASCADE;
DROP TABLE IF EXISTS users CASCADE;
DROP TABLE IF EXISTS payment_settings CASCADE;
DROP TABLE IF EXISTS store_settings CASCADE;

-- ── Users (Admin + Workers + Customers) ──────────────────────
CREATE TABLE users (
  id          SERIAL PRIMARY KEY,
  name        VARCHAR(100) NOT NULL,
  email       VARCHAR(150) UNIQUE NOT NULL,
  password    VARCHAR(255) NOT NULL,
  role        VARCHAR(20) NOT NULL DEFAULT 'customer' CHECK (role IN ('admin', 'worker', 'customer')),
  is_active   BOOLEAN DEFAULT TRUE,
  created_at  TIMESTAMP DEFAULT NOW(),
  updated_at  TIMESTAMP DEFAULT NOW()
);

-- ── Categories ───────────────────────────────────────────────
CREATE TABLE categories (
  id         SERIAL PRIMARY KEY,
  name       VARCHAR(100) UNIQUE NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

-- ── Products ─────────────────────────────────────────────────
CREATE TABLE products (
  id           SERIAL PRIMARY KEY,
  name         VARCHAR(200) NOT NULL,
  sku          VARCHAR(50) UNIQUE NOT NULL,
  category_id  INTEGER REFERENCES categories(id) ON DELETE SET NULL,
  price        NUMERIC(10,2) NOT NULL,
  description  TEXT,
  image_url    TEXT,
  is_active    BOOLEAN DEFAULT TRUE,
  created_at   TIMESTAMP DEFAULT NOW(),
  updated_at   TIMESTAMP DEFAULT NOW()
);

-- ── Inventory ────────────────────────────────────────────────
CREATE TABLE inventory (
  id              SERIAL PRIMARY KEY,
  product_id      INTEGER UNIQUE REFERENCES products(id) ON DELETE CASCADE,
  stock_qty       INTEGER NOT NULL DEFAULT 0,
  low_stock_alert INTEGER NOT NULL DEFAULT 10,
  updated_at      TIMESTAMP DEFAULT NOW()
);

-- ── Inventory Logs (Movement) ────────────────────────────────
CREATE TABLE inventory_logs (
  id          SERIAL PRIMARY KEY,
  product_id  INTEGER REFERENCES products(id) ON DELETE CASCADE,
  change_qty  INTEGER NOT NULL,
  reason      VARCHAR(100),
  note        TEXT,
  done_by     INTEGER REFERENCES users(id),
  created_at  TIMESTAMP DEFAULT NOW()
);

-- ── Customers ────────────────────────────────────────────────
CREATE TABLE customers (
  id         SERIAL PRIMARY KEY,
  name       VARCHAR(150) NOT NULL,
  email      VARCHAR(150) UNIQUE NOT NULL,
  phone      VARCHAR(20),
  address    TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- ── Orders ───────────────────────────────────────────────────
CREATE TABLE orders (
  id            SERIAL PRIMARY KEY,
  customer_id   INTEGER REFERENCES customers(id) ON DELETE SET NULL,
  status        VARCHAR(30) DEFAULT 'pending' CHECK (status IN ('pending','processing','shipped','delivered','cancelled')),
  total_amount  NUMERIC(10,2) NOT NULL DEFAULT 0,
  payment_mode  VARCHAR(30) DEFAULT 'cod' CHECK (payment_mode IN ('cod','online','card','upi')),
  payment_status VARCHAR(20) DEFAULT 'pending' CHECK (payment_status IN ('pending','paid','failed','refunded')),
  notes         TEXT,
  created_at    TIMESTAMP DEFAULT NOW(),
  updated_at    TIMESTAMP DEFAULT NOW()
);

-- ── Order Items ──────────────────────────────────────────────
CREATE TABLE order_items (
  id          SERIAL PRIMARY KEY,
  order_id    INTEGER REFERENCES orders(id) ON DELETE CASCADE,
  product_id  INTEGER REFERENCES products(id) ON DELETE SET NULL,
  qty         INTEGER NOT NULL,
  unit_price  NUMERIC(10,2) NOT NULL,
  subtotal    NUMERIC(10,2) GENERATED ALWAYS AS (qty * unit_price) STORED
);

-- ── Payment Settings ─────────────────────────────────────────
CREATE TABLE payment_settings (
  id              SERIAL PRIMARY KEY,
  method          VARCHAR(30) UNIQUE NOT NULL,
  is_enabled      BOOLEAN DEFAULT FALSE,
  config_json     JSONB DEFAULT '{}',
  updated_at      TIMESTAMP DEFAULT NOW()
);

-- ── Store Settings ───────────────────────────────────────────
CREATE TABLE store_settings (
  id          SERIAL PRIMARY KEY,
  key         VARCHAR(100) UNIQUE NOT NULL,
  value       TEXT,
  updated_at  TIMESTAMP DEFAULT NOW()
);

-- ============================================================
-- SEED DATA
-- ============================================================

-- Admin user (password: password)
INSERT INTO users (name, email, password, role) VALUES
('Admin', 'admin@naturenest.com', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'admin');

-- Worker user (password: password)
INSERT INTO users (name, email, password, role) VALUES
('Ramesh', 'ramesh@naturenest.com', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'worker');

-- Categories
INSERT INTO categories (name) VALUES
('Oils'), ('Honey'), ('Spices'), ('Grains'), ('Dairy');

-- Products
INSERT INTO products (name, sku, category_id, price, description) VALUES
('Wood-Pressed Groundnut Oil',  'SKU-001', 1, 399.00, 'Pure cold-pressed groundnut oil'),
('Raw Wild Forest Honey',       'SKU-002', 2, 349.00, 'Natural raw honey from forests'),
('Cold-Pressed Black Sesame Oil','SKU-003',1, 449.00, 'Traditional black sesame oil'),
('Organic Turmeric Powder',     'SKU-004', 3, 199.00, 'Pure organic turmeric'),
('Red Rice',                    'SKU-005', 4, 299.00, 'Traditional hand-pounded red rice');

-- Inventory
INSERT INTO inventory (product_id, stock_qty, low_stock_alert) VALUES
(1, 5111, 50),
(2, 41,   20),
(3, 35,   20),
(4, 120,  30),
(5, 80,   25);

-- Payment settings
INSERT INTO payment_settings (method, is_enabled) VALUES
('cod',    TRUE),
('online', FALSE),
('upi',    FALSE),
('card',   FALSE);

-- Store settings
INSERT INTO store_settings (key, value) VALUES
('store_name',  'NatureNest'),
('store_email', 'admin@naturenest.com'),
('store_phone', '+91 9876543210'),
('currency',    'INR');
