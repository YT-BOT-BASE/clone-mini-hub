const mongoose = require('mongoose');
const { env } = require('./env');

async function connectDB() {
  if (!env.mongoUri) throw new Error('MONGO_URI is not set. Copy backend/.env.example to backend/.env and add your MongoDB Atlas URL.');
  mongoose.set('strictQuery', true);
  await mongoose.connect(env.mongoUri);
  console.log('[DB] MongoDB connected:', mongoose.connection.host, '/', mongoose.connection.name);
}

async function disconnectDB() {
  await mongoose.disconnect();
}

module.exports = { connectDB, disconnectDB, mongoose };
