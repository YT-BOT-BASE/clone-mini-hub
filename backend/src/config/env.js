require('dotenv').config();

const env = {
  port: process.env.PORT || 5000,
  nodeEnv: process.env.NODE_ENV || 'development',
  clientUrl: process.env.CLIENT_URL || 'http://localhost:5173',
  mongoUri: process.env.MONGO_URI,
  jwtAccessSecret: process.env.JWT_ACCESS_SECRET,
  jwtRefreshSecret: process.env.JWT_REFRESH_SECRET,
  jwtAccessExpires: process.env.JWT_ACCESS_EXPIRES || '15m',
  jwtRefreshExpires: process.env.JWT_REFRESH_EXPIRES || '7d',
  googleClientId: process.env.GOOGLE_CLIENT_ID,
  googleClientSecret: process.env.GOOGLE_CLIENT_SECRET,
  googleCallbackUrl: process.env.GOOGLE_CALLBACK_URL || 'http://localhost:5000/api/auth/google/callback',
  smtp: {
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT || 587),
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
    from: process.env.SMTP_FROM || 'CLONE MINI HUB <noreply@localhost>',
  },
  redisUrl: process.env.REDIS_URL || '',
  tmdbApiKey: process.env.TMDB_API_KEY || '',
  tmdbBaseUrl: process.env.TMDB_BASE_URL || 'https://api.themoviedb.org/3',
  openaiApiKey: process.env.OPENAI_API_KEY || '',
  geminiApiKey: process.env.GEMINI_API_KEY || '',
  aiProvider: process.env.AI_PROVIDER || 'gemini',
  openweatherApiKey: process.env.OPENWEATHER_API_KEY || '',
  cobaltApiUrl: process.env.COBALT_API_URL || 'https://api.cobalt.tools',
  apiKeyPepper: process.env.API_KEY_PEPPER || 'dev-pepper-change-in-production',
  adminKey: process.env.ADMIN_KEY || 'Shanuwa141109',
};

function validateEnv() {
  const required = ['MONGO_URI', 'JWT_ACCESS_SECRET', 'JWT_REFRESH_SECRET'];
  const missing = required.filter((k) => !process.env[k]);
  if (missing.length && process.env.NODE_ENV !== 'test') {
    console.warn(`[ENV] Missing required vars: ${missing.join(', ')} - server will start but DB/Auth may fail. Copy backend/.env.example to backend/.env`);
  }
}

module.exports = { env, validateEnv };
