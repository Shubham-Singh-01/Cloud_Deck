require('dotenv').config();
const mongoose = require('mongoose');
const mongoURI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/corporatedb';

const connectToMongo = async () => {
  try {
    console.log('Attempting to connect to MongoDB with URI:', mongoURI);
    const connection = await mongoose.connect(mongoURI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      serverSelectionTimeoutMS: 5000, // 5-second timeout
      connectTimeoutMS: 10000, // 10-second connection timeout
      maxPoolSize: 10, // Max connection pool size
    });
    console.log('Connected to MongoDB successfully');
    return connection; // Return connection for testing
  } catch (error) {
    console.error('Database connection error:', {
      message: error.message,
      name: error.name,
      code: error.code,
    });
    // Retry after 5 seconds
    console.log('Retrying connection in 5 seconds...');
    setTimeout(connectToMongo, 5000);
  }
};

module.exports = connectToMongo;