const mongoose = require('mongoose');

const platformSettingsSchema = new mongoose.Schema({
  key: { type: String, required: true, unique: true },
  value: { type: mongoose.Schema.Types.Mixed, default: null },
}, { timestamps: true });

platformSettingsSchema.statics.get = async function (key, fallback = null) {
  const doc = await this.findOne({ key });
  return doc ? doc.value : fallback;
};
platformSettingsSchema.statics.set = async function (key, value) {
  return this.findOneAndUpdate({ key }, { value }, { upsert: true, new: true });
};

module.exports = mongoose.model('PlatformSettings', platformSettingsSchema);
