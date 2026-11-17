const ApiKey = require('../models/ApiKey');
const User = require('../models/User');
const { hashApiKey } = require('../utils/hash');

// Accepts API key via X-API-Key header or ?apiKey= query (header preferred)
async function requireApiKey(req, res, next) {
  try {
    const fullKey = req.headers['x-api-key'] || req.query.apiKey;
    if (!fullKey) return res.status(401).json({ success: false, error: { code: 'API_KEY_REQUIRED', message: 'Provide X-API-Key header' } });
    const keyHash = hashApiKey(String(fullKey));
    const apiKey = await ApiKey.findOne({ keyHash, isActive: true });
    if (!apiKey) return res.status(401).json({ success: false, error: { code: 'INVALID_API_KEY', message: 'Invalid or revoked API key' } });
    if (apiKey.expiresAt && new Date(apiKey.expiresAt) < new Date()) {
      return res.status(401).json({ success: false, error: { code: 'API_KEY_EXPIRED', message: 'API key expired' } });
    }
    const user = await User.findById(apiKey.user);
    if (!user) return res.status(401).json({ success: false, error: { code: 'INVALID_API_KEY', message: 'API key owner not found' } });
    if (user.isSuspended) return res.status(403).json({ success: false, error: { code: 'ACCOUNT_SUSPENDED', message: 'Account suspended' } });
    req.apiKey = apiKey;
    req.user = user;
    // fire-and-forget usage update
    ApiKey.updateOne({ _id: apiKey._id }, { $inc: { totalRequests: 1 }, $set: { lastUsedAt: new Date() } }).catch(() => {});
    next();
  } catch (e) {
    next(e);
  }
}

module.exports = { requireApiKey };
