const PlatformSettings = require('../models/PlatformSettings');

async function maintenanceMode(req, res, next) {
  try {
    const enabled = await PlatformSettings.get('maintenanceMode', false);
    const isAdmin = req.user && req.user.role === 'ADMIN';
    const isHealth = req.path === '/health' || req.path === '/status';
    if (enabled && !isAdmin && !isHealth) {
      return res.status(503).json({ success: false, error: { code: 'MAINTENANCE', message: 'CLONE MINI HUB is under maintenance. Please try again later.' } });
    }
    next();
  } catch { next(); }
}

module.exports = { maintenanceMode };
