const Razorpay = require('razorpay');
const crypto = require('crypto');
const Payment = require('../models/Payment');
const Order = require('../models/Order');

// Initialize Razorpay instance
const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

// @desc    Create a Razorpay order
// @route   POST /api/payment/create-order
// @access  Private
const createRazorpayOrder = async (req, res) => {
  try {
    const { amount, currency = 'INR', notes } = req.body;

    if (!amount || amount <= 0) {
      return res.status(400).json({ message: 'Invalid amount' });
    }

    // Demo bypass 
    if (process.env.RAZORPAY_KEY_SECRET === 'demo_secret_bypass') {
      return res.status(201).json({
        success: true,
        orderId: 'order_demo_' + Date.now(),
        amount: Math.round(amount * 100),
        currency,
        keyId: process.env.RAZORPAY_KEY_ID,
      });
    }

    const options = {
      amount: Math.round(amount * 100), // Razorpay expects paise (integer)
      currency,
      receipt: `receipt_${Date.now()}`,
      notes: notes || {},
    };

    const razorpayOrder = await razorpay.orders.create(options);

    res.status(201).json({
      success: true,
      orderId: razorpayOrder.id,
      amount: razorpayOrder.amount,
      currency: razorpayOrder.currency,
      keyId: process.env.RAZORPAY_KEY_ID,
    });
  } catch (error) {
    console.error('Razorpay create order error:', error);
    res.status(500).json({ message: 'Failed to create payment order', error: error.message });
  }
};

// @desc    Verify Razorpay payment signature and save order
// @route   POST /api/payment/verify
// @access  Private
const verifyRazorpayPayment = async (req, res) => {
  try {
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      orderItems,
      totalAmount,
      shippingAddress,
      paymentMethod,
    } = req.body;

    // 1. Verify signature
    if (process.env.RAZORPAY_KEY_SECRET !== 'demo_secret_bypass') {
      const body = razorpay_order_id + '|' + razorpay_payment_id;
      const expectedSignature = crypto
        .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
        .update(body)
        .digest('hex');

      if (expectedSignature !== razorpay_signature) {
        return res.status(400).json({ success: false, message: 'Invalid payment signature' });
      }
    }

    // 2. Create Order record
    const order = new Order({
      orderItems,
      user: req.user._id,
      totalAmount: totalAmount || 0,
      shippingAddress,
      paymentMethod: paymentMethod || 'razorpay',
      status: 'Paid',
    });
    const createdOrder = await order.save();

    // 3. Create Payment record
    const payment = new Payment({
      orderId: createdOrder._id,
      customerId: req.user._id,
      amount: totalAmount || 0,
      status: 'Success',
      razorpayOrderId: razorpay_order_id,
      razorpayPaymentId: razorpay_payment_id,
      razorpaySignature: razorpay_signature,
    });
    await payment.save();

    res.status(201).json({
      success: true,
      orderId: createdOrder._id,
      paymentStatus: 'Success',
    });
  } catch (error) {
    console.error('Razorpay verify error:', error);
    res.status(500).json({ message: 'Payment verification failed', error: error.message });
  }
};

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

module.exports = { createRazorpayOrder, verifyRazorpayPayment, getRevenueRisk };
