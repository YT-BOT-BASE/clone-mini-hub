const crypto = require('crypto');
const { env } = require('../config/env');

function sha256(value) {
  return crypto.createHash('sha256').update(String(value)).digest('hex');
}

function hashApiKey(fullKey) {
  return sha256(env.apiKeyPepper + ':' + fullKey);
}

function generateApiKey() {
  const raw = crypto.randomBytes(24).toString('base64url');
  const fullKey = `cmh_live_${raw}`;
  return { fullKey, prefix: fullKey.slice(0, 16), keyHash: hashApiKey(fullKey) };
}

function randomToken(bytes = 32) {
  return crypto.randomBytes(bytes).toString('hex');
}

module.exports = { sha256, hashApiKey, generateApiKey, randomToken };
