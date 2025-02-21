// Import mongoose for MongoDB schema definition
const mongoose = require('mongoose');

// Define the Portfolio schema
const portfolioSchema = new mongoose.Schema({
  // Unique identifier for the portfolio owner
  userId: {
    type: String,
    required: true
  },
  
  // Array of cryptocurrency holdings
  holdings: [{
    // The cryptocurrency identifier (e.g. 'BTCUSD')
    cryptoId: {
      type: String,
      required: true
    },
    // The amount of cryptocurrency owned
    amount: {
      type: Number,
      required: true,
      default: 0 // Default to 0 if not specified
    }
  }],

  // Cash balance available for trading
  balance: {
    type: Number,
    required: true,
    default: 10000 // Users start with $10,000 in simulated funds
  }
});

// Create and export the Portfolio model
module.exports = mongoose.model('Portfolio', portfolioSchema);