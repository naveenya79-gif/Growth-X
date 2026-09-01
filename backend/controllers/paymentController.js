const Payment = require('../models/Payment');

// @desc    Get all failed payments (Revenue Risk)
// @route   GET /api/revenue-risk
// @access  Private/Admin
const getRevenueRisk = async (req, res) => {
  try {
    const failedPayments = await Payment.find({ status: 'Failed' })
      .populate('customerId', 'name email')
      .sort({ createdAt: -1 });

    res.json(failedPayments);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching revenue risk data', error: error.message });
  }
};

module.exports = { getRevenueRisk };
