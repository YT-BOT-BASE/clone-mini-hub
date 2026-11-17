const utilityService = require('../services/utility.service');
const ShortUrl = require('../models/ShortUrl');
const { customAlphabet } = require('nanoid');

const nanoid = customAlphabet('abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789', 8);

exports.qr = async (req, res, next) => {
  try {
    const text = req.query.text || req.body?.text;
    if (!text) return res.status(400).json({ success: false, error: { code: 'TEXT_REQUIRED', message: 'Provide text' } });
    const data = await utilityService.generateQr(text, req.query);
    res.json({ success: true, data });
  } catch (e) { next(e); }
};

exports.shortenerCreate = async (req, res, next) => {
  try {
    const { url } = req.body;
    if (!url) return res.status(400).json({ success: false, error: { code: 'URL_REQUIRED', message: 'Provide url' } });
    new URL(url); // validate
    let code = nanoid();
    let exists = await ShortUrl.findOne({ code });
    let guard = 0;
    while (exists && guard++ < 5) { code = nanoid(); exists = await ShortUrl.findOne({ code }); }
    const doc = await ShortUrl.create({ code, originalUrl: url, user: req.user?._id || null });
    res.status(201).json({ success: true, data: { code, shortUrl: `${req.protocol}://${req.get('host')}/s/${code}`, originalUrl: url } });
  } catch (e) {
    if (e instanceof TypeError) return res.status(400).json({ success: false, error: { code: 'INVALID_URL', message: 'Invalid URL' } });
    next(e);
  }
};

exports.shortenerRedirect = async (req, res, next) => {
  try {
    const doc = await ShortUrl.findOne({ code: req.params.code });
    if (!doc) return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Short URL not found' } });
    doc.clicks += 1;
    await doc.save();
    res.redirect(doc.originalUrl);
  } catch (e) { next(e); }
};

exports.metadata = async (req, res, next) => {
  try {
    const url = req.query.url || req.body?.url;
    if (!url) return res.status(400).json({ success: false, error: { code: 'URL_REQUIRED', message: 'Provide url' } });
    const data = await utilityService.getWebsiteMetadata(url);
    res.json({ success: true, data });
  } catch (e) { next(e); }
};

exports.screenshot = async (req, res, next) => {
  // Screenshot needs a headless browser (Puppeteer/Chromium). Return clear unavailable error if not installed.
  const err = new Error('Website Screenshot service is not available on this server. Install Chromium/Puppeteer on the VPS or configure a screenshot provider API key.');
  err.code = 'SERVICE_UNAVAILABLE';
  err.statusCode = 503;
  next(err);
};

exports.imageResize = async (req, res, next) => {
  try {
    if (!req.file) return res.status(400).json({ success: false, error: { code: 'FILE_REQUIRED', message: 'Upload an image file (field: image)' } });
    const { buffer, contentType } = await utilityService.resizeImage(req.file.buffer, {
      width: req.body.width, height: req.body.height, format: req.body.format || 'png',
    });
    res.set('Content-Type', contentType);
    res.send(buffer);
  } catch (e) { next(e); }
};

exports.imageConvert = async (req, res, next) => {
  try {
    if (!req.file) return res.status(400).json({ success: false, error: { code: 'FILE_REQUIRED', message: 'Upload an image file (field: image)' } });
    const format = (req.body.format || 'png').toLowerCase();
    if (!['png', 'jpeg', 'jpg', 'webp'].includes(format)) return res.status(400).json({ success: false, error: { code: 'INVALID_FORMAT', message: 'format must be png, jpeg or webp' } });
    const { buffer, contentType } = await utilityService.convertImage(req.file.buffer, format === 'jpg' ? 'jpeg' : format);
    res.set('Content-Type', contentType);
    res.send(buffer);
  } catch (e) { next(e); }
};

exports.base64Encode = async (req, res) => {
  res.json({ success: true, data: utilityService.base64Encode(req.body.text || '') });
};
exports.base64Decode = async (req, res) => {
  res.json({ success: true, data: utilityService.base64Decode(req.body.text || '') });
};
exports.jsonFormat = async (req, res, next) => {
  try {
    res.json({ success: true, data: utilityService.formatJson(req.body.text || '{}') });
  } catch (e) {
    res.status(400).json({ success: false, error: { code: 'INVALID_JSON', message: 'Invalid JSON input' } });
  }
};
exports.passwordGenerator = async (req, res) => {
  res.json({ success: true, data: utilityService.generatePassword(Number(req.query.length || req.body?.length || 16)) });
};
exports.weather = async (req, res, next) => {
  try {
    const city = req.query.city || req.body?.city;
    if (!city) return res.status(400).json({ success: false, error: { code: 'CITY_REQUIRED', message: 'Provide city' } });
    const data = await utilityService.getWeather(city);
    res.json({ success: true, data });
  } catch (e) { next(e); }
};
