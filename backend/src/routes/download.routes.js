const express = require('express');
const { requireApiKey } = require('../middleware/apiKeyAuth');
const { coinCharge } = require('../middleware/coinCharge');
const ctrl = require('../controllers/download.controller');

const router = express.Router();

// Public
router.get('/sources', ctrl.sources);
router.get('/platforms', ctrl.platforms);

// One endpoint per platform (organized download APIs)
const PLATFORMS = ['youtube', 'tiktok', 'facebook', 'instagram', 'pinterest', 'twitter', 'mediafire', 'drive'];
for (const p of PLATFORMS) {
  router.get(`/${p}`, requireApiKey, coinCharge(`download.${p}`), ctrl.platform(p));
  router.post(`/${p}`, requireApiKey, coinCharge(`download.${p}`), ctrl.platform(p));
}

// All-in-one (auto detect)
router.get('/all', requireApiKey, coinCharge('download.info'), ctrl.info);
router.post('/all', requireApiKey, coinCharge('download.info'), ctrl.info);
router.get('/info', requireApiKey, coinCharge('download.info'), ctrl.info);
router.post('/info', requireApiKey, coinCharge('download.info'), ctrl.info);

module.exports = router;
