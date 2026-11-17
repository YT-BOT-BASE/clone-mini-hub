const nodemailer = require('nodemailer');
const { env } = require('../config/env');

function getTransporter() {
  if (!env.smtp.host || !env.smtp.user || !env.smtp.pass) return null;
  return nodemailer.createTransport({
    host: env.smtp.host,
    port: env.smtp.port,
    secure: env.smtp.port === 465,
    auth: { user: env.smtp.user, pass: env.smtp.pass },
  });
}

async function sendMail({ to, subject, html, text }) {
  const transporter = getTransporter();
  if (!transporter) {
    console.warn(`[Email] SMTP not configured - skipping email to ${to}: ${subject}`);
    return { skipped: true };
  }
  return transporter.sendMail({ from: env.smtp.from, to, subject, html, text });
}

async function sendVerificationEmail(user, token) {
  const url = `${env.clientUrl}/verify-email?token=${token}`;
  return sendMail({
    to: user.email,
    subject: 'Verify your CLONE MINI HUB account',
    text: `Verify your account: ${url}`,
    html: `<h2>CLONE MINI HUB</h2><p>Hi ${user.name},</p><p>Verify your email:</p><a href="${url}">${url}</a><p>Token expires in 24 hours.</p>`,
  });
}

async function sendResetEmail(user, token) {
  const url = `${env.clientUrl}/reset-password?token=${token}`;
  return sendMail({
    to: user.email,
    subject: 'Reset your CLONE MINI HUB password',
    text: `Reset your password: ${url}`,
    html: `<h2>CLONE MINI HUB</h2><p>Hi ${user.name},</p><p>Reset your password:</p><a href="${url}">${url}</a><p>Token expires in 1 hour.</p>`,
  });
}

module.exports = { sendMail, sendVerificationEmail, sendResetEmail };
