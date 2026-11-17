/* CLONE MINI HUB - End-to-End Smoke Test (in-memory MongoDB + real Express server) */
process.env.NODE_ENV = 'production';
process.env.JWT_ACCESS_SECRET = 'smoke_test_access_secret_at_least_32_chars!';
process.env.JWT_REFRESH_SECRET = 'smoke_test_refresh_secret_at_least_32_chars!';
process.env.API_KEY_PEPPER = 'smoke_test_pepper_at_least_32_characters!';

const { MongoMemoryServer } = require('mongodb-memory-server');

(async () => {
  const mongod = await MongoMemoryServer.create();
  process.env.MONGO_URI = mongod.getUri('clone-mini-hub');

  const app = require('./src/app');
  const { connectDB } = require('./src/config/db');
  const { seedIfEmpty } = require('./src/config/seed');
  await connectDB();
  await seedIfEmpty();

  const server = app.listen(5055, '0.0.0.0');
  const base = 'http://127.0.0.1:5055';
  const results = [];
  const check = (name, ok, extra = '') => {
    results.push({ name, ok });
    console.log(`${ok ? '✅' : '❌'} ${name}${extra ? ' — ' + extra : ''}`);
  };

  // 1. Health
  let res = await fetch(`${base}/api/health`);
  let body = await res.json();
  check('GET /api/health', res.status === 200 && body.success === true);

  // 2. Status page data
  res = await fetch(`${base}/api/status`);
  body = await res.json();
  check('GET /api/status', res.status === 200 && body.data.endpoints.length >= 20, `${body.data.endpoints.length} endpoints`);

  // 3. Marketplace
  res = await fetch(`${base}/api/marketplace`);
  body = await res.json();
  check('GET /api/marketplace', res.status === 200 && body.data.endpoints.length > 0);

  // 4. Frontend served
  res = await fetch(`${base}/`);
  const html = await res.text();
  check('GET / serves React build', res.status === 200 && html.includes('<div id="root">'));

  // 5. Register
  res = await fetch(`${base}/api/auth/register`, {
    method: 'POST', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name: 'Smoke Tester', email: 'smoke@test.com', password: 'secret123' }),
  });
  body = await res.json();
  check('POST /api/auth/register', res.status === 201 && body.data.user.coins === 50);
  const token = body.data.accessToken;

  // 6. Create API key
  res = await fetch(`${base}/api/keys`, {
    method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
    body: JSON.stringify({ name: 'Smoke Key' }),
  });
  body = await res.json();
  check('POST /api/keys (full key shown once)', res.status === 201 && body.data.fullKey.startsWith('cmh_live_'));
  const apiKey = body.data.fullKey;

  // 7. Use API key: QR
  res = await fetch(`${base}/api/utility/qr?text=CLONE%20MINI%20HUB`, { headers: { 'X-API-Key': apiKey } });
  body = await res.json();
  check('GET /api/utility/qr with API key', res.status === 200 && body.data.qrCode.startsWith('data:image/png'));

  // 8. Coin deduction happened
  res = await fetch(`${base}/api/user/wallet`, { headers: { Authorization: `Bearer ${token}` } });
  body = await res.json();
  check('Coin charged for API usage (50→49)', body.data.coins === 49, `balance=${body.data.coins}`);

  // 9. Daily bonus
  res = await fetch(`${base}/api/user/daily-bonus`, { method: 'POST', headers: { Authorization: `Bearer ${token}` } });
  body = await res.json();
  check('POST /api/user/daily-bonus', res.status === 200 && body.data.balance === 99);

  // 10. Auth required for protected route
  res = await fetch(`${base}/api/keys`);
  check('Protected route without token → 401', res.status === 401);

  // 11. Garbage API key rejected
  res = await fetch(`${base}/api/utility/qr?text=x`, { headers: { 'X-API-Key': 'cmh_live_bad' } });
  check('Garbage API key → 401', res.status === 401);

  // 12. AI without provider key → clear unavailable (no fake data)
  res = await fetch(`${base}/api/ai/chat`, {
    method: 'POST', headers: { 'Content-Type': 'application/json', 'X-API-Key': apiKey },
    body: JSON.stringify({ messages: [{ role: 'user', content: 'hi' }] }),
  });
  body = await res.json();
  check('AI chat without key → 503 SERVICE_UNAVAILABLE (no fake data)', res.status === 503 && body.error.code === 'SERVICE_UNAVAILABLE');

  // 13. Failed request → auto refund (chat cost 3 refunded async; wait briefly)
  await new Promise((r) => setTimeout(r, 800));
  res = await fetch(`${base}/api/user/wallet`, { headers: { Authorization: `Bearer ${token}` } });
  body = await res.json();
  check('Auto-refund on failed request', body.data.coins === 99, `balance=${body.data.coins}`);

  // 14. Admin login (seeded) + dashboard
  res = await fetch(`${base}/api/auth/login`, {
    method: 'POST', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'admin@cloneminHub.lk', password: 'Admin@123456' }),
  });
  body = await res.json();
  const adminToken = body.data.accessToken;
  check('Seeded admin login works', res.status === 200 && !!adminToken);
  res = await fetch(`${base}/api/admin/dashboard`, { headers: { Authorization: `Bearer ${adminToken}` } });
  body = await res.json();
  check('GET /api/admin/dashboard', res.status === 200 && body.data.stats.totalUsers >= 2);

  // 15. Swagger docs
  res = await fetch(`${base}/api/openapi.json`);
  body = await res.json();
  check('OpenAPI spec available', res.status === 200 && body.openapi);

  server.close();
  await mongod.stop();
  const failed = results.filter((r) => !r.ok);
  console.log(`\n${'='.repeat(50)}\nSMOKE TEST: ${results.length - failed.length}/${results.length} passed`);
  process.exit(failed.length ? 1 : 0);
})().catch((e) => { console.error('SMOKE FAILED:', e); process.exit(1); });
