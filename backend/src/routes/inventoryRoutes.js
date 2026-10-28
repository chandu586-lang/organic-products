const express = require('express');
const router  = express.Router();
const { getInventory, addStock, updateStock, getInventoryLogs, getInventoryStats } = require('../controllers/inventoryController');
const { authMiddleware, adminOnly } = require('../middleware/auth');

router.get('/',                        authMiddleware, getInventory);
router.get('/stats',                   authMiddleware, getInventoryStats);
router.get('/logs',                    authMiddleware, getInventoryLogs);
router.post('/:productId/add-stock',   authMiddleware, addStock);
router.put('/:productId/update',       authMiddleware, adminOnly, updateStock);

module.exports = router;
