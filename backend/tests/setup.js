const mongoose = require('mongoose');

// In-memory MongoDB for tests - no external DB needed
beforeAll(async () => {
  const { MongoMemoryServer } = require('mongodb-memory-server');
  const mongod = await MongoMemoryServer.create();
  await mongoose.connect(mongod.getUri());
  global.__MONGOD__ = mongod;
});

afterAll(async () => {
  await mongoose.disconnect();
  if (global.__MONGOD__) await global.__MONGOD__.stop();
});

afterEach(async () => {
  const collections = mongoose.connection.collections;
  for (const key of Object.keys(collections)) {
    await collections[key].deleteMany({});
  }
});
