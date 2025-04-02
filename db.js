const mongoose = require('mongoose');

 const connectDB = async () => {
  try {
    await mongoose.connect('mongodb://localhost:27017/ecommerce');
    console.log('MongoDB connected!');
  } catch (error) {
    console.error('ERROR in MongoDB connection:', error.message);
    process.exit(1);
  }
};

module.exports = connectDB;
