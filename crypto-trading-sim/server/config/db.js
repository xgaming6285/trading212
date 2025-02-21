// Import MongoDB's driver (mongoose) for database interactions
const mongoose = require('mongoose');
// Load environment variables from .env file
require('dotenv').config();

// Function to establish MongoDB connection
const connectDB = async () => {
  try {
    // Connect to MongoDB using connection URI from environment variables
    const conn = await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    // Log successful connection with host info
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    // Enhanced error handling
    if (error instanceof mongoose.Error) {
      console.error(`Mongoose Error: ${error.message}`);
    } else if (error.code === 'ENOTFOUND') {
      console.error('Error: Unable to connect to the database. Please check your connection string.');
    } else {
      console.error(`Error: ${error.message}`);
    }
    // Exit process with failure code
    process.exit(1);
  }
};

// Export function for use in server.js
module.exports = connectDB;

/*
++ Endpoints ++
 
1. Get Portfolio
- GET http://localhost:5000/api/portfolio/Elijah_Mikaelson

2. Get Transaction History
- GET http://localhost:5000/api/transactions/Elijah_Mikaelson

3. Reset Portfolio
- POST http://localhost:5000/api/reset/Elijah_Mikaelson

4. Execute Trade
- POST http://localhost:5000/api/trade
   Content-Type: application/json

   {
     "userId": "Elijah_Mikaelson",
     "type": "buy",
     "cryptoId": "BTCUSD",
     "amount": 1,
     "price": 50000
   }
*/