const mongoose = require('mongoose');

module.exports = mongoose.model('ShortUrl', new mongoose.Schema({
  code: { type: String, required: true, unique: true, index: true },
  originalUrl: { type: String, required: true },
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null, index: true },
  clicks: { type: Number, default: 0 },
}, { timestamps: true }));
