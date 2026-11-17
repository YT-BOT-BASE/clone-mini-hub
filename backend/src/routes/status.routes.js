const express = require('express');
const mongoose = require('mongoose');
const ApiEndpoint = require('../models/ApiEndpoint');
const Announcement = require('../models/Announcement');

const router = express.Router();

router.get('/health', (req, res) => {
  res.json({ success: true, data: { status: 'ok', uptime: process.uptime(), timestamp: new Date().toISOString(), version: 'V1' } });
});

router.get('/status', async (req, res, next) => {
  try {
    const dbOk = mongoose.connection.readyState === 1;
    const endpoints = await ApiEndpoint.find().select('key name category isEnabled coinCost').sort({ category: 1, key: 1 });
    res.json({
      success: true,
      data: {
        status: dbOk ? 'operational' : 'degraded',
        database: dbOk ? 'connected' : 'disconnected',
        uptimeSeconds: Math.floor(process.uptime()),
        endpoints,
      },
    });
  } catch (e) { next(e); }
});

router.get('/announcements', async (req, res, next) => {
  try {
    const announcements = await Announcement.find({ isActive: true }).sort({ createdAt: -1 }).limit(10);
    res.json({ success: true, data: { announcements } });
  } catch (e) { next(e); }
});

router.get('/marketplace', async (req, res, next) => {
  try {
    const endpoints = await ApiEndpoint.find({ isEnabled: true }).sort({ category: 1, key: 1 });
    res.json({ success: true, data: { endpoints } });
  } catch (e) { next(e); }
});

module.exports = router;
