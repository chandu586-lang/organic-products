const express = require('express');
const router  = express.Router();
const { getProducts, getProduct, createProduct, updateProduct, deleteProduct } = require('../controllers/productController');
const { authMiddleware, adminOnly } = require('../middleware/auth');

router.get('/',     authMiddleware, getProducts);
router.get('/:id',  authMiddleware, getProduct);
router.post('/',    authMiddleware, adminOnly, createProduct);
router.put('/:id',  authMiddleware, adminOnly, updateProduct);
router.delete('/:id', authMiddleware, adminOnly, deleteProduct);

module.exports = router;
