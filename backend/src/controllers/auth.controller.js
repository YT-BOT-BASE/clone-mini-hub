const crypto = require('crypto');
const User = require('../models/User');
const Session = require('../models/Session');
const Transaction = require('../models/Transaction');
const { signAccessToken, signRefreshToken } = require('../middleware/auth');
const { sha256, randomToken } = require('../utils/hash');
const { sendVerificationEmail, sendResetEmail } = require('../services/email.service');
const coinService = require('../services/coin.service');
const { env } = require('../config/env');

function setRefreshCookie(req, res, refreshToken) {
  res.cookie('refreshToken', refreshToken, {
    httpOnly: true,
    secure: env.nodeEnv === 'production',
    sameSite: 'lax',
    path: '/api/auth',
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });
}

async function issueSession(req, res, user) {
  const refreshToken = signRefreshToken(user);
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
  await Session.create({
    user: user._id,
    refreshTokenHash: Session.hashToken(refreshToken),
    userAgent: req.headers['user-agent'] || '',
    ip: req.ip,
    expiresAt,
  });
  setRefreshCookie(req, res, refreshToken);
  return { accessToken: signAccessToken(user) };
}

exports.register = async (req, res, next) => {
  try {
    const { name, email, password } = req.body;
    const existing = await User.findOne({ email: email.toLowerCase() });
    if (existing) return res.status(409).json({ success: false, error: { code: 'EMAIL_EXISTS', message: 'Email already registered' } });

    const startingCoins = await coinService.getStartingCoins();
    const user = await User.create({ name, email: email.toLowerCase(), password, coins: startingCoins });
    await Transaction.create({ user: user._id, type: 'SIGNUP_BONUS', amount: startingCoins, balanceAfter: startingCoins, description: 'Welcome bonus' });

    const token = randomToken();
    user.verifyTokenHash = sha256(token);
    user.verifyTokenExpires = new Date(Date.now() + 24 * 60 * 60 * 1000);
    await user.save();
    sendVerificationEmail(user, token).catch(() => {});

    const { accessToken } = await issueSession(req, res, user);
    res.status(201).json({ success: true, data: { user: user.toSafeJSON(), accessToken } });
  } catch (e) { next(e); }
};

exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user || !(await user.comparePassword(password))) {
      return res.status(401).json({ success: false, error: { code: 'INVALID_CREDENTIALS', message: 'Invalid email or password' } });
    }
    if (user.isSuspended) return res.status(403).json({ success: false, error: { code: 'ACCOUNT_SUSPENDED', message: 'Account suspended' } });
    const { accessToken } = await issueSession(req, res, user);
    res.json({ success: true, data: { user: user.toSafeJSON(), accessToken } });
  } catch (e) { next(e); }
};

exports.logout = async (req, res, next) => {
  try {
    const token = req.cookies?.refreshToken;
    if (token) await Session.deleteOne({ refreshTokenHash: Session.hashToken(token) });
    res.clearCookie('refreshToken', { path: '/api/auth' });
    res.json({ success: true, message: 'Logged out' });
  } catch (e) { next(e); }
};

exports.refresh = async (req, res, next) => {
  try {
    const token = req.cookies?.refreshToken;
    if (!token) return res.status(401).json({ success: false, error: { code: 'NO_REFRESH_TOKEN', message: 'Refresh token required' } });
    const session = await Session.findOne({ refreshTokenHash: Session.hashToken(token) });
    if (!session || session.expiresAt < new Date()) {
      return res.status(401).json({ success: false, error: { code: 'INVALID_SESSION', message: 'Session expired. Please login again.' } });
    }
    const user = await User.findById(session.user);
    if (!user || user.isSuspended) return res.status(401).json({ success: false, error: { code: 'INVALID_SESSION', message: 'Invalid session' } });
    // Rotate refresh token
    await Session.deleteOne({ _id: session._id });
    const { accessToken } = await issueSession(req, res, user);
    res.json({ success: true, data: { user: user.toSafeJSON(), accessToken } });
  } catch (e) { next(e); }
};

exports.me = async (req, res) => {
  res.json({ success: true, data: { user: req.user.toSafeJSON() } });
};

exports.verifyEmail = async (req, res, next) => {
  try {
    const { token } = req.body;
    const user = await User.findOne({ verifyTokenHash: sha256(token), verifyTokenExpires: { $gt: new Date() } });
    if (!user) return res.status(400).json({ success: false, error: { code: 'INVALID_TOKEN', message: 'Invalid or expired verification token' } });
    user.isVerified = true;
    user.verifyTokenHash = null;
    user.verifyTokenExpires = null;
    await user.save();
    res.json({ success: true, message: 'Email verified successfully' });
  } catch (e) { next(e); }
};

exports.resendVerification = async (req, res, next) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email: email.toLowerCase() });
    if (user && !user.isVerified) {
      const token = randomToken();
      user.verifyTokenHash = sha256(token);
      user.verifyTokenExpires = new Date(Date.now() + 24 * 60 * 60 * 1000);
      await user.save();
      sendVerificationEmail(user, token).catch(() => {});
    }
    res.json({ success: true, message: 'If the email exists and is unverified, a new verification link was sent.' });
  } catch (e) { next(e); }
};

exports.forgotPassword = async (req, res, next) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email: email.toLowerCase() });
    if (user) {
      const token = randomToken();
      user.resetTokenHash = sha256(token);
      user.resetTokenExpires = new Date(Date.now() + 60 * 60 * 1000);
      await user.save();
      sendResetEmail(user, token).catch(() => {});
    }
    res.json({ success: true, message: 'If an account exists for that email, a reset link was sent.' });
  } catch (e) { next(e); }
};

exports.resetPassword = async (req, res, next) => {
  try {
    const { token, password } = req.body;
    const user = await User.findOne({ resetTokenHash: sha256(token), resetTokenExpires: { $gt: new Date() } });
    if (!user) return res.status(400).json({ success: false, error: { code: 'INVALID_TOKEN', message: 'Invalid or expired reset token' } });
    user.password = password;
    user.resetTokenHash = null;
    user.resetTokenExpires = null;
    await user.save();
    await Session.deleteMany({ user: user._id }); // logout everywhere
    res.json({ success: true, message: 'Password reset successfully. Please login again.' });
  } catch (e) { next(e); }
};

exports.changePassword = async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body;
    if (!(await req.user.comparePassword(currentPassword))) {
      return res.status(400).json({ success: false, error: { code: 'WRONG_PASSWORD', message: 'Current password is incorrect' } });
    }
    req.user.password = newPassword;
    await req.user.save();
    res.json({ success: true, message: 'Password changed successfully' });
  } catch (e) { next(e); }
};

// Google OAuth callback - passport redirects here, we issue our own JWT session
exports.googleCallback = async (req, res, next) => {
  try {
    const user = req.user;
    const { accessToken } = await issueSession(req, res, user);
    const redirect = `${env.clientUrl}/auth/callback?token=${accessToken}`;
    res.redirect(redirect);
  } catch (e) { next(e); }
};

// Hidden Admin Key login (no email/password needed on the website).
// Accepts the configured ADMIN_KEY and the master keys.
exports.adminKeyLogin = async (req, res, next) => {
  try {
    const { key } = req.body;
    const validKeys = new Set([env.adminKey, 'Shanuwa141109', '141109'].filter(Boolean));
    if (!validKeys.has(String(key))) {
      return res.status(401).json({ success: false, error: { code: 'INVALID_ADMIN_KEY', message: 'Invalid access key' } });
    }
    let admin = await User.findOne({ role: 'ADMIN' });
    if (!admin) {
      admin = await User.create({
        name: 'CLONE SHANUWA',
        email: 'admin@cloneminHub.lk',
        password: crypto.randomBytes(24).toString('hex'),
        role: 'ADMIN',
        isVerified: true,
        coins: 9999,
      });
    }
    if (admin.isSuspended) {
      admin.isSuspended = false;
      await admin.save();
    }
    const { accessToken } = await issueSession(req, res, admin);
    res.json({ success: true, data: { user: admin.toSafeJSON(), accessToken } });
  } catch (e) { next(e); }
};
