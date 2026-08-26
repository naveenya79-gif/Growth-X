const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema({
  orderId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'Order'
  },
  customerId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'User'
  },
  amount: {
    type: Number,
    required: true
  },
  status: {
    type: String,
    required: true,
    enum: ['Success', 'Failed']
  },
  failureReason: {
    type: String,
    enum: ['Card Expired', 'Insufficient Balance', 'Bank Declined', 'Network Error', null],
    default: null
  }
}, {
  timestamps: true
});

const Payment = mongoose.model('Payment', paymentSchema);

module.exports = Payment;
