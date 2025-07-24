const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    const mongoURI = process.env.MONGO_URI;
    if (!mongoURI) {
      throw new Error('MONGODB_URI not defined in environment.');
    }
    await mongoose.connect(mongoURI);
    console.log('MongoDB connected successfully');
  } catch (err) {
    console.error('MongoDB connection failed:', err.message);
    process.exit(1); 
  }
};

module.exports = connectDB;
