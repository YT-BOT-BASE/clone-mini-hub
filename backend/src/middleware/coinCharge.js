const ApiEndpoint = require('../models/ApiEndpoint');
const ApiRequest = require('../models/ApiRequest');
const coinService = require('../services/coin.service');
const crypto = require('crypto');

// Usage: coinCharge('download.youtube') - charges coins BEFORE handler, refunds on failure.
function coinCharge(endpointKey) {
  return async (req, res, next) => {
    const startedAt = Date.now();
    const requestId = crypto.randomUUID();
    req.requestId = requestId;
    let cost = 0;
    try {
      const endpoint = await ApiEndpoint.findOne({ key: endpointKey });
      if (endpoint && !endpoint.isEnabled) {
        return res.status(503).json({ success: false, error: { code: 'API_DISABLED', message: `API ${endpointKey} is currently disabled` } });
      }
      cost = endpoint ? Number(endpoint.coinCost) : 1;
    } catch { cost = 1; }

    if (!req.user) return next(); // public endpoints skip charging

    const result = await coinService.deductCoins(req.user._id, cost, {
      description: `API usage: ${endpointKey}`, apiEndpoint: endpointKey, requestId,
    });
    if (!result.success) {
      return res.status(402).json({
        success: false,
        error: { code: 'INSUFFICIENT_COINS', message: 'Insufficient coin balance', balance: result.balance, required: cost },
      });
    }
    req.coinCost = cost;
    req.coinCharged = true;

    const finish = async (statusCode, success, errorMessage = '') => {
      try {
        await ApiRequest.create({
          user: req.user._id, apiKey: req.apiKey?._id || null, endpoint: endpointKey,
          method: req.method, statusCode, success, durationMs: Date.now() - startedAt,
          coinsCharged: success ? cost : 0, ip: req.ip, errorMessage,
        });
      } catch {}
      if (!success && cost > 0) {
        await coinService.refundCoins(req.user._id, cost, { description: `Refund: ${endpointKey} failed`, requestId }).catch(() => {});
      }
    };

    const originalJson = res.json.bind(res);
    res.json = (body) => {
      const success = res.statusCode < 400 && body?.success !== false;
      finish(res.statusCode, success, body?.error?.message || '').catch(() => {});
      return originalJson(body);
    };
    next();
  };
}

module.exports = { coinCharge };
