const express = require('express');
const router  = express.Router();
const { getCustomers, getCustomer, createCustomer, updateCustomer, deleteCustomer } = require('../controllers/customerController');
const { authMiddleware, adminOnly } = require('../middleware/auth');

router.get('/',      authMiddleware, getCustomers);
router.get('/:id',   authMiddleware, getCustomer);
router.post('/',     authMiddleware, createCustomer);
router.put('/:id',   authMiddleware, updateCustomer);
router.delete('/:id',authMiddleware, adminOnly, deleteCustomer);

module.exports = router;
