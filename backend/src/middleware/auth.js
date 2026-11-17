const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const User = require('../models/User');
const { env } = require('../config/env');

function signAccessToken(user) {
  return jwt.sign({ sub: user._id.toString(), role: user.role }, env.jwtAccessSecret, { expiresIn: env.jwtAccessExpires });
}
function signRefreshToken(user) {
  // jti makes every refresh token unique even within the same second
  return jwt.sign({ sub: user._id.toString(), role: user.role }, env.jwtRefreshSecret, {
    expiresIn: env.jwtRefreshExpires,
    jwtid: crypto.randomBytes(12).toString('hex'),
  });
}

async function requireAuth(req, res, next) {
  try {
    const header = req.headers.authorization || '';
    const token = header.startsWith('Bearer ') ? header.slice(7) : null;
    if (!token) return res.status(401).json({ success: false, error: { code: 'UNAUTHORIZED', message: 'Login required' } });
    const payload = jwt.verify(token, env.jwtAccessSecret);
    const user = await User.findById(payload.sub);
    if (!user) return res.status(401).json({ success: false, error: { code: 'UNAUTHORIZED', message: 'User not found' } });
    if (user.isSuspended) return res.status(403).json({ success: false, error: { code: 'ACCOUNT_SUSPENDED', message: 'Your account is suspended' } });
    req.user = user;
    next();
  } catch (e) {
    return res.status(401).json({ success: false, error: { code: 'INVALID_TOKEN', message: 'Invalid or expired token' } });
  }
}

function requireAdmin(req, res, next) {
  if (!req.user || req.user.role !== 'ADMIN') {
    return res.status(403).json({ success: false, error: { code: 'FORBIDDEN', message: 'Admin access required' } });
  }
  next();
}

module.exports = { signAccessToken, signRefreshToken, requireAuth, requireAdmin };
