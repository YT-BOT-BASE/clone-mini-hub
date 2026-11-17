const express = require('express');
const { requireAuth, requireAdmin } = require('../middleware/auth');
const ctrl = require('../controllers/admin.controller');

const router = express.Router();
router.use(requireAuth, requireAdmin);

router.get('/dashboard', ctrl.dashboard);
router.get('/users', ctrl.listUsers);
router.get('/users/:id/activity', ctrl.userActivity);
router.patch('/users/:id/suspend', ctrl.suspendUser);
router.patch('/users/:id/coins', ctrl.adjustCoins);
router.get('/api-keys', ctrl.listAllApiKeys);
router.get('/endpoints', ctrl.listEndpoints);
router.patch('/endpoints/:id', ctrl.updateEndpoint);
router.get('/settings', ctrl.getSettings);
router.patch('/settings', ctrl.updateSettings);
router.get('/announcements', ctrl.listAnnouncements);
router.post('/announcements', ctrl.createAnnouncement);
router.delete('/announcements/:id', ctrl.deleteAnnouncement);
router.get('/error-logs', ctrl.errorLogs);
router.get('/audit-logs', ctrl.auditLogs);

module.exports = router;
