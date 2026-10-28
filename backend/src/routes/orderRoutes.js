const express = require('express');
const router  = express.Router();
const { getOrders, getOrder, createOrder, updateOrderStatus, getOrderStats } = require('../controllers/orderController');
const { authMiddleware, adminOnly } = require('../middleware/auth');

router.get('/stats',    authMiddleware, getOrderStats);
router.get('/',         authMiddleware, getOrders);
router.get('/:id',      authMiddleware, getOrder);
router.post('/',        authMiddleware, createOrder);
router.put('/:id/status', authMiddleware, adminOnly, updateOrderStatus);

module.exports = router;
