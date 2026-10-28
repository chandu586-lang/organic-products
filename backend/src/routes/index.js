const { parseBody, parseQuery, getPathname } = require('../helpers/request');
const { sendJSON, notFound } = require('../helpers/response');

// ── Import all controllers ────────────────────────────────────
const auth      = require('../controllers/authController');
const product   = require('../controllers/productController');
const inventory = require('../controllers/inventoryController');
const order     = require('../controllers/orderController');
const customer  = require('../controllers/customerController');
const analytics = require('../controllers/analyticsController');
const settings  = require('../controllers/settingsController');

/**
 * Match a URL pattern like /api/products/:id against a real pathname
 * Returns extracted params object or null if no match
 */
const matchRoute = (pattern, pathname) => {
  const patternParts  = pattern.split('/');
  const pathnameParts = pathname.split('/');
  if (patternParts.length !== pathnameParts.length) return null;
  const params = {};
  for (let i = 0; i < patternParts.length; i++) {
    if (patternParts[i].startsWith(':')) {
      params[patternParts[i].slice(1)] = pathnameParts[i];
    } else if (patternParts[i] !== pathnameParts[i]) {
      return null;
    }
  }
  return params;
};

/**
 * Route table — [ METHOD, PATTERN, handler ]
 */
const routes = [
  // Health
  ['GET',    '/api/health',                          (req, res) => sendJSON(res, 200, { success: true, message: 'NatureNest API is running ✅', time: new Date().toISOString() })],

  // Auth
  ['POST',   '/api/auth/signup',                     (req, res, p, q, b) => auth.signup(req, res, b)],
  ['POST',   '/api/auth/login',                      (req, res, p, q, b) => auth.login(req, res, b)],
  ['GET',    '/api/auth/me',                         (req, res)          => auth.getMe(req, res)],
  ['GET',    '/api/auth/workers',                    (req, res)          => auth.getWorkers(req, res)],
  ['POST',   '/api/auth/register',                   (req, res, p, q, b) => auth.registerWorker(req, res, b)],

  // Products
  ['GET',    '/api/products',                        (req, res, p, q)    => product.getProducts(req, res, p, q)],
  ['GET',    '/api/products/:id',                    (req, res, p)       => product.getProduct(req, res, p)],
  ['POST',   '/api/products',                        (req, res, p, q, b) => product.createProduct(req, res, p, q, b)],
  ['PUT',    '/api/products/:id',                    (req, res, p, q, b) => product.updateProduct(req, res, p, q, b)],
  ['DELETE', '/api/products/:id',                    (req, res, p)       => product.deleteProduct(req, res, p)],

  // Inventory
  ['GET',    '/api/inventory',                       (req, res, p, q)    => inventory.getInventory(req, res, p, q)],
  ['GET',    '/api/inventory/stats',                 (req, res)          => inventory.getInventoryStats(req, res)],
  ['GET',    '/api/inventory/logs',                  (req, res)          => inventory.getInventoryLogs(req, res)],
  ['POST',   '/api/inventory/:productId/add-stock',  (req, res, p, q, b) => inventory.addStock(req, res, p, q, b)],
  ['PUT',    '/api/inventory/:productId/update',     (req, res, p, q, b) => inventory.updateStock(req, res, p, q, b)],

  // Orders
  ['GET',    '/api/orders/stats',                    (req, res)          => order.getOrderStats(req, res)],
  ['GET',    '/api/orders',                          (req, res, p, q)    => order.getOrders(req, res, p, q)],
  ['GET',    '/api/orders/:id',                      (req, res, p)       => order.getOrder(req, res, p)],
  ['POST',   '/api/orders',                          (req, res, p, q, b) => order.createOrder(req, res, p, q, b)],
  ['PUT',    '/api/orders/:id/status',               (req, res, p, q, b) => order.updateOrderStatus(req, res, p, q, b)],

  // Customers
  ['GET',    '/api/customers',                       (req, res, p, q)    => customer.getCustomers(req, res, p, q)],
  ['GET',    '/api/customers/:id',                   (req, res, p)       => customer.getCustomer(req, res, p)],
  ['POST',   '/api/customers',                       (req, res, p, q, b) => customer.createCustomer(req, res, p, q, b)],
  ['PUT',    '/api/customers/:id',                   (req, res, p, q, b) => customer.updateCustomer(req, res, p, q, b)],
  ['DELETE', '/api/customers/:id',                   (req, res, p)       => customer.deleteCustomer(req, res, p)],

  // Analytics
  ['GET',    '/api/analytics/dashboard',             (req, res)          => analytics.getDashboardStats(req, res)],
  ['GET',    '/api/analytics/sales',                 (req, res, p, q)    => analytics.getSalesAnalytics(req, res, p, q)],
  ['GET',    '/api/analytics/categories',            (req, res)          => analytics.getCategoryAnalytics(req, res)],

  // Settings
  ['GET',    '/api/settings/store',                  (req, res)          => settings.getStoreSettings(req, res)],
  ['PUT',    '/api/settings/store',                  (req, res, p, q, b) => settings.updateStoreSettings(req, res, p, q, b)],
  ['GET',    '/api/settings/payment',                (req, res)          => settings.getPaymentSettings(req, res)],
  ['PUT',    '/api/settings/payment/:method',        (req, res, p, q, b) => settings.updatePaymentSetting(req, res, p, q, b)],
  ['GET',    '/api/settings/categories',             (req, res)          => settings.getCategories(req, res)],
];

/**
 * Main router — called by server.js for every request
 */
const router = async (req, res) => {
  const method   = req.method.toUpperCase();
  const pathname = getPathname(req);
  const query    = parseQuery(req);

  // Handle OPTIONS preflight (CORS)
  if (method === 'OPTIONS') {
    res.writeHead(204);
    res.end();
    return;
  }

  // Match route
  for (const [routeMethod, pattern, handler] of routes) {
    if (routeMethod !== method) continue;
    const params = matchRoute(pattern, pathname);
    if (params !== null) {
      const body = (method === 'POST' || method === 'PUT' || method === 'PATCH')
        ? await parseBody(req)
        : {};
      try {
        await handler(req, res, params, query, body);
      } catch (err) {
        console.error('❌ Unhandled route error:', err.message);
        sendJSON(res, 500, { success: false, message: 'Internal server error' });
      }
      return;
    }
  }

  // No route matched
  notFound(res, `Route ${method} ${pathname} not found`);
};

module.exports = router;
