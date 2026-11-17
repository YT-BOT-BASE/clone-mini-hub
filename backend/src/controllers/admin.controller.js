const User = require('../models/User');
const ApiKey = require('../models/ApiKey');
const ApiRequest = require('../models/ApiRequest');
const ApiEndpoint = require('../models/ApiEndpoint');
const Announcement = require('../models/Announcement');
const PlatformSettings = require('../models/PlatformSettings');
const AuditLog = require('../models/AuditLog');
const coinService = require('../services/coin.service');
const { getPagination, paginateResult } = require('../utils/pagination');

async function audit(req, action, target, details = {}) {
  await AuditLog.create({ admin: req.user._id, action, target, details, ip: req.ip }).catch(() => {});
}

exports.dashboard = async (req, res, next) => {
  try {
    const [totalUsers, activeUsers, totalRequests, successRequests, failedRequests] = await Promise.all([
      User.countDocuments(),
      User.countDocuments({ isSuspended: false }),
      ApiRequest.countDocuments(),
      ApiRequest.countDocuments({ success: true }),
      ApiRequest.countDocuments({ success: false }),
    ]);
    const recentRequests = await ApiRequest.find().sort({ createdAt: -1 }).limit(10).populate('user', 'name email');
    const recentUsers = await User.find().sort({ createdAt: -1 }).limit(10).select('-password');
    res.json({
      success: true,
      data: {
        stats: { totalUsers, activeUsers, totalRequests, successRequests, failedRequests, uptimeSeconds: Math.floor(process.uptime()) },
        recentRequests, recentUsers,
      },
    });
  } catch (e) { next(e); }
};

exports.listUsers = async (req, res, next) => {
  try {
    const { page, limit, skip } = getPagination(req.query);
    const filter = {};
    if (req.query.search) filter.$or = [{ name: new RegExp(req.query.search, 'i') }, { email: new RegExp(req.query.search, 'i') }];
    if (req.query.role) filter.role = req.query.role;
    const total = await User.countDocuments(filter);
    const users = await User.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit).select('-password');
    res.json({ success: true, ...paginateResult(users, total, { page, limit }) });
  } catch (e) { next(e); }
};

exports.userActivity = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id).select('-password');
    if (!user) return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'User not found' } });
    const [requests, keys, totalRequests] = await Promise.all([
      ApiRequest.find({ user: user._id }).sort({ createdAt: -1 }).limit(20),
      ApiKey.find({ user: user._id }).select('-keyHash').sort({ createdAt: -1 }),
      ApiRequest.countDocuments({ user: user._id }),
    ]);
    res.json({ success: true, data: { user, totalRequests, recentRequests: requests, apiKeys: keys } });
  } catch (e) { next(e); }
};

exports.suspendUser = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'User not found' } });
    user.isSuspended = !user.isSuspended;
    await user.save();
    await audit(req, user.isSuspended ? 'SUSPEND_USER' : 'ACTIVATE_USER', user._id.toString());
    res.json({ success: true, data: { user: user.toSafeJSON() } });
  } catch (e) { next(e); }
};

exports.adjustCoins = async (req, res, next) => {
  try {
    const { amount, description } = req.body;
    const updated = await coinService.addCoins(req.params.id, Number(amount), 'ADMIN_ADJUST', description || 'Admin adjustment');
    if (!updated) return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'User not found' } });
    await audit(req, 'ADJUST_COINS', req.params.id, { amount });
    res.json({ success: true, data: { user: updated.toSafeJSON() } });
  } catch (e) { next(e); }
};

exports.listEndpoints = async (req, res, next) => {
  try {
    const endpoints = await ApiEndpoint.find().sort({ category: 1, key: 1 });
    res.json({ success: true, data: { endpoints } });
  } catch (e) { next(e); }
};

exports.updateEndpoint = async (req, res, next) => {
  try {
    const { isEnabled, coinCost, name, description } = req.body;
    const update = {};
    if (isEnabled !== undefined) update.isEnabled = isEnabled;
    if (coinCost !== undefined) update.coinCost = Number(coinCost);
    if (name) update.name = name;
    if (description !== undefined) update.description = description;
    const endpoint = await ApiEndpoint.findByIdAndUpdate(req.params.id, update, { new: true });
    if (!endpoint) return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Endpoint not found' } });
    await audit(req, 'UPDATE_ENDPOINT', endpoint.key, update);
    res.json({ success: true, data: { endpoint } });
  } catch (e) { next(e); }
};

exports.getSettings = async (req, res, next) => {
  try {
    const [startingCoins, dailyBonus, maintenanceMode] = await Promise.all([
      PlatformSettings.get('startingCoins', 50),
      PlatformSettings.get('dailyBonus', 50),
      PlatformSettings.get('maintenanceMode', false),
    ]);
    res.json({ success: true, data: { startingCoins, dailyBonus, maintenanceMode } });
  } catch (e) { next(e); }
};

exports.updateSettings = async (req, res, next) => {
  try {
    const { startingCoins, dailyBonus, maintenanceMode } = req.body;
    if (startingCoins !== undefined) await PlatformSettings.set('startingCoins', Number(startingCoins));
    if (dailyBonus !== undefined) await PlatformSettings.set('dailyBonus', Number(dailyBonus));
    if (maintenanceMode !== undefined) await PlatformSettings.set('maintenanceMode', Boolean(maintenanceMode));
    await audit(req, 'UPDATE_SETTINGS', 'platform', req.body);
    const data = await exports.getSettings(req, res, () => {});
    // getSettings already sent response; avoid double-send by returning
  } catch (e) { next(e); }
};

exports.listAnnouncements = async (req, res, next) => {
  try {
    const announcements = await Announcement.find().sort({ createdAt: -1 });
    res.json({ success: true, data: { announcements } });
  } catch (e) { next(e); }
};

exports.createAnnouncement = async (req, res, next) => {
  try {
    const doc = await Announcement.create(req.body);
    await audit(req, 'CREATE_ANNOUNCEMENT', doc._id.toString());
    res.status(201).json({ success: true, data: { announcement: doc } });
  } catch (e) { next(e); }
};

exports.deleteAnnouncement = async (req, res, next) => {
  try {
    await Announcement.findByIdAndDelete(req.params.id);
    await audit(req, 'DELETE_ANNOUNCEMENT', req.params.id);
    res.json({ success: true, message: 'Announcement deleted' });
  } catch (e) { next(e); }
};

exports.errorLogs = async (req, res, next) => {
  try {
    const { page, limit, skip } = getPagination(req.query);
    const filter = { success: false };
    const total = await ApiRequest.countDocuments(filter);
    const logs = await ApiRequest.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit).populate('user', 'name email');
    res.json({ success: true, ...paginateResult(logs, total, { page, limit }) });
  } catch (e) { next(e); }
};

exports.auditLogs = async (req, res, next) => {
  try {
    const { page, limit, skip } = getPagination(req.query);
    const total = await AuditLog.countDocuments();
    const logs = await AuditLog.find().sort({ createdAt: -1 }).skip(skip).limit(limit).populate('admin', 'name email');
    res.json({ success: true, ...paginateResult(logs, total, { page, limit }) });
  } catch (e) { next(e); }
};

exports.listAllApiKeys = async (req, res, next) => {
  try {
    const { page, limit, skip } = getPagination(req.query);
    const total = await ApiKey.countDocuments();
    const keys = await ApiKey.find().sort({ createdAt: -1 }).skip(skip).limit(limit).select('-keyHash').populate('user', 'name email');
    res.json({ success: true, ...paginateResult(keys, total, { page, limit }) });
  } catch (e) { next(e); }
};
