const express = require('express');
const router = express.Router();
const { authAdmin, getDashboardStats } = require('../controllers/userController');
const { protect, admin } = require('../middleware/authMiddleware');

router.post('/login', authAdmin);
router.get('/dashboard', protect, admin, getDashboardStats);

module.exports = router;
