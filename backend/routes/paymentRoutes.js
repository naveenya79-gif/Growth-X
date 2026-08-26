const express = require('express');
const router = express.Router();
const { getRevenueRisk } = require('../controllers/paymentController');
const { protect, admin } = require('../middleware/authMiddleware');

router.route('/').get(protect, admin, getRevenueRisk);

module.exports = router;
