const express = require('express');
const router = express.Router();
const { getProducts, getProductById, createProduct } = require('../controllers/productController');
const { protect, admin } = require('../middleware/authMiddleware');

// Public routes
router.route('/').get(getProducts);
router.route('/:id').get(getProductById);

// Private/Admin routes
router.route('/').post(protect, admin, createProduct);

module.exports = router;
