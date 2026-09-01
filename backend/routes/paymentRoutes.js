const express = require('express');
const router = express.Router();
const {
  createRazorpayOrder,
  verifyRazorpayPayment,
  getRevenueRisk,
} = require('../controllers/paymentController');
const { protect, admin } = require('../middleware/authMiddleware');

// Razorpay payment routes
router.post('/create-order', protect, createRazorpayOrder);
router.post('/verify', protect, verifyRazorpayPayment);

// Revenue risk (Admin)
router.get('/revenue-risk', protect, admin, getRevenueRisk);

module.exports = router;
