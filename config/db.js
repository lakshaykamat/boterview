const mongoose = require('mongoose');
const logger = require('../utils/logger');
require('dotenv').config();

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    logger.info('✅ MongoDB connected');
  } catch (err) {
    logger.error(`❌ MongoDB connection error: ${err.message}`, err);
    process.exit(1);
  }
};

module.exports = connectDB;
