// Redis is OPTIONAL. If REDIS_URL is empty, the app runs without cache.
let client = null;
try {
  const { env } = require('./env');
  if (env.redisUrl) {
    const Redis = require('ioredis');
    client = new Redis(env.redisUrl, { lazyConnect: true, maxRetriesPerRequest: 2 });
    client.on('error', (e) => console.warn('[Redis] error:', e.message));
  }
} catch (e) {
  console.warn('[Redis] disabled:', e.message);
}

async function cacheGet(key) {
  if (!client) return null;
  try { return await client.get(key); } catch { return null; }
}
async function cacheSet(key, value, ttlSeconds = 300) {
  if (!client) return;
  try { await client.set(key, value, 'EX', ttlSeconds); } catch {}
}
async function cacheDel(key) {
  if (!client) return;
  try { await client.del(key); } catch {}
}

module.exports = { client, cacheGet, cacheSet, cacheDel };
