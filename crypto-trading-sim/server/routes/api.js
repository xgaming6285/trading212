const express = require('express');
const router = express.Router();
const Transaction = require('../models/Transaction');
const Portfolio = require('../models/Portfolio');
const axios = require('axios');

// Function to get real-time price from Kraken
// This function fetches the current trading price of a cryptocurrency from the Kraken API
// It takes a cryptoId parameter (e.g. 'BTCUSD') and returns the latest trade price as a float
async function getKrakenPrice(cryptoId) {
  if (!cryptoId) {
    throw new Error('CryptoId is required');
  }

  try {
    // Kraken uses BTC instead of XBT for Bitcoin, so we need to convert the symbol
    const krakenPair = cryptoId.replace('XBT', 'BTC');

    // Make API request to Kraken's public ticker endpoint for the specified trading pair
    const response = await axios.get(`https://api.kraken.com/0/public/Ticker?pair=${krakenPair}`);

    // Kraken returns errors as an array in the response, check and throw if present
    if (response.data.error && response.data.error.length > 0) {
      throw new Error(response.data.error[0]);
    }

    if (!response.data || !response.data.result) {
      throw new Error('Invalid response format from Kraken API');
    }

    // Extract the price data from the nested response structure
    // result contains an object with the pair name as key, so we get the first key
    const result = response.data.result;
    const pairKey = Object.keys(result)[0];
    
    if (!pairKey || !result[pairKey] || !result[pairKey].c || !result[pairKey].c[0]) {
      throw new Error('Price data not found in Kraken response');
    }

    const price = parseFloat(result[pairKey].c[0]);
    if (isNaN(price)) {
      throw new Error('Invalid price format received from Kraken');
    }

    return price;
  } catch (error) {
    if (error.response) {
      // Handle specific HTTP errors
      throw new Error(`Kraken API error (${error.response.status}): ${error.response.data.error || error.message}`);
    }
    // Wrap any other errors with context about which crypto failed
    throw new Error(`Failed to fetch price for ${cryptoId}: ${error.message}`);
  }
}

// Get portfolio
// This route handler retrieves a user's portfolio by their userId
// If no portfolio exists for the user, it creates a new one with default values
router.get('/portfolio/:userId', async (req, res) => {
  if (!req.params.userId) {
    return res.status(400).json({ message: 'UserId is required' });
  }

  try {
    // Find the portfolio document matching the userId from the URL parameter
    const portfolio = await Portfolio.findOne({ userId: req.params.userId });

    if (!portfolio) {
      // If no portfolio exists for this user, create a new one
      // Portfolio model will set default values like initial balance
      const newPortfolio = await Portfolio.create({ userId: req.params.userId });
      return res.json(newPortfolio);
    }

    // Return the existing portfolio as JSON
    res.json(portfolio);

  } catch (error) {
    // Log the error for debugging
    console.error('Portfolio retrieval error:', error);
    // If any error occurs (e.g. database error), return 500 status with error message
    res.status(500).json({ message: 'Failed to retrieve portfolio', error: error.message });
  }
});

// Get transaction history
router.get('/transactions/:userId', async (req, res) => {
  if (!req.params.userId) {
    return res.status(400).json({ message: 'UserId is required' });
  }

  try {
    // Find all transactions for the given user ID
    // Sort by timestamp in descending order (newest first)
    const transactions = await Transaction.find({ userId: req.params.userId }).sort({ timestamp: -1 });

    // Return the transactions as JSON
    // If no transactions exist, this will return an empty array
    res.json(transactions);
  } catch (error) {
    // Log the error for debugging
    console.error('Transaction retrieval error:', error);
    // If there's an error (e.g. database connection issues)
    // Return a 500 status code with the error message
    res.status(500).json({ message: 'Failed to retrieve transactions', error: error.message });
  }
});

// Reset portfolio
router.post('/reset/:userId', async (req, res) => {
  if (!req.params.userId) {
    return res.status(400).json({ message: 'UserId is required' });
  }

  try {
    // Delete all transactions for this user
    await Transaction.deleteMany({ userId: req.params.userId });
    
    // Reset portfolio to initial state
    const portfolio = await Portfolio.findOne({ userId: req.params.userId });
    if (portfolio) {
      portfolio.balance = 10000; // Reset to initial balance
      portfolio.holdings = []; // Clear all holdings
      await portfolio.save();
    } else {
      // Create new portfolio if it doesn't exist
      await Portfolio.create({ userId: req.params.userId });
    }
    
    res.json({ message: 'Portfolio reset successfully', portfolio });
  } catch (error) {
    // Log the error for debugging
    console.error('Portfolio reset error:', error);
    res.status(500).json({ message: 'Failed to reset portfolio', error: error.message });
  }
});

// Execute trade
router.post('/trade', async (req, res) => {
  try {
    // Extract required fields from request body
    const { userId, type, cryptoId, amount } = req.body;
    let { price } = req.body;
    
    // Validate required fields are present
    if (!userId || !type || !cryptoId || !amount) {
      return res.status(400).json({ 
        message: 'Missing required fields',
        required: ['userId', 'type', 'cryptoId', 'amount'],
        received: { userId, type, cryptoId, amount }
      });
    }

    // Validate trade type
    if (!['buy', 'sell'].includes(type)) {
      return res.status(400).json({ message: 'Invalid trade type. Must be "buy" or "sell"' });
    }

    // Validate amount is positive
    if (amount <= 0) {
      return res.status(400).json({ message: 'Amount must be greater than 0' });
    }

    // If price not provided, fetch real-time price from Kraken API
    if (!price) {
      try {
        price = await getKrakenPrice(cryptoId);
      } catch (error) {
        return res.status(400).json({ message: 'Failed to get crypto price', error: error.message });
      }
    } else if (price <= 0) {
      return res.status(400).json({ message: 'Price must be greater than 0' });
    }

    // Find user's portfolio
    const portfolio = await Portfolio.findOne({ userId });
    if (!portfolio) {
      return res.status(404).json({ message: 'Portfolio not found' });
    }

    const totalCost = amount * price;
    
    if (type === 'buy') {
      // Check if user has enough funds for purchase
      if (portfolio.balance < totalCost) {
        return res.status(400).json({ 
          message: 'Insufficient funds',
          required: totalCost,
          available: portfolio.balance
        });
      }
      
      // Deduct cost from balance
      portfolio.balance -= totalCost;
      
      // Add crypto to holdings
      const holdingIndex = portfolio.holdings.findIndex(h => h.cryptoId === cryptoId);
      if (holdingIndex >= 0) {
        // Add to existing holding
        portfolio.holdings[holdingIndex].amount += amount;
      } else {
        // Create new holding
        portfolio.holdings.push({ cryptoId, amount });
      }

    } else if (type === 'sell') {
      // Check if user has enough crypto to sell
      const holdingIndex = portfolio.holdings.findIndex(h => h.cryptoId === cryptoId);
      if (holdingIndex === -1 || portfolio.holdings[holdingIndex].amount < amount) {
        return res.status(400).json({ 
          message: 'Insufficient crypto balance',
          required: amount,
          available: holdingIndex >= 0 ? portfolio.holdings[holdingIndex].amount : 0
        });
      }
      
      // Add proceeds to balance
      portfolio.balance += totalCost;
      
      // Remove crypto from holdings
      portfolio.holdings[holdingIndex].amount -= amount;
      
      // Remove holding entirely if amount is 0
      if (portfolio.holdings[holdingIndex].amount === 0) {
        portfolio.holdings.splice(holdingIndex, 1);
      }
    }

    // Save updated portfolio
    await portfolio.save();
    
    // Create transaction record
    const transaction = await Transaction.create({
      userId,
      type,
      cryptoId, 
      amount,
      price,
      total: totalCost
    });

    // Return updated data
    res.status(201).json({ 
      transaction,
      portfolio,
      priceSource: price === req.body.price ? 'manual' : 'kraken'
    });

  } catch (error) {
    // Log the error for debugging
    console.error('Trade execution error:', error);
    res.status(500).json({ message: 'Failed to execute trade', error: error.message });
  }
});

module.exports = router; 
