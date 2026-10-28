const path = require('path');
const jwt = require('jsonwebtoken');
const { unauth, forbidden } = require('../helpers/response');
require('dotenv').config({ path: path.join(__dirname, '../../.env') });

/**
 * Verify JWT from Authorization header
 * Returns decoded user or sends 401
 */
const verifyToken = (req, res) => {
  const authHeader = req.headers['authorization'] || '';
  if (!authHeader.startsWith('Bearer ')) {
    unauth(res, 'No token provided');
    return null;
  }
  const token = authHeader.split(' ')[1];
  try {
    return jwt.verify(token, process.env.JWT_SECRET);
  } catch {
    unauth(res, 'Invalid or expired token');
    return null;
  }
};

/**
 * Require admin role
 * Returns true if admin, sends 403 otherwise
 */
const requireAdmin = (res, user) => {
  if (user?.role !== 'admin') {
    forbidden(res, 'Admin access only');
    return false;
  }
  return true;
};

module.exports = { verifyToken, requireAdmin };
