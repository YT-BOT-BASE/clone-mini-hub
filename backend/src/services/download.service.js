const axios = require('axios');
const { env } = require('../config/env');

const SUPPORTED = ['youtube', 'tiktok', 'facebook', 'instagram', 'pinterest', 'twitter', 'mediafire', 'drive'];

function detectSource(url) {
  const u = String(url || '').toLowerCase();
  if (u.includes('youtube.com') || u.includes('youtu.be')) return 'youtube';
  if (u.includes('tiktok.com')) return 'tiktok';
  if (u.includes('facebook.com') || u.includes('fb.watch')) return 'facebook';
  if (u.includes('instagram.com')) return 'instagram';
  if (u.includes('pinterest.') || u.includes('pin.it')) return 'pinterest';
  if (u.includes('twitter.com') || u.includes('x.com')) return 'twitter';
  if (u.includes('mediafire.com')) return 'mediafire';
  if (u.includes('drive.google.com')) return 'drive';
  return null;
}

// Uses Cobalt API (https://cobalt.tools) - real third-party integration.
// If Cobalt is unreachable, we throw a clear error (never fake data).
async function fetchViaCobalt(url, { videoQuality = '720', downloadMode = 'auto' } = {}) {
  const base = (env.cobaltApiUrl || 'https://api.cobalt.tools').replace(/\/$/, '');
  const res = await axios.post(`${base}/api/json`, {
    url,
    videoQuality,
    downloadMode,
    aFormat: 'mp3',
    filenamePattern: 'pretty',
  }, {
    headers: { Accept: 'application/json', 'Content-Type': 'application/json' },
    timeout: 25000,
  });
  const data = res.data || {};
  if (data.status === 'error') {
    const err = new Error(data.text || 'Cobalt could not process this URL');
    err.code = 'DOWNLOAD_FAILED';
    err.statusCode = 422;
    throw err;
  }
  if (data.status === 'redirect' || data.status === 'stream' || data.status === 'picker') {
    return normalizeCobalt(data, url);
  }
  const err = new Error('Unexpected response from download provider');
  err.code = 'PROVIDER_ERROR';
  err.statusCode = 502;
  throw err;
}

function normalizeCobalt(data, sourceUrl) {
  const picker = Array.isArray(data.picker) ? data.picker : [];
  const qualities = picker.length
    ? picker.map((p) => ({ quality: p.type || 'video', url: p.url, thumbnail: p.thumb || data.audio || '' }))
    : [{ quality: data.filename || 'download', url: data.url, thumbnail: data.audio || '' }];

  return {
    source: detectSource(sourceUrl),
    title: data.filename || 'Media',
    duration: null,
    thumbnail: picker[0]?.thumb || null,
    downloadUrl: data.url || null,
    audioUrl: data.audio || null,
    filename: data.filename || null,
    qualities,
    picker: picker.length ? picker : undefined,
    rawStatus: data.status,
  };
}

async function getDownloadInfo(url, options = {}) {
  const source = detectSource(url);
  if (!source) {
    const err = new Error('Unsupported URL. Supported: YouTube, TikTok, Facebook, Instagram, Pinterest, Twitter/X, MediaFire, Google Drive');
    err.code = 'UNSUPPORTED_SOURCE';
    err.statusCode = 400;
    throw err;
  }
  // MediaFire / Google Drive direct links: return direct download info without Cobalt
  if (source === 'mediafire' || source === 'drive') {
    return {
      source,
      title: 'File',
      thumbnail: null,
      downloadUrl: url,
      qualities: [{ quality: 'original', url }],
      note: 'Direct file link. Download from the source URL.',
    };
  }
  return fetchViaCobalt(url, options);
}

module.exports = { SUPPORTED, detectSource, getDownloadInfo };
