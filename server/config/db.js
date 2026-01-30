const mongoose = require('mongoose');

let mockMode = false;

const connectDB = async () => {
  try {
    // Try to connect to the configured MongoDB URI
    const conn = await mongoose.connect(process.env.MONGODB_URI, {
      serverSelectionTimeoutMS: 5000 // 5 second timeout
    });
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.log(`MongoDB connection failed: ${error.message}`);
    console.log('⚠️  Running in DEMO MODE without database');
    console.log('   To use full features, install MongoDB and update .env');
    mockMode = true;
  }
};

const isMockMode = () => mockMode;

module.exports = connectDB;
module.exports.isMockMode = isMockMode;
