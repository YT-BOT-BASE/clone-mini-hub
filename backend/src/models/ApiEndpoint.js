const mongoose = require('mongoose');

const apiEndpointSchema = new mongoose.Schema({
  key: { type: String, required: true, unique: true, index: true }, // e.g. download.youtube
  name: { type: String, required: true },
  category: { type: String, enum: ['DOWNLOAD', 'MOVIE', 'AI', 'UTILITY'], required: true, index: true },
  description: { type: String, default: '' },
  method: { type: String, default: 'GET' },
  path: { type: String, required: true },
  coinCost: { type: Number, default: 1, min: 0 },
  isEnabled: { type: Boolean, default: true, index: true },
  requiresApiKey: { type: Boolean, default: true },
}, { timestamps: true });

module.exports = mongoose.model('ApiEndpoint', apiEndpointSchema);
