const express = require('express');
const { requireApiKey } = require('../middleware/apiKeyAuth');
const { coinCharge } = require('../middleware/coinCharge');
const ctrl = require('../controllers/movie.controller');

const router = express.Router();
router.use(requireApiKey);

router.get('/search', coinCharge('movie.search'), ctrl.search);
router.get('/trending', coinCharge('movie.trending'), ctrl.trending);
router.get('/:type/:id', coinCharge('movie.details'), ctrl.details);
router.get('/tv/:tvId/episodes', coinCharge('movie.episodes'), ctrl.episodes);

module.exports = router;
