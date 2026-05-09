// Shared MongoDB memory-server helpers used in every test file.
// Each test file calls connect/disconnect in beforeAll/afterAll,
// and clear in afterEach to start each test with a clean DB.

const { MongoMemoryServer } = require('mongodb-memory-server');
const mongoose = require('mongoose');

let mongod;

async function connect() {
  mongod = await MongoMemoryServer.create();
  await mongoose.connect(mongod.getUri());
}

async function disconnect() {
  await mongoose.disconnect();
  await mongod.stop();
}

async function clear() {
  for (const collection of Object.values(mongoose.connection.collections)) {
    await collection.deleteMany({});
  }
}

module.exports = { connect, disconnect, clear };
