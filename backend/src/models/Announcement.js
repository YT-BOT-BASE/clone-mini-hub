const mongoose = require('mongoose');

module.exports = mongoose.model('Announcement', new mongoose.Schema({
  title: { type: String, required: true, maxlength: 120 },
  message: { type: String, required: true },
  isActive: { type: Boolean, default: true, index: true },
}, { timestamps: true }));
