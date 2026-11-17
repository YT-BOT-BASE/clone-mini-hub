const mongoose = require('mongoose');
const crypto = require('crypto');

const sessionSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  refreshTokenHash: { type: String, required: true, unique: true, index: true },
  userAgent: { type: String, default: '' },
  ip: { type: String, default: '' },
  expiresAt: { type: Date, required: true, index: { expires: 0 } },
}, { timestamps: true });

sessionSchema.statics.hashToken = (token) => crypto.createHash('sha256').update(token).digest('hex');

module.exports = mongoose.model('Session', sessionSchema);
