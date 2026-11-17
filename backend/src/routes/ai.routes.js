const express = require('express');
const { requireApiKey } = require('../middleware/apiKeyAuth');
const { coinCharge } = require('../middleware/coinCharge');
const ctrl = require('../controllers/ai.controller');

const router = express.Router();
router.use(requireApiKey);

router.post('/chat', coinCharge('ai.chat'), ctrl.chat);
router.post('/generate', coinCharge('ai.generate'), ctrl.generate);
router.post('/translate', coinCharge('ai.translate'), ctrl.translate);
router.post('/summarize', coinCharge('ai.summarize'), ctrl.summarize);
router.post('/image', coinCharge('ai.image'), ctrl.image);
router.post('/tts', coinCharge('ai.tts'), ctrl.tts);
router.post('/stt', coinCharge('ai.stt'), ctrl.stt);

module.exports = router;
