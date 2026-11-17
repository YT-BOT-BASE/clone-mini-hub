const mongoose = require('mongoose');

const apiRequestSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null, index: true },
  apiKey: { type: mongoose.Schema.Types.ObjectId, ref: 'ApiKey', default: null, index: true },
  endpoint: { type: String, required: true, index: true },
  method: { type: String, default: 'GET' },
  statusCode: { type: Number, default: 200 },
  success: { type: Boolean, default: true, index: true },
  durationMs: { type: Number, default: 0 },
  coinsCharged: { type: Number, default: 0 },
  ip: { type: String, default: '' },
  errorMessage: { type: String, default: '' },
}, { timestamps: true });

apiRequestSchema.index({ createdAt: -1 });
apiRequestSchema.index({ user: 1, createdAt: -1 });

module.exports = mongoose.model('ApiRequest', apiRequestSchema);
