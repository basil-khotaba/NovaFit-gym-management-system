const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');

/**
 * Spins up an in-memory MongoDB instance for tests.
 *
 * This keeps the test suite from ever touching the real development
 * or production database — every test file gets its own throwaway
 * database that only exists for the duration of that file's run.
 */

let mongod;

const connect = async () => {
  mongod = await MongoMemoryServer.create();
  await mongoose.connect(mongod.getUri());
};

const closeDatabase = async () => {
  await mongoose.connection.dropDatabase();
  await mongoose.connection.close();
  if (mongod) await mongod.stop();
};

const clearDatabase = async () => {
  const { collections } = mongoose.connection;
  for (const key of Object.keys(collections)) {
    await collections[key].deleteMany({});
  }
};

module.exports = { connect, closeDatabase, clearDatabase };
