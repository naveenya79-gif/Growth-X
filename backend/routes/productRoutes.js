const express = require('express');
const router = express.Router();
const {
	getProducts,
	getProductById,
	createProduct,
	getMyProducts,
	updateProduct,
	deleteProduct
} = require('../controllers/productController');
const { protect, admin } = require('../middleware/authMiddleware');

// Public routes
router.route('/').get(getProducts).post(protect, admin, createProduct);

// Private/Admin seller routes. Keep this before /:id so it is not treated as an ID.
router.route('/my-products').get(protect, admin, getMyProducts);
router.route('/:id').get(getProductById).put(protect, admin, updateProduct).delete(protect, admin, deleteProduct);

module.exports = router;
