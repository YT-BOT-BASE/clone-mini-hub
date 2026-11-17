const swaggerJsdoc = require('swagger-jsdoc');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'CLONE MINI HUB API',
      version: '1.0.0',
      description: 'Professional Full-Stack API Platform - POWERED BY CLONE SHANUWA 🇱🇰',
    },
    servers: [{ url: '/', description: 'Current server' }],
    components: {
      securitySchemes: {
        bearerAuth: { type: 'http', scheme: 'bearer', bearerFormat: 'JWT' },
        apiKeyAuth: { type: 'apiKey', in: 'header', name: 'X-API-Key' },
      },
    },
    tags: [
      { name: 'Auth', description: 'Register, Login, Google OAuth, Passwords' },
      { name: 'User', description: 'Profile, Wallet, Daily Bonus, History' },
      { name: 'API Keys', description: 'Create / Revoke / Regenerate API keys' },
      { name: 'Download', description: 'YouTube, TikTok, Facebook, Instagram, Pinterest, Twitter/X, MediaFire, Google Drive' },
      { name: 'Movies', description: 'TMDB search, details, episodes, Sinhala subtitle metadata' },
      { name: 'AI', description: 'Chat, Text, Translate, Summarize, Image, TTS, STT' },
      { name: 'Utility', description: 'QR, Shortener, Metadata, Images, Base64, JSON, Password, Weather' },
    ],
  },
  apis: [`${__dirname}/*.js`, `${__dirname}/../routes/*.js`],
};

module.exports = swaggerJsdoc(options);
