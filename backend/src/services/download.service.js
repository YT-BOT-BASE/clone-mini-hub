const axios = require('axios');
const { env } = require('../config/env');

const SUPPORTED = ['youtube', 'tiktok', 'facebook', 'instagram', 'pinterest', 'twitter', 'mediafire', 'drive'];

const PLATFORM_LABELS = {
  youtube: 'YouTube', tiktok: 'TikTok', facebook: 'Facebook', instagram: 'Instagram',
  pinterest: 'Pinterest', twitter: 'Twitter / X', mediafire: 'MediaFire', drive: 'Google Drive',
};

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

function userError(message, code = 'BAD_REQUEST') {
  const err = new Error(message);
  err.code = code;
  err.statusCode = 400;
  return err;
}

function providerError(message, code = 'PROVIDER_UNAVAILABLE') {
  const err = new Error(message);
  err.code = code;
  err.statusCode = 503;
  return err;
}

// Retry + timeout wrapper (never crashes the server on provider failures)
async function fetchJson(url, config = {}, timeout = 20000, retries = 1) {
  let lastErr;
  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      const res = await axios.get(url, { timeout, ...config });
      return res.data;
    } catch (e) {
      lastErr = e;
      if (attempt < retries) await new Promise((r) => setTimeout(r, 700));
    }
  }
  throw lastErr;
}

function formatDuration(seconds) {
  if (seconds === null || seconds === undefined) return null;
  const s = Math.round(Number(seconds));
  if (!Number.isFinite(s)) return null;
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const sec = s % 60;
  return h > 0 ? `${h}:${String(m).padStart(2, '0')}:${String(sec).padStart(2, '0')}` : `${m}:${String(sec).padStart(2, '0')}`;
}

function formatBytes(n) {
  if (!n) return undefined;
  const bytes = Number(n);
  if (!Number.isFinite(bytes)) return undefined;
  const units = ['B', 'KB', 'MB', 'GB'];
  let i = 0;
  let v = bytes;
  while (v >= 1024 && i < units.length - 1) { v /= 1024; i++; }
  return `${v.toFixed(v >= 10 || i === 0 ? 0 : 1)} ${units[i]}`;
}

// ============ YouTube — via Piped API (real data, no key needed) ============
const PIPED_INSTANCES = [
  'https://api.piped.private.coffee',
  'https://pipedapi.adminforge.de',
  'https://pipedapi.kavin.rocks',
  'https://pipedapi.reallyaweso.me',
];

function extractYouTubeId(url) {
  const u = String(url);
  const patterns = [/(?:youtube\.com\/watch\?(?:.*&)?v=)([\w-]{11})/, /(?:youtu\.be\/)([\w-]{11})/, /(?:youtube\.com\/shorts\/)([\w-]{11})/, /(?:youtube\.com\/embed\/)([\w-]{11})/];
  for (const p of patterns) {
    const m = u.match(p);
    if (m) return m[1];
  }
  return null;
}

async function youtubeInfo(url) {
  const id = extractYouTubeId(url);
  if (!id) throw userError('Invalid YouTube URL. Example: https://youtu.be/dQw4w9WgXcQ');

  for (const base of PIPED_INSTANCES) {
    try {
      const j = await fetchJson(`${base}/streams/${id}`, {}, 20000, 1);
      if (!j || j.error || !j.title) continue;

      const qualities = [];
      for (const s of (j.videoStreams || [])) {
        if (!s.url) continue;
        const isMp4 = (s.mimeType || '').includes('mp4');
        qualities.push({
          quality: `${s.quality}${s.videoOnly ? ' (video only)' : ''}`,
          type: 'video',
          format: isMp4 ? 'mp4' : 'hls',
          url: s.url,
          size: formatBytes(s.contentLength),
        });
      }
      for (const a of (j.audioStreams || []).slice(0, 3)) {
        if (!a.url) continue;
        qualities.push({
          quality: `audio ${Math.round((a.bitrate || 0) / 1000)}kbps`,
          type: 'audio',
          format: (a.mimeType || '').includes('webm') ? 'webm' : 'm4a',
          url: a.url,
          size: formatBytes(a.contentLength),
        });
      }
      if (!qualities.length) continue;

      return {
        platform: 'YouTube', source: 'youtube',
        title: j.title, duration: formatDuration(j.duration), thumbnail: j.thumbnailUrl,
        uploader: j.uploader, views: j.views, likes: j.likes,
        downloadUrl: (qualities.find((q) => q.type === 'video') || qualities[0]).url,
        qualities,
        provider: 'piped',
        note: 'Download links are temporary (expire in a few hours). Re-request for fresh links.',
      };
    } catch (e) { /* try next instance */ }
  }
  throw providerError('YouTube provider is temporarily unavailable. Please try again in a few minutes (coins were auto-refunded).');
}

// ============ TikTok — via tikwm API (real data, no key needed) ============
async function tiktokInfo(url) {
  let j;
  try {
    j = await fetchJson('https://tikwm.com/api/', { params: { url } }, 25000, 1);
  } catch {
    throw providerError('TikTok provider is temporarily unavailable. Please try again later (coins were auto-refunded).');
  }
  if (!j || j.code !== 0 || !j.data) {
    throw providerError(`TikTok provider error: ${(j && j.msg) || 'could not fetch this video'}`);
  }
  const d = j.data;
  const qualities = [];
  if (d.hdplay) qualities.push({ quality: 'HD (no watermark)', type: 'video', format: 'mp4', url: d.hdplay });
  if (d.play) qualities.push({ quality: 'Standard (no watermark)', type: 'video', format: 'mp4', url: d.play });
  if (d.wmplay) qualities.push({ quality: 'With watermark', type: 'video', format: 'mp4', url: d.wmplay });
  if (d.music) qualities.push({ quality: 'Audio (mp3)', type: 'audio', format: 'mp3', url: d.music });

  return {
    platform: 'TikTok', source: 'tiktok',
    title: d.title || 'TikTok video',
    duration: formatDuration(d.duration),
    thumbnail: d.cover,
    uploader: d.author && (d.author.nickname || d.author.unique_id),
    downloadUrl: (qualities.find((q) => q.type === 'video') || qualities[0]).url,
    qualities,
    provider: 'tikwm',
    note: d.hdplay ? 'HD no-watermark link included.' : undefined,
  };
}

// ============ Twitter / X — via FxTwitter API (real data, no key needed) ============
function extractTweetId(url) {
  const m = String(url).match(/(?:status|statuses)\/(\d+)/);
  return m ? m[1] : null;
}

async function twitterInfo(url) {
  const id = extractTweetId(url);
  if (!id) throw userError('Invalid Twitter/X URL. Example: https://x.com/user/status/123456');

  let j;
  try {
    j = await fetchJson(`https://api.fxtwitter.com/status/${id}`, {}, 20000, 1);
  } catch {
    throw providerError('Twitter/X provider is temporarily unavailable. Please try again later (coins were auto-refunded).');
  }
  const t = j && j.tweet;
  if (!t) throw providerError('Twitter/X provider could not fetch this tweet.');

  const qualities = [];
  for (const v of (t.media?.videos || [])) {
    if (v.url) qualities.push({ quality: v.quality || 'video', type: 'video', format: 'mp4', url: v.url, size: undefined });
    for (const variant of (v.variants || [])) {
      if (variant.url && variant.content_type?.includes('mp4')) {
        qualities.push({ quality: `${Math.round((variant.bitrate || 0) / 1000)}kbps`, type: 'video', format: 'mp4', url: variant.url });
      }
    }
  }
  for (const p of (t.media?.photos || [])) {
    if (p.url) qualities.push({ quality: 'photo', type: 'image', format: 'jpg', url: p.url });
  }
  if (!qualities.length) throw userError('This tweet has no downloadable media.', 'NO_MEDIA');

  return {
    platform: 'Twitter / X', source: 'twitter',
    title: (t.text || 'Tweet').slice(0, 120),
    duration: t.media?.videos?.[0] ? formatDuration(t.media.videos[0].duration) : null,
    thumbnail: t.media?.videos?.[0]?.thumbnail || t.media?.photos?.[0]?.url || null,
    uploader: t.author?.screen_name,
    downloadUrl: qualities[0].url,
    qualities,
    provider: 'fxtwitter',
  };
}

// ============ MediaFire / Google Drive — direct file links ============
async function directFileInfo(url, source) {
  return {
    platform: PLATFORM_LABELS[source], source,
    title: 'Direct file link',
    thumbnail: null,
    downloadUrl: url,
    qualities: [{ quality: 'original file', type: 'file', url }],
    provider: 'direct',
    note: 'Open the downloadUrl directly to download the file.',
  };
}

// ============ Facebook / Instagram / Pinterest — Cobalt chain (v10) ============
function cobaltInstances() {
  return [env.cobaltApiUrl, 'https://cobalt-api.kwiatekmiki.com', 'https://cobalt-api.me'].filter(Boolean);
}

function normalizeCobalt(data, source) {
  const picker = Array.isArray(data.picker) ? data.picker : [];
  const qualities = [];
  if (data.url) qualities.push({ quality: 'video', type: 'video', format: 'mp4', url: data.url });
  if (data.audio) qualities.push({ quality: 'audio', type: 'audio', format: 'mp3', url: data.audio });
  for (const p of picker) {
    if (p.url) qualities.push({ quality: p.type || 'media', type: p.type === 'photo' ? 'image' : 'video', url: p.url, thumb: p.thumb });
  }
  return {
    platform: PLATFORM_LABELS[source], source,
    title: data.filename || `${PLATFORM_LABELS[source]} media`,
    thumbnail: picker[0]?.thumb || null,
    downloadUrl: qualities[0]?.url || null,
    qualities,
    provider: 'cobalt',
    note: 'Download links are temporary. Re-request for fresh links.',
  };
}

async function viaCobalt(url, options = {}) {
  for (const base of cobaltInstances()) {
    try {
      const res = await axios.post(`${base.replace(/\/$/, '')}/`, {
        url,
        videoQuality: options.videoQuality || '720',
        downloadMode: options.downloadMode || 'auto',
        aFormat: 'mp3',
        filenameStyle: 'pretty',
      }, {
        headers: { Accept: 'application/json', 'Content-Type': 'application/json' },
        timeout: 25000,
      });
      const data = res.data || {};
      if (data.status === 'error') {
        const code = data.error?.code || '';
        if (code.includes('link.unsupported')) continue;
        if (code.includes('link.invalid')) throw userError('Invalid link for this platform.');
        continue;
      }
      if (data.status === 'tunnel' || data.status === 'redirect' || data.status === 'picker') {
        return normalizeCobalt(data, detectSource(url));
      }
    } catch (e) {
      if (e.statusCode === 400) throw e;
      /* try next instance */
    }
  }
  throw providerError(
    `${PLATFORM_LABELS[detectSource(url)]} download provider is temporarily unavailable. Please try again later (coins were auto-refunded).`
  );
}

// ============ Router ============
async function getDownloadInfo(url, options = {}) {
  const source = detectSource(url);
  if (!source) {
    throw userError('Unsupported URL. Supported: YouTube, TikTok, Facebook, Instagram, Pinterest, Twitter/X, MediaFire, Google Drive');
  }
  switch (source) {
    case 'youtube': return youtubeInfo(url);
    case 'tiktok': return tiktokInfo(url);
    case 'twitter': return twitterInfo(url);
    case 'mediafire':
    case 'drive': return directFileInfo(url, source);
    case 'facebook':
    case 'instagram':
    case 'pinterest': return viaCobalt(url, options);
    default: throw userError('Unsupported URL source.');
  }
}

module.exports = { SUPPORTED, PLATFORM_LABELS, detectSource, getDownloadInfo };
