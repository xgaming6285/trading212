const mongoose = require('mongoose');

const portfolioSchema = new mongoose.Schema({
  userId: {
    type: String,
    required: true
  },
  holdings: [{
    cryptoId: {
      type: String,
      required: true
    },
    amount: {
      type: Number,
      required: true,
      default: 0
    }
  }],
  balance: {
    type: Number,
    required: true,
    default: 10000 // Starting balance
  }
});

module.exports = mongoose.model('Portfolio', portfolioSchema); 