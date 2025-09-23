const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  course: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Course',
    required: true
  },
  amount: {
    type: Number,
    required: true
  },
  paidAt: {
    type: Date,
    default: Date.now
  },
  method: {
    type: String,
    enum: ['credit_card', 'paypal', 'stripe'],
    default: 'stripe'
  },
  status: {
    type: String,
    enum: ['success', 'pending', 'failed'],
    default: 'success'
  }
});

module.exports = mongoose.model('Payment', paymentSchema);
