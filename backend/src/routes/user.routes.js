const express = require('express');
const { requireAuth } = require('../middleware/auth');
const ctrl = require('../controllers/user.controller');

const router = express.Router();
router.use(requireAuth);

router.patch('/profile', ctrl.updateProfile);
router.post('/daily-bonus', ctrl.claimDailyBonus);
router.get('/wallet', ctrl.getWallet);
router.get('/transactions', ctrl.getTransactions);
router.get('/requests', ctrl.getMyRequests);
router.get('/stats', ctrl.getMyStats);

module.exports = router;
