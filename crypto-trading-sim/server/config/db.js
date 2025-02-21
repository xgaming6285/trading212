// Import MongoDB's driver (mongoose) for database interactions
const mongoose = require('mongoose');
// Load environment variables from .env file
require('dotenv').config();

// Function to establish MongoDB connection
const connectDB = async () => {
  try {
    // Connect to MongoDB using connection URI from environment variables
    const conn = await mongoose.connect(process.env.MONGODB_URI);
    // Log successful connection with host info
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    // Log any connection errors
    console.error(`Error: ${error.message}`);
    // Exit process with failure code
    process.exit(1);
  }
};

// Export function for use in server.js
module.exports = connectDB;