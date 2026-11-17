const express = require('express');
const { body } = require('express-validator');
const { validate } = require('../middleware/validate');
const { requireAuth } = require('../middleware/auth');
const ctrl = require('../controllers/apiKey.controller');

const router = express.Router();
router.use(requireAuth);

router.get('/', ctrl.list);
router.post('/', [body('name').optional().trim().isLength({ max: 60 })], validate, ctrl.create);
router.patch('/:id/revoke', ctrl.revoke);
router.patch('/:id/regenerate', ctrl.regenerate);

module.exports = router;
