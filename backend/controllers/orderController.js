const Order = require('../models/Order');
const Payment = require('../models/Payment');

// @desc    Create new order and simulate payment
// @route   POST /api/orders
// @access  Private
const addOrderItems = async (req, res) => {
  try {
    const { orderItems, totalAmount } = req.body || {};

    if (!orderItems || orderItems.length === 0) {
      return res.status(400).json({ message: 'No order items' });
    }

    const order = new Order({
      orderItems,
      user: req.user._id,
      totalAmount: totalAmount || 0,
      status: 'Pending'
    });

    const createdOrder = await order.save();

    // Payment Simulation Engine
    // Probabilities: 60% Success, 10% Card Expired, 10% Insufficient Balance, 10% Bank Declined, 10% Network Error
    const scenarios = [
      { status: 'Success', reason: null },
      { status: 'Success', reason: null },
      { status: 'Success', reason: null },
      { status: 'Success', reason: null },
      { status: 'Success', reason: null },
      { status: 'Success', reason: null },
      { status: 'Failed', reason: 'Card Expired' },
      { status: 'Failed', reason: 'Insufficient Balance' },
      { status: 'Failed', reason: 'Bank Declined' },
      { status: 'Failed', reason: 'Network Error' }
    ];

    const randomScenario = scenarios[Math.floor(Math.random() * scenarios.length)];

    // Create payment record
    const payment = new Payment({
      orderId: createdOrder._id,
      customerId: req.user._id,
      amount: totalAmount || 0,
      status: randomScenario.status,
      failureReason: randomScenario.reason
    });

    await payment.save();

    // Update order status based on payment
    createdOrder.status = randomScenario.status === 'Success' ? 'Paid' : 'Failed';
    await createdOrder.save();

    res.status(201).json({
      order: createdOrder,
      paymentStatus: randomScenario.status,
      failureReason: randomScenario.reason
    });
  } catch (error) {
    res.status(500).json({ message: 'Error creating order', error: error.message });
  }
};

// @desc    Get order by ID
// @route   GET /api/orders/:id
// @access  Private
const getOrderById = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id).populate('user', 'name email');
    if (order) {
      res.json(order);
    } else {
      res.status(404).json({ message: 'Order not found' });
    }
  } catch (error) {
    if (error.name === 'CastError') {
      return res.status(404).json({ message: 'Order not found' });
    }
    res.status(500).json({ message: 'Error fetching order', error: error.message });
  }
};

module.exports = { addOrderItems, getOrderById };
