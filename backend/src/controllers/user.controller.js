const User = require('../models/User');
const Transaction = require('../models/Transaction');
const ApiRequest = require('../models/ApiRequest');
const coinService = require('../services/coin.service');
const { getPagination, paginateResult } = require('../utils/pagination');

exports.updateProfile = async (req, res, next) => {
  try {
    const { name, avatar } = req.body;
    if (name) req.user.name = name;
    if (avatar !== undefined) req.user.avatar = avatar;
    await req.user.save();
    res.json({ success: true, data: { user: req.user.toSafeJSON() } });
  } catch (e) { next(e); }
};

exports.claimDailyBonus = async (req, res, next) => {
  try {
    const result = await coinService.claimDailyBonus(req.user._id);
    if (!result.success) {
      const status = result.error === 'ALREADY_CLAIMED_TODAY' ? 409 : 404;
      return res.status(status).json({ success: false, error: { code: result.error, message: result.error === 'ALREADY_CLAIMED_TODAY' ? 'Daily bonus already claimed today' : 'User not found', balance: result.balance } });
    }
    res.json({ success: true, data: { balance: result.balance, bonus: result.bonus } });
  } catch (e) { next(e); }
};

exports.getWallet = async (req, res) => {
  res.json({ success: true, data: { coins: req.user.coins, userId: req.user._id } });
};

exports.getTransactions = async (req, res, next) => {
  try {
    const { page, limit, skip } = getPagination(req.query);
    const total = await Transaction.countDocuments({ user: req.user._id });
    const items = await Transaction.find({ user: req.user._id }).sort({ createdAt: -1 }).skip(skip).limit(limit);
    res.json({ success: true, ...paginateResult(items, total, { page, limit }) });
  } catch (e) { next(e); }
};

exports.getMyRequests = async (req, res, next) => {
  try {
    const { page, limit, skip } = getPagination(req.query);
    const filter = { user: req.user._id };
    if (req.query.endpoint) filter.endpoint = req.query.endpoint;
    const total = await ApiRequest.countDocuments(filter);
    const items = await ApiRequest.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit);
    res.json({ success: true, ...paginateResult(items, total, { page, limit }) });
  } catch (e) { next(e); }
};

exports.getMyStats = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const [totalRequests, successRequests, failedRequests, coinsSpent] = await Promise.all([
      ApiRequest.countDocuments({ user: userId }),
      ApiRequest.countDocuments({ user: userId, success: true }),
      ApiRequest.countDocuments({ user: userId, success: false }),
      Transaction.aggregate([
        { $match: { user: userId, type: 'API_USAGE' } },
        { $group: { _id: null, total: { $sum: { $abs: '$amount' } } } },
      ]),
    ]);
    res.json({
      success: true,
      data: {
        coins: req.user.coins,
        totalRequests, successRequests, failedRequests,
        coinsSpent: coinsSpent[0]?.total || 0,
      },
    });
  } catch (e) { next(e); }
};
