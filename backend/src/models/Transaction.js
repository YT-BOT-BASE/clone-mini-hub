const mongoose = require('mongoose');

const transactionSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  type: { type: String, enum: ['SIGNUP_BONUS', 'DAILY_BONUS', 'API_USAGE', 'REFUND', 'ADMIN_ADJUST', 'PURCHASE'], required: true },
  amount: { type: Number, required: true }, // negative for spend
  balanceAfter: { type: Number, required: true },
  description: { type: String, default: '' },
  apiEndpoint: { type: String, default: '' },
  requestId: { type: String, default: '', index: true },
}, { timestamps: true });

transactionSchema.index({ user: 1, createdAt: -1 });

module.exports = mongoose.model('Transaction', transactionSchema);
