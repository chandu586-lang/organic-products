const express = require('express');
const router  = express.Router();
const { getDashboardStats, getSalesAnalytics, getCategoryAnalytics } = require('../controllers/analyticsController');
const { authMiddleware } = require('../middleware/auth');

router.get('/dashboard',  authMiddleware, getDashboardStats);
router.get('/sales',      authMiddleware, getSalesAnalytics);
router.get('/categories', authMiddleware, getCategoryAnalytics);

module.exports = router;
