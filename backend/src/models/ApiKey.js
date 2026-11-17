const mongoose = require('mongoose');

const apiKeySchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  name: { type: String, required: true, trim: true, maxlength: 60 },
  prefix: { type: String, required: true, index: true }, // e.g. cmh_live_xxxx (first chars, safe to show)
  keyHash: { type: String, required: true, unique: true, index: true }, // SHA-256(pepper + fullKey), never store full key
  isActive: { type: Boolean, default: true },
  totalRequests: { type: Number, default: 0 },
  lastUsedAt: { type: Date, default: null },
  expiresAt: { type: Date, default: null },
}, { timestamps: true });

apiKeySchema.index({ user: 1, isActive: 1 });

module.exports = mongoose.model('ApiKey', apiKeySchema);
