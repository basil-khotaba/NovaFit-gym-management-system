const mongoose = require('mongoose');

/**
 * Connects the application to MongoDB using the connection string
 * stored in the MONGO_URI environment variable.
 *
 * If the connection fails, the process exits with code 1 so the
 * server does not keep running in a broken state.
 *
 * @returns {Promise<void>}
 */
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('MongoDB connected successfully');
  } catch (error) {
    console.error('MongoDB connection failed:', error.message);
    process.exit(1);
  }
};

module.exports = connectDB;
