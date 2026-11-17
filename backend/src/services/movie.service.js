const axios = require('axios');
const { env } = require('../config/env');
const { cacheGet, cacheSet } = require('../config/redis');

function requireTmdb() {
  if (!env.tmdbApiKey) {
    const err = new Error('Movie API is not configured. Set TMDB_API_KEY in backend/.env (get a free key at themoviedb.org).');
    err.code = 'SERVICE_UNAVAILABLE';
    err.statusCode = 503;
    throw err;
  }
}

async function tmdbGet(path, params = {}) {
  requireTmdb();
  const cacheKey = `tmdb:${path}:${JSON.stringify(params)}`;
  const cached = await cacheGet(cacheKey);
  if (cached) return JSON.parse(cached);
  const res = await axios.get(`${env.tmdbBaseUrl}${path}`, {
    params: { api_key: env.tmdbApiKey, language: 'en-US', ...params },
    timeout: 15000,
  });
  await cacheSet(cacheKey, JSON.stringify(res.data), 600);
  return res.data;
}

async function searchMovies(query, page = 1) {
  return tmdbGet('/search/multi', { query, page, include_adult: false });
}
async function getDetails(type, id) {
  // type: movie | tv
  return tmdbGet(`/${type}/${id}`, { append_to_response: 'videos,credits,images,external_ids' });
}
async function getTrending(page = 1) {
  return tmdbGet('/trending/all/week', { page });
}
async function getEpisodes(tvId, seasonNumber = 1) {
  return tmdbGet(`/tv/${tvId}/season/${seasonNumber}`);
}

// Sinhala subtitle / legal provider metadata helpers (links only, no pirated content)
function buildProviderLinks(tmdbId, type = 'movie') {
  return [
    { name: 'cinesubz', url: `https://cinesubz.co/?s=${encodeURIComponent(String(tmdbId))}` },
    { name: 'sinhalasub', url: `https://sinhalasub.lk/?s=${encodeURIComponent(String(tmdbId))}` },
    { name: 'Baiscope', url: `https://Baiscope.me/?s=${encodeURIComponent(String(tmdbId))}` },
    { name: 'TMDB', url: `https://www.themoviedb.org/${type}/${tmdbId}` },
    { name: 'JustWatch', url: `https://www.justwatch.com/search?q=${encodeURIComponent(String(tmdbId))}` },
  ];
}

module.exports = { searchMovies, getDetails, getTrending, getEpisodes, buildProviderLinks };
