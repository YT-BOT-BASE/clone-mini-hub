const express = require('express');
const { requireApiKey } = require('../middleware/apiKeyAuth');
const { coinCharge } = require('../middleware/coinCharge');
const ctrl = require('../controllers/download.controller');

const router = express.Router();

router.get('/sources', ctrl.sources);
router.get('/info', requireApiKey, coinCharge('download.info'), ctrl.info);
router.post('/info', requireApiKey, coinCharge('download.info'), ctrl.info);

module.exports = router;
