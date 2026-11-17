const QRCode = require('qrcode');
const sharp = require('sharp');
const axios = require('axios');
const cheerio = require('cheerio');
const crypto = require('crypto');
const { env } = require('../config/env');

async function generateQr(text, options = {}) {
  const dataUrl = await QRCode.toDataURL(String(text), {
    width: Number(options.width || 512),
    margin: Number(options.margin || 2),
    color: { dark: options.dark || '#000000', light: options.light || '#ffffff' },
  });
  return { qrCode: dataUrl };
}

function generatePassword(length = 16) {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789!@#$%^&*';
  const bytes = crypto.randomBytes(length);
  let out = '';
  for (let i = 0; i < length; i++) out += chars[bytes[i] % chars.length];
  return { password: out };
}

function base64Encode(text) {
  return { encoded: Buffer.from(String(text), 'utf8').toString('base64') };
}
function base64Decode(text) {
  return { decoded: Buffer.from(String(text), 'base64').toString('utf8') };
}

function formatJson(text) {
  const parsed = JSON.parse(String(text));
  return { formatted: JSON.stringify(parsed, null, 2) };
}

async function getWebsiteMetadata(url) {
  const res = await axios.get(url, {
    headers: { 'User-Agent': 'Mozilla/5.0 CLONE MINI HUB MetadataBot/1.0' },
    timeout: 15000, maxRedirects: 5,
  });
  const $ = cheerio.load(res.data);
  const get = (sel, attr = 'content') => $(sel).attr(attr) || '';
  return {
    url: res.config.url,
    title: $('title').first().text().trim(),
    description: get('meta[name="description"]') || get('meta[property="og:description"]'),
    image: get('meta[property="og:image"]'),
    favicon: $('link[rel="icon"]').attr('href') || '',
    keywords: get('meta[name="keywords"]'),
  };
}

async function resizeImage(buffer, { width = 800, height, format = 'png' } = {}) {
  let pipeline = sharp(buffer);
  if (width || height) pipeline = pipeline.resize(width ? Number(width) : undefined, height ? Number(height) : undefined, { fit: 'inside' });
  const out = await pipeline.toFormat(format).toBuffer();
  return { buffer: out, contentType: `image/${format === 'jpg' ? 'jpeg' : format}` };
}

async function convertImage(buffer, format = 'png') {
  const out = await sharp(buffer).toFormat(format).toBuffer();
  return { buffer: out, contentType: `image/${format === 'jpg' ? 'jpeg' : format}` };
}

async function getWeather(city) {
  if (!env.openweatherApiKey) {
    const err = new Error('Weather API is not configured. Set OPENWEATHER_API_KEY in backend/.env');
    err.code = 'SERVICE_UNAVAILABLE';
    err.statusCode = 503;
    throw err;
  }
  const res = await axios.get('https://api.openweathermap.org/data/2.5/weather', {
    params: { q: city, appid: env.openweatherApiKey, units: 'metric' },
    timeout: 15000,
  });
  const d = res.data;
  return {
    city: d.name, country: d.sys?.country, temp: d.main?.temp, feelsLike: d.main?.feels_like,
    humidity: d.main?.humidity, pressure: d.main?.pressure, description: d.weather?.[0]?.description,
    icon: d.weather?.[0]?.icon, wind: d.wind?.speed,
  };
}

module.exports = { generateQr, generatePassword, base64Encode, base64Decode, formatJson, getWebsiteMetadata, resizeImage, convertImage, getWeather };
