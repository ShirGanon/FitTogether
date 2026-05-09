// MongoDB connection helper. Reads MONGO_URI from the environment (loaded by
// dotenv in app.js) and connects with Mongoose. Logs success/failure clearly so
// the developer immediately sees connection problems on startup.

const mongoose = require('mongoose');

async function connectDB() {
  const uri = process.env.MONGO_URI;
  if (!uri) {
    throw new Error('MONGO_URI is not set. Copy .env.example to server/.env and fill it in.');
  }

  mongoose.connection.on('error', (err) => {
    console.error('MongoDB connection error:', err.message);
  });
  mongoose.connection.on('disconnected', () => {
    console.warn('MongoDB disconnected.');
  });

  await mongoose.connect(uri);
  console.log('MongoDB connected.');
}

module.exports = connectDB;
