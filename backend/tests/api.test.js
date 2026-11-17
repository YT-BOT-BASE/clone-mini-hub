/**
 * CLONE MINI HUB - Automated API Tests
 * Run: npm test
 */
process.env.NODE_ENV = 'test';
process.env.JWT_ACCESS_SECRET = 'test_access_secret_at_least_32_characters_long';
process.env.JWT_REFRESH_SECRET = 'test_refresh_secret_at_least_32_characters_long';
process.env.MONGO_URI = 'mongodb://localhost/test-placeholder';

const request = require('supertest');
const app = require('../src/app');
const User = require('../src/models/User');
const ApiKey = require('../src/models/ApiKey');
const ApiEndpoint = require('../src/models/ApiEndpoint');
const { hashApiKey } = require('../src/utils/hash');

require('./setup');

describe('Health & Status', () => {
  test('GET /api/health returns ok', async () => {
    const res = await request(app).get('/api/health');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.status).toBe('ok');
  });

  test('GET /api/marketplace lists endpoints after seed', async () => {
    const { seedIfEmpty } = require('../src/config/seed');
    await seedIfEmpty();
    const res = await request(app).get('/api/marketplace');
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body.data.endpoints)).toBe(true);
    expect(res.body.data.endpoints.length).toBeGreaterThan(0);
  });
});

describe('Auth System', () => {
  test('register creates user with 50 starting coins', async () => {
    const res = await request(app).post('/api/auth/register').send({
      name: 'Test User', email: 'test@example.com', password: 'secret123',
    });
    expect(res.status).toBe(201);
    expect(res.body.data.user.coins).toBe(50);
    expect(res.body.data.user.password).toBeUndefined();
    expect(res.body.data.accessToken).toBeTruthy();
  });

  test('register rejects duplicate email', async () => {
    await request(app).post('/api/auth/register').send({ name: 'A', email: 'dup@example.com', password: 'secret123' });
    const res = await request(app).post('/api/auth/register').send({ name: 'B', email: 'dup@example.com', password: 'secret123' });
    expect(res.status).toBe(409);
  });

  test('login works with correct password', async () => {
    await request(app).post('/api/auth/register').send({ name: 'L', email: 'login@example.com', password: 'secret123' });
    const res = await request(app).post('/api/auth/login').send({ email: 'login@example.com', password: 'secret123' });
    expect(res.status).toBe(200);
    expect(res.body.data.accessToken).toBeTruthy();
  });

  test('login fails with wrong password', async () => {
    const res = await request(app).post('/api/auth/login').send({ email: 'nobody@example.com', password: 'wrong' });
    expect(res.status).toBe(401);
  });

  test('GET /api/auth/me requires token', async () => {
    const res = await request(app).get('/api/auth/me');
    expect(res.status).toBe(401);
  });

  test('validation rejects short password', async () => {
    const res = await request(app).post('/api/auth/register').send({ name: 'V', email: 'v@example.com', password: '123' });
    expect(res.status).toBe(400);
    expect(res.body.error.code).toBe('VALIDATION_ERROR');
  });
});

describe('API Key System', () => {
  let token;
  beforeEach(async () => {
    const reg = await request(app).post('/api/auth/register').send({ name: 'Key User', email: 'keys@example.com', password: 'secret123' });
    token = reg.body.data.accessToken;
  });

  test('create API key shows full key once', async () => {
    const res = await request(app).post('/api/keys').set('Authorization', `Bearer ${token}`).send({ name: 'My Key' });
    expect(res.status).toBe(201);
    expect(res.body.data.fullKey).toMatch(/^cmh_live_/);
    expect(res.body.data.apiKey.prefix).toBeTruthy();
  });

  test('list keys never returns full key or hash', async () => {
    await request(app).post('/api/keys').set('Authorization', `Bearer ${token}`).send({ name: 'K' });
    const res = await request(app).get('/api/keys').set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(200);
    const key = res.body.data.keys[0];
    expect(key.keyHash).toBeUndefined();
    expect(key.fullKey).toBeUndefined();
  });

  test('revoked key is rejected by API auth', async () => {
    const created = await request(app).post('/api/keys').set('Authorization', `Bearer ${token}`).send({ name: 'Revoke Me' });
    const fullKey = created.body.data.fullKey;
    const keyId = created.body.data.apiKey._id;
    // valid key passes API auth (using weather endpoint which will fail later at service layer with 503, but auth passes)
    const before = await request(app).get('/api/utility/weather?city=Colombo').set('X-API-Key', fullKey);
    expect([200, 503]).toContain(before.status); // 503 = weather key not configured, but auth passed
    await request(app).patch(`/api/keys/${keyId}/revoke`).set('Authorization', `Bearer ${token}`);
    const after = await request(app).get('/api/utility/weather?city=Colombo').set('X-API-Key', fullKey);
    expect(after.status).toBe(401);
    expect(after.body.error.code).toBe('INVALID_API_KEY');
  });

  test('regenerate rotates the key', async () => {
    const created = await request(app).post('/api/keys').set('Authorization', `Bearer ${token}`).send({ name: 'Rotate' });
    const oldKey = created.body.data.fullKey;
    const keyId = created.body.data.apiKey._id;
    const res = await request(app).patch(`/api/keys/${keyId}/regenerate`).set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(200);
    expect(res.body.data.fullKey).not.toBe(oldKey);
    const after = await request(app).get('/api/utility/weather?city=Colombo').set('X-API-Key', oldKey);
    expect(after.status).toBe(401);
  });
});

describe('Coin System', () => {
  let token;
  beforeEach(async () => {
    const reg = await request(app).post('/api/auth/register').send({ name: 'Coin User', email: 'coins@example.com', password: 'secret123' });
    token = reg.body.data.accessToken;
  });

  test('wallet shows starting balance', async () => {
    const res = await request(app).get('/api/user/wallet').set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(200);
    expect(res.body.data.coins).toBe(50);
  });

  test('daily bonus adds coins and cannot be claimed twice', async () => {
    const first = await request(app).post('/api/user/daily-bonus').set('Authorization', `Bearer ${token}`);
    expect(first.status).toBe(200);
    expect(first.body.data.balance).toBe(100);
    const second = await request(app).post('/api/user/daily-bonus').set('Authorization', `Bearer ${token}`);
    expect(second.status).toBe(409);
  });

  test('transactions history records bonus', async () => {
    await request(app).post('/api/user/daily-bonus').set('Authorization', `Bearer ${token}`);
    const res = await request(app).get('/api/user/transactions').set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(200);
    expect(res.body.data.length).toBeGreaterThanOrEqual(1);
    expect(['SIGNUP_BONUS', 'DAILY_BONUS']).toContain(res.body.data[0].type);
  });

  test('insufficient coins returns 402 and no deduction', async () => {
    const user = await User.findOne({ email: 'coins@example.com' });
    user.coins = 0;
    await user.save();
    const created = await request(app).post('/api/keys').set('Authorization', `Bearer ${token}`).send({ name: 'K' });
    const res = await request(app).get('/api/utility/weather?city=Colombo').set('X-API-Key', created.body.data.fullKey);
    expect(res.status).toBe(402);
    expect(res.body.error.code).toBe('INSUFFICIENT_COINS');
    const after = await User.findOne({ email: 'coins@example.com' });
    expect(after.coins).toBe(0); // nothing deducted
  });
});

describe('Admin Dashboard', () => {
  test('admin endpoints require ADMIN role', async () => {
    const reg = await request(app).post('/api/auth/register').send({ name: 'Normal', email: 'normal@example.com', password: 'secret123' });
    const res = await request(app).get('/api/admin/dashboard').set('Authorization', `Bearer ${reg.body.data.accessToken}`);
    expect(res.status).toBe(403);
  });

  test('admin dashboard returns stats', async () => {
    const admin = await User.create({ name: 'Admin', email: 'admin@test.com', password: 'secret123', role: 'ADMIN', isVerified: true });
    const login = await request(app).post('/api/auth/login').send({ email: 'admin@test.com', password: 'secret123' });
    const res = await request(app).get('/api/admin/dashboard').set('Authorization', `Bearer ${login.body.data.accessToken}`);
    expect(res.status).toBe(200);
    expect(res.body.data.stats).toHaveProperty('totalUsers');
    expect(res.body.data.stats).toHaveProperty('uptimeSeconds');
  });

  test('admin can suspend and activate users', async () => {
    await User.create({ name: 'Admin', email: 'admin2@test.com', password: 'secret123', role: 'ADMIN', isVerified: true });
    const target = await request(app).post('/api/auth/register').send({ name: 'Target', email: 'target@test.com', password: 'secret123' });
    const login = await request(app).post('/api/auth/login').send({ email: 'admin2@test.com', password: 'secret123' });
    const res = await request(app).patch(`/api/admin/users/${target.body.data.user._id}/suspend`).set('Authorization', `Bearer ${login.body.data.accessToken}`);
    expect(res.status).toBe(200);
    expect(res.body.data.user.isSuspended).toBe(true);
    const loginSuspended = await request(app).post('/api/auth/login').send({ email: 'target@test.com', password: 'secret123' });
    expect(loginSuspended.status).toBe(403);
  });
});

describe('Utility APIs', () => {
  test('QR generator returns data URL', async () => {
    const reg = await request(app).post('/api/auth/register').send({ name: 'Util', email: 'util@example.com', password: 'secret123' });
    const created = await request(app).post('/api/keys').set('Authorization', `Bearer ${reg.body.data.accessToken}`).send({ name: 'U' });
    const res = await request(app).get('/api/utility/qr?text=hello').set('X-API-Key', created.body.data.fullKey);
    expect(res.status).toBe(200);
    expect(res.body.data.qrCode).toMatch(/^data:image\/png;base64,/);
  });

  test('password generator works', async () => {
    const reg = await request(app).post('/api/auth/register').send({ name: 'P', email: 'pw@example.com', password: 'secret123' });
    const created = await request(app).post('/api/keys').set('Authorization', `Bearer ${reg.body.data.accessToken}`).send({ name: 'P' });
    const res = await request(app).get('/api/utility/password?length=20').set('X-API-Key', created.body.data.fullKey);
    expect(res.status).toBe(200);
    expect(res.body.data.password).toHaveLength(20);
  });

  test('URL shortener creates and redirects', async () => {
    const reg = await request(app).post('/api/auth/register').send({ name: 'S', email: 'short@example.com', password: 'secret123' });
    const created = await request(app).post('/api/keys').set('Authorization', `Bearer ${reg.body.data.accessToken}`).send({ name: 'S' });
    const res = await request(app).post('/api/utility/shorten').set('X-API-Key', created.body.data.fullKey).send({ url: 'https://example.com' });
    expect(res.status).toBe(201);
    const code = res.body.data.code;
    const redirect = await request(app).get(`/api/utility/s/${code}`);
    expect(redirect.status).toBe(302);
    expect(redirect.headers.location).toBe('https://example.com');
  });

  test('base64 encode/decode roundtrip', async () => {
    const reg = await request(app).post('/api/auth/register').send({ name: 'B', email: 'b64@example.com', password: 'secret123' });
    const created = await request(app).post('/api/keys').set('Authorization', `Bearer ${reg.body.data.accessToken}`).send({ name: 'B' });
    const enc = await request(app).post('/api/utility/base64/encode').set('X-API-Key', created.body.data.fullKey).send({ text: 'CLONE SHANUWA' });
    expect(enc.status).toBe(200);
    const dec = await request(app).post('/api/utility/base64/decode').set('X-API-Key', created.body.data.fullKey).send({ text: enc.body.data.encoded });
    expect(dec.body.data.decoded).toBe('CLONE SHANUWA');
  });

  test('AI endpoints return clear unavailable error when no provider key (never fake data)', async () => {
    const reg = await request(app).post('/api/auth/register').send({ name: 'AI', email: 'ai@example.com', password: 'secret123' });
    const created = await request(app).post('/api/keys').set('Authorization', `Bearer ${reg.body.data.accessToken}`).send({ name: 'AI' });
    const res = await request(app).post('/api/ai/chat').set('X-API-Key', created.body.data.fullKey).send({ messages: [{ role: 'user', content: 'hi' }] });
    expect(res.status).toBe(503);
    expect(res.body.error.code).toBe('SERVICE_UNAVAILABLE');
  });
});

describe('Error Handling', () => {
  test('unknown API route returns 404 JSON', async () => {
    const res = await request(app).get('/api/nothing-here');
    expect(res.status).toBe(404);
    expect(res.body.success).toBe(false);
  });

  test('API auth rejects garbage keys', async () => {
    const res = await request(app).get('/api/utility/qr?text=x').set('X-API-Key', 'cmh_live_garbage');
    expect(res.status).toBe(401);
    expect(res.body.error.code).toBe('INVALID_API_KEY');
  });
});
