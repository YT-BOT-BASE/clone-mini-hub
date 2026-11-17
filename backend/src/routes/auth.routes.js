const express = require('express');
const passport = require('passport');
const { body } = require('express-validator');
const { validate } = require('../middleware/validate');
const { requireAuth } = require('../middleware/auth');
const ctrl = require('../controllers/auth.controller');
const { env } = require('../config/env');

const router = express.Router();

// Google OAuth strategy (only registered when keys exist)
if (env.googleClientId && env.googleClientSecret) {
  const GoogleStrategy = require('passport-google-oauth20').Strategy;
  const User = require('../models/User');
  passport.use(new GoogleStrategy({
    clientID: env.googleClientId,
    clientSecret: env.googleClientSecret,
    callbackURL: env.googleCallbackUrl,
  }, async (accessToken, refreshToken, profile, done) => {
    try {
      let user = await User.findOne({ googleId: profile.id });
      if (!user) {
        const email = profile.emails?.[0]?.value;
        user = await User.findOne({ email });
        if (user) { user.googleId = profile.id; user.isVerified = true; await user.save(); }
        else {
          user = await User.create({
            name: profile.displayName || 'Google User',
            email, googleId: profile.id, isVerified: true,
            avatar: profile.photos?.[0]?.value || '', coins: 50,
          });
        }
      }
      done(null, user);
    } catch (e) { done(e); }
  }));
}

router.post('/register', [
  body('name').trim().notEmpty().withMessage('Name required'),
  body('email').isEmail().withMessage('Valid email required'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
], validate, ctrl.register);

router.post('/login', [
  body('email').isEmail().withMessage('Valid email required'),
  body('password').notEmpty().withMessage('Password required'),
], validate, ctrl.login);

router.post('/admin-key', [
  body('key').notEmpty().withMessage('Access key required'),
], validate, ctrl.adminKeyLogin);

router.post('/logout', ctrl.logout);
router.post('/refresh', ctrl.refresh);
router.get('/me', requireAuth, ctrl.me);
router.post('/verify-email', ctrl.verifyEmail);
router.post('/resend-verification', ctrl.resendVerification);
router.post('/forgot-password', ctrl.forgotPassword);
router.post('/reset-password', [
  body('token').notEmpty(),
  body('password').isLength({ min: 6 }),
], validate, ctrl.resetPassword);
router.post('/change-password', requireAuth, [
  body('currentPassword').notEmpty(),
  body('newPassword').isLength({ min: 6 }),
], validate, ctrl.changePassword);

if (env.googleClientId && env.googleClientSecret) {
  router.get('/google', passport.authenticate('google', { scope: ['profile', 'email'], session: false }));
  router.get('/google/callback', passport.authenticate('google', { session: false, failureRedirect: `${env.clientUrl}/login?error=google_failed` }), ctrl.googleCallback);
} else {
  router.get('/google', (req, res) => res.status(503).json({ success: false, error: { code: 'SERVICE_UNAVAILABLE', message: 'Google login is not configured. Set GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET.' } }));
}

module.exports = router;
