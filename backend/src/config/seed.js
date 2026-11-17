const User = require('../models/User');
const ApiEndpoint = require('../models/ApiEndpoint');
const PlatformSettings = require('../models/PlatformSettings');

const ENDPOINTS = [
  { key: 'download.info', name: 'Download API (All-in-One)', category: 'DOWNLOAD', path: '/api/download/all', method: 'GET', coinCost: 2, description: 'Auto-detect any supported link — YouTube, TikTok, Facebook, Instagram, Pinterest, Twitter/X, MediaFire, Google Drive' },
  { key: 'download.youtube', name: 'YouTube Downloader', category: 'DOWNLOAD', path: '/api/download/youtube', method: 'GET', coinCost: 2, description: 'YouTube video/audio info — title, duration, thumbnail, 360p/480p/720p/1080p qualities & download links' },
  { key: 'download.tiktok', name: 'TikTok Downloader', category: 'DOWNLOAD', path: '/api/download/tiktok', method: 'GET', coinCost: 2, description: 'TikTok video info — no watermark link, thumbnail, title & duration' },
  { key: 'download.facebook', name: 'Facebook Downloader', category: 'DOWNLOAD', path: '/api/download/facebook', method: 'GET', coinCost: 2, description: 'Facebook video info — qualities, thumbnail, title & download links' },
  { key: 'download.instagram', name: 'Instagram Downloader', category: 'DOWNLOAD', path: '/api/download/instagram', method: 'GET', coinCost: 2, description: 'Instagram reels/posts — video info, thumbnail & download links' },
  { key: 'download.pinterest', name: 'Pinterest Downloader', category: 'DOWNLOAD', path: '/api/download/pinterest', method: 'GET', coinCost: 2, description: 'Pinterest video/image info & download links' },
  { key: 'download.twitter', name: 'Twitter / X Downloader', category: 'DOWNLOAD', path: '/api/download/twitter', method: 'GET', coinCost: 2, description: 'Twitter/X video info — qualities, thumbnail & download links' },
  { key: 'download.mediafire', name: 'MediaFire Downloader', category: 'DOWNLOAD', path: '/api/download/mediafire', method: 'GET', coinCost: 2, description: 'MediaFire direct file download link info' },
  { key: 'download.drive', name: 'Google Drive Downloader', category: 'DOWNLOAD', path: '/api/download/drive', method: 'GET', coinCost: 2, description: 'Google Drive direct file download link info' },
  { key: 'movie.search', name: 'Movie Search', category: 'MOVIE', path: '/api/movie/search', method: 'GET', coinCost: 1, description: 'Search movies & TV series via TMDB' },
  { key: 'movie.details', name: 'Movie Details', category: 'MOVIE', path: '/api/movie/:type/:id', method: 'GET', coinCost: 1, description: 'Posters, trailers, cast, ratings, genres, release dates, Sinhala subtitle links' },
  { key: 'movie.trending', name: 'Trending', category: 'MOVIE', path: '/api/movie/trending', method: 'GET', coinCost: 1, description: 'Trending movies & TV this week' },
  { key: 'movie.episodes', name: 'TV Episodes', category: 'MOVIE', path: '/api/movie/tv/:tvId/episodes', method: 'GET', coinCost: 1, description: 'Episode information for TV series' },
  { key: 'ai.chat', name: 'AI Chat', category: 'AI', path: '/api/ai/chat', method: 'POST', coinCost: 3, description: 'Conversational AI chat (Gemini / OpenAI)' },
  { key: 'ai.generate', name: 'AI Text Generation', category: 'AI', path: '/api/ai/generate', method: 'POST', coinCost: 3, description: 'Generate text from a prompt' },
  { key: 'ai.translate', name: 'AI Translation', category: 'AI', path: '/api/ai/translate', method: 'POST', coinCost: 2, description: 'Translate text to any language' },
  { key: 'ai.summarize', name: 'AI Summarization', category: 'AI', path: '/api/ai/summarize', method: 'POST', coinCost: 2, description: 'Summarize long text' },
  { key: 'ai.image', name: 'AI Image Generation', category: 'AI', path: '/api/ai/image', method: 'POST', coinCost: 5, description: 'Generate images from text prompts' },
  { key: 'ai.tts', name: 'Text to Speech', category: 'AI', path: '/api/ai/tts', method: 'POST', coinCost: 3, description: 'Convert text to spoken audio' },
  { key: 'ai.stt', name: 'Speech to Text', category: 'AI', path: '/api/ai/stt', method: 'POST', coinCost: 3, description: 'Transcribe audio to text' },
  { key: 'utility.qr', name: 'QR Code Generator', category: 'UTILITY', path: '/api/utility/qr', method: 'GET', coinCost: 1, description: 'Generate QR codes from text/URLs' },
  { key: 'utility.shortener', name: 'URL Shortener', category: 'UTILITY', path: '/api/utility/shorten', method: 'POST', coinCost: 1, description: 'Shorten long URLs' },
  { key: 'utility.metadata', name: 'Website Metadata', category: 'UTILITY', path: '/api/utility/metadata', method: 'GET', coinCost: 1, description: 'Extract title, description, image from websites' },
  { key: 'utility.screenshot', name: 'Website Screenshot', category: 'UTILITY', path: '/api/utility/screenshot', method: 'GET', coinCost: 2, description: 'Capture website screenshots (requires Chromium)' },
  { key: 'utility.imageResize', name: 'Image Resize', category: 'UTILITY', path: '/api/utility/image/resize', method: 'POST', coinCost: 1, description: 'Resize images' },
  { key: 'utility.imageConvert', name: 'Image Convert', category: 'UTILITY', path: '/api/utility/image/convert', method: 'POST', coinCost: 1, description: 'Convert between png/jpeg/webp' },
  { key: 'utility.base64', name: 'Base64 Encode/Decode', category: 'UTILITY', path: '/api/utility/base64/*', method: 'POST', coinCost: 1, description: 'Encode/decode Base64' },
  { key: 'utility.jsonFormat', name: 'JSON Formatter', category: 'UTILITY', path: '/api/utility/json/format', method: 'POST', coinCost: 1, description: 'Format/validate JSON' },
  { key: 'utility.password', name: 'Password Generator', category: 'UTILITY', path: '/api/utility/password', method: 'GET', coinCost: 1, description: 'Generate secure passwords' },
  { key: 'utility.weather', name: 'Weather Info', category: 'UTILITY', path: '/api/utility/weather', method: 'GET', coinCost: 1, description: 'Current weather by city' },
];

async function seedIfEmpty() {
  // Upsert: adds any NEW endpoints to existing databases without overwriting admin edits
  for (const e of ENDPOINTS) {
    await ApiEndpoint.updateOne({ key: e.key }, { $setOnInsert: e }, { upsert: true });
  }
  const count = await ApiEndpoint.countDocuments();
  console.log(`[SEED] API endpoints ready: ${count}`);

  const adminEmail = (process.env.ADMIN_EMAIL || 'admin@cloneminHub.lk').toLowerCase();
  const adminExists = await User.findOne({ role: 'ADMIN' });
  if (!adminExists) {
    await User.create({
      name: process.env.ADMIN_NAME || 'CLONE SHANUWA',
      email: adminEmail,
      password: process.env.ADMIN_PASSWORD || 'Admin@123456',
      role: 'ADMIN',
      isVerified: true,
      coins: 9999,
    });
    console.log(`[SEED] Admin account created: ${adminEmail}`);
    console.log('[SEED] IMPORTANT: Change the admin password after first login!');
  }

  await PlatformSettings.set('startingCoins', 50);
  await PlatformSettings.set('dailyBonus', 50);
  await PlatformSettings.set('maintenanceMode', false);
}

module.exports = { seedIfEmpty, ENDPOINTS };
