/**
 * NatureNest Backend — Pure Node.js HTTP Server
 * No Express.js. Uses only built-in 'http' module + pg, bcryptjs, jsonwebtoken, dotenv
 */
const http = require('http');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });

// DB connection check on startup
require('./src/config/db');

// Main router
const router = require('./src/routes/index');

// ── CORS headers added to every response ─────────────────────
const ALLOWED_ORIGIN = process.env.FRONTEND_URL || 'http://localhost:5173';

const server = http.createServer(async (req, res) => {
  // Set CORS headers on every response
  const requestOrigin = req.headers.origin;
  const allowedOrigin =
    requestOrigin && /^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(requestOrigin)
      ? requestOrigin
      : ALLOWED_ORIGIN;
  res.setHeader('Access-Control-Allow-Origin', allowedOrigin);
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.setHeader('Access-Control-Allow-Credentials', 'true');

  // Handle preflight
  if (req.method === 'OPTIONS') {
    res.writeHead(204);
    res.end();
    return;
  }

  // Pass to router
  try {
    await router(req, res);
  } catch (err) {
    console.error('❌ Server error:', err.message);
    res.writeHead(500, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ success: false, message: 'Internal server error' }));
  }
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log('\n🚀 NatureNest API running on http://localhost:' + PORT);
  console.log('📋 Health check: http://localhost:' + PORT + '/api/health\n');
});

server.on('error', (err) => {
  if (err.code === 'EADDRINUSE') {
    console.error(`❌ Port ${PORT} is already in use. Stop the other server first.`);
  } else {
    console.error('❌ Server error:', err.message);
  }
  process.exit(1);
});
