// Import mongoose for MongoDB schema definition
const mongoose = require('mongoose');

// Define the Transaction schema to track cryptocurrency trades
const transactionSchema = new mongoose.Schema({
  // Unique identifier for the user making the trade
  userId: {
    type: String,
    required: true
  },
  // Type of transaction - either 'buy' or 'sell'
  type: {
    type: String,
    enum: ['buy', 'sell'],
    required: true
  },
  // The cryptocurrency identifier (e.g. 'BTCUSD')
  cryptoId: {
    type: String,
    required: true
  },
  // Quantity of cryptocurrency traded
  amount: {
    type: Number,
    required: true
  },
  // Price per unit at time of trade
  price: {
    type: Number,
    required: true
  },
  // Total value of the transaction (amount * price)
  total: {
    type: Number,
    required: true
  },
  // When the transaction occurred
  timestamp: {
    type: Date,
    default: Date.now
  }
});

// Create and export the Transaction model
module.exports = mongoose.model('Transaction', transactionSchema);