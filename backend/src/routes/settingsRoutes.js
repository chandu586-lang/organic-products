const express = require('express');
const router  = express.Router();
const { getStoreSettings, updateStoreSettings, getPaymentSettings, updatePaymentSetting, getCategories } = require('../controllers/settingsController');
const { authMiddleware, adminOnly } = require('../middleware/auth');

router.get('/store',               authMiddleware, getStoreSettings);
router.put('/store',               authMiddleware, adminOnly, updateStoreSettings);
router.get('/payment',             authMiddleware, getPaymentSettings);
router.put('/payment/:method',     authMiddleware, adminOnly, updatePaymentSetting);
router.get('/categories',          authMiddleware, getCategories);

module.exports = router;
