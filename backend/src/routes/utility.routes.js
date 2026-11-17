const express = require('express');
const multer = require('multer');
const { requireApiKey } = require('../middleware/apiKeyAuth');
const { coinCharge } = require('../middleware/coinCharge');
const ctrl = require('../controllers/utility.controller');

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 10 * 1024 * 1024 } }); // 10MB max

// Public short-url redirect
router.get('/s/:code', ctrl.shortenerRedirect);

router.get('/qr', requireApiKey, coinCharge('utility.qr'), ctrl.qr);
router.post('/shorten', requireApiKey, coinCharge('utility.shortener'), ctrl.shortenerCreate);
router.get('/metadata', requireApiKey, coinCharge('utility.metadata'), ctrl.metadata);
router.get('/screenshot', requireApiKey, coinCharge('utility.screenshot'), ctrl.screenshot);
router.post('/image/resize', requireApiKey, coinCharge('utility.imageResize'), upload.single('image'), ctrl.imageResize);
router.post('/image/convert', requireApiKey, coinCharge('utility.imageConvert'), upload.single('image'), ctrl.imageConvert);
router.post('/base64/encode', requireApiKey, coinCharge('utility.base64'), ctrl.base64Encode);
router.post('/base64/decode', requireApiKey, coinCharge('utility.base64'), ctrl.base64Decode);
router.post('/json/format', requireApiKey, coinCharge('utility.jsonFormat'), ctrl.jsonFormat);
router.get('/password', requireApiKey, coinCharge('utility.password'), ctrl.passwordGenerator);
router.get('/weather', requireApiKey, coinCharge('utility.weather'), ctrl.weather);

module.exports = router;
