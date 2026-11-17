const app = require('./app');
const { connectDB } = require('./config/db');
const { env, validateEnv } = require('./config/env');
const { seedIfEmpty } = require('./config/seed');

async function start() {
  validateEnv();
  await connectDB();
  await seedIfEmpty();
  const server = app.listen(env.port, '0.0.0.0', () => {
    console.log(`[SERVER] CLONE MINI HUB running on port ${env.port} (${env.nodeEnv})`);
    console.log(`[SERVER] API Docs: http://localhost:${env.port}/api/docs`);
    console.log('[SERVER] POWERED BY CLONE SHANUWA 🇱🇰');
  });

  // Auto-restart friendly shutdown
  const shutdown = (sig) => {
    console.log(`[SERVER] ${sig} received, shutting down...`);
    server.close(() => process.exit(0));
    setTimeout(() => process.exit(1), 10000);
  };
  process.on('SIGTERM', () => shutdown('SIGTERM'));
  process.on('SIGINT', () => shutdown('SIGINT'));
  process.on('unhandledRejection', (e) => console.error('[SERVER] Unhandled rejection:', e.message));
}

start().catch((e) => {
  console.error('[SERVER] Failed to start:', e.message);
  process.exit(1);
});
