const ApiKey = require('../models/ApiKey');
const { generateApiKey } = require('../utils/hash');

exports.list = async (req, res, next) => {
  try {
    const keys = await ApiKey.find({ user: req.user._id }).sort({ createdAt: -1 }).select('-keyHash');
    res.json({ success: true, data: { keys } });
  } catch (e) { next(e); }
};

exports.create = async (req, res, next) => {
  try {
    const { name } = req.body;
    const { fullKey, prefix, keyHash } = generateApiKey();
    const apiKey = await ApiKey.create({ user: req.user._id, name: name || 'Default Key', prefix, keyHash });
    // Full key is shown ONLY once, at creation time. It is never stored.
    res.status(201).json({ success: true, data: { apiKey: { _id: apiKey._id, name: apiKey.name, prefix, isActive: true, createdAt: apiKey.createdAt }, fullKey } });
  } catch (e) { next(e); }
};

exports.revoke = async (req, res, next) => {
  try {
    const key = await ApiKey.findOne({ _id: req.params.id, user: req.user._id });
    if (!key) return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'API key not found' } });
    key.isActive = false;
    await key.save();
    res.json({ success: true, message: 'API key revoked' });
  } catch (e) { next(e); }
};

exports.regenerate = async (req, res, next) => {
  try {
    const key = await ApiKey.findOne({ _id: req.params.id, user: req.user._id });
    if (!key) return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'API key not found' } });
    const { fullKey, prefix, keyHash } = generateApiKey();
    key.prefix = prefix;
    key.keyHash = keyHash;
    key.isActive = true;
    await key.save();
    res.json({ success: true, data: { apiKey: { _id: key._id, name: key.name, prefix, isActive: true }, fullKey } });
  } catch (e) { next(e); }
};
