const express = require('express');
const router = express.Router();
const Transaction = require('../models/Transaction');
const Portfolio = require('../models/Portfolio');
const axios = require('axios');

// Function to get real-time price from Kraken
async function getKrakenPrice(cryptoId) {
  try {
    // Convert cryptoId to Kraken pair format if needed
    const krakenPair = cryptoId.replace('XBT', 'BTC'); // Handle Bitcoin symbol difference
    const response = await axios.get(`https://api.kraken.com/0/public/Ticker?pair=${krakenPair}`);
    
    if (response.data.error && response.data.error.length > 0) {
      throw new Error(response.data.error[0]);
    }

    const result = response.data.result;
    const pairData = result[Object.keys(result)[0]];
    
    // Return the last trade price
    return parseFloat(pairData.c[0]);
  } catch (error) {
    throw new Error(`Failed to fetch price for ${cryptoId}: ${error.message}`);
  }
}

// Get portfolio
router.get('/portfolio/:userId', async (req, res) => {
  try {
    const portfolio = await Portfolio.findOne({ userId: req.params.userId });
    if (!portfolio) {
      // Create new portfolio if it doesn't exist
      const newPortfolio = await Portfolio.create({ userId: req.params.userId });
      return res.json(newPortfolio);
    }
    res.json(portfolio);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get transaction history
router.get('/transactions/:userId', async (req, res) => {
  try {
    const transactions = await Transaction.find({ userId: req.params.userId }).sort({ timestamp: -1 });
    res.json(transactions);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Reset portfolio
router.post('/reset/:userId', async (req, res) => {
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
    res.status(500).json({ message: error.message });
  }
});

// Execute trade
router.post('/trade', async (req, res) => {
  try {
    const { userId, type, cryptoId, amount } = req.body;
    let { price } = req.body;
    
    if (!userId || !type || !cryptoId || !amount) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    // If price is not provided, fetch real-time price from Kraken
    if (!price) {
      try {
        price = await getKrakenPrice(cryptoId);
      } catch (error) {
        return res.status(400).json({ message: error.message });
      }
    }

    const portfolio = await Portfolio.findOne({ userId });
    if (!portfolio) {
      return res.status(404).json({ message: 'Portfolio not found' });
    }

    const totalCost = amount * price;
    
    if (type === 'buy') {
      if (portfolio.balance < totalCost) {
        return res.status(400).json({ message: 'Insufficient funds' });
      }
      
      portfolio.balance -= totalCost;
      const holdingIndex = portfolio.holdings.findIndex(h => h.cryptoId === cryptoId);
      
      if (holdingIndex >= 0) {
        portfolio.holdings[holdingIndex].amount += amount;
      } else {
        portfolio.holdings.push({ cryptoId, amount });
      }
    } else if (type === 'sell') {
      const holdingIndex = portfolio.holdings.findIndex(h => h.cryptoId === cryptoId);
      if (holdingIndex === -1 || portfolio.holdings[holdingIndex].amount < amount) {
        return res.status(400).json({ message: 'Insufficient crypto balance' });
      }
      
      portfolio.balance += totalCost;
      portfolio.holdings[holdingIndex].amount -= amount;
      
      if (portfolio.holdings[holdingIndex].amount === 0) {
        portfolio.holdings.splice(holdingIndex, 1);
      }
    }

    await portfolio.save();
    
    const transaction = await Transaction.create({
      userId,
      type,
      cryptoId,
      amount,
      price,
      total: totalCost
    });

    res.status(201).json({ 
      transaction, 
      portfolio,
      priceSource: price === req.body.price ? 'manual' : 'kraken'
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router; 