const { URL } = require('url');

/**
 * Parse request body (JSON) — replaces express.json()
 */
const parseBody = (req) =>
  new Promise((resolve, reject) => {
    let raw = '';
    req.on('data', chunk => { raw += chunk.toString(); });
    req.on('end', () => {
      try {
        resolve(raw ? JSON.parse(raw) : {});
      } catch {
        resolve({});
      }
    });
    req.on('error', reject);
  });

/**
 * Parse query string from URL — e.g. ?search=honey&status=low
 */
const parseQuery = (req) => {
  const base = `http://localhost`;
  const url  = new URL(req.url, base);
  const query = {};
  url.searchParams.forEach((val, key) => { query[key] = val; });
  return query;
};

/**
 * Get clean pathname without query string — e.g. /api/products/5
 */
const getPathname = (req) => {
  const base = `http://localhost`;
  return new URL(req.url, base).pathname;
};

module.exports = { parseBody, parseQuery, getPathname };
