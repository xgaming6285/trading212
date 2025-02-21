import React, { useState, useCallback, useMemo, useEffect } from 'react';
import './App.css';
import CryptoList from './components/CryptoList';
import AccountBalance from './components/AccountBalance';
import TransactionHistory from './components/TransactionHistory';
import ThemeSwitch from './components/ThemeSwitch';
import axios from 'axios';
import { 
  Container, 
  Grid, 
  Paper, 
  Typography, 
  Box, 
  createTheme, 
  ThemeProvider, 
  CssBaseline,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Divider,
  Alert,
  Snackbar
} from '@mui/material';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';
const USER_ID = 'Elijah_Mikaelson'; 

function App() {
  const [balance, setBalance] = useState(0);
  const [holdings, setHoldings] = useState({});
  const [transactions, setTransactions] = useState([]);
  const [cryptoPrices, setCryptoPrices] = useState({});
  const [mode, setMode] = useState('light');
  const [showWelcome, setShowWelcome] = useState(() => {
    return !localStorage.getItem('welcomeShown');
  });
  const [error, setError] = useState(null);

  // Fetch portfolio data
  const fetchPortfolio = async () => {
    try {
      // Get portfolio data for the current user from the API
      const response = await axios.get(`${API_BASE_URL}/portfolio/${USER_ID}`);
      const portfolio = response.data;
      
      // Update the balance state with the portfolio balance
      setBalance(portfolio.balance);
      
      // Convert the holdings array from the API into an object format
      // where the keys are crypto IDs and values are amounts held
      const holdingsObj = {};
      portfolio.holdings.forEach(holding => {
        holdingsObj[holding.cryptoId] = holding.amount;
      });
      setHoldings(holdingsObj);
    } catch (err) {
      setError('Failed to fetch portfolio data');
      console.error('Error fetching portfolio:', err);
    }
  };

  // Fetch transaction history for the current user
  const fetchTransactions = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/transactions/${USER_ID}`);
      setTransactions(response.data);
    } catch (err) {
      setError('Failed to fetch transactions');
      console.error('Error fetching transactions:', err);
    }
  };

  // Fetch initial portfolio and transaction data when component mounts
  useEffect(() => {
    fetchPortfolio();
    fetchTransactions(); 
  }, []);

  // Create theme object based on current mode (light/dark)
  const theme = useMemo(
    () =>
      createTheme({
        palette: {
          mode,
        },
      }),
    [mode],
  );

  // Toggle between light and dark theme
  const toggleTheme = () => {
    setMode((prevMode) => (prevMode === 'light' ? 'dark' : 'light'));
  };

  // Update crypto prices when new data comes in
  const handleSetPrices = useCallback((prices) => {
    setCryptoPrices(prices);
  }, []);

  // Handle buy/sell transactions
  const handleTransaction = async (type, crypto, amount, price) => {
    try {
      // Send trade request to API
      const response = await axios.post(`${API_BASE_URL}/trade`, {
        userId: USER_ID,
        type,
        cryptoId: crypto,
        amount: Number(amount),
        price: Number(price)
      });

      // Update local state with response data
      const { portfolio, transaction } = response.data;
      
      // Update balance
      setBalance(portfolio.balance);
      
      // Convert holdings array to object and update holdings
      const holdingsObj = {};
      portfolio.holdings.forEach(holding => {
        holdingsObj[holding.cryptoId] = holding.amount;
      });
      setHoldings(holdingsObj);

      // Add new transaction to history
      setTransactions(prev => [transaction, ...prev]);
    } catch (err) {
      setError(err.response?.data?.message || 'Transaction failed');
      console.error('Error executing trade:', err);
    }
  };

  // Reset portfolio to initial state
  const handleReset = async () => {
    try {
      const response = await axios.post(`${API_BASE_URL}/reset/${USER_ID}`);
      
      // Update state with reset portfolio data
      if (response.data.portfolio) {
        setBalance(response.data.portfolio.balance);
        setHoldings({}); // Clear all holdings
      }
      setTransactions([]); // Clear transaction history
      setError(null);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to reset portfolio');
      console.error('Error resetting portfolio:', err);
    }
  };

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
          <Box>
            <Typography 
              variant="h3" 
              component="h3"
              sx={{ fontWeight: 'bold', mb: 1 }}
            >
              Crypto Trading Simulator
            </Typography>
            <Typography variant="subtitle1" color="text.secondary">
              Practice trading with virtual money in a risk-free environment
            </Typography>
          </Box>
          <ThemeSwitch toggleTheme={toggleTheme} />
        </Box>
        <Divider sx={{ mb: 4 }} />
        <Grid container spacing={4}>
          <Grid item xs={12}>
            <Paper elevation={3} sx={{ p: 3 }}>
              <AccountBalance 
                balance={balance} 
                holdings={holdings} 
                prices={cryptoPrices}
                onReset={handleReset}
              />
            </Paper>
          </Grid>
          <Grid item xs={12} md={8}>
            <Paper elevation={3}>
              <CryptoList 
                prices={cryptoPrices} 
                setPrices={handleSetPrices}
                onTransaction={handleTransaction}
                holdings={holdings}
              />
            </Paper>
          </Grid>
          <Grid item xs={12} md={4}>
            <Paper elevation={3}>
              <TransactionHistory 
                transactions={transactions}
                currentPrices={cryptoPrices}
              />
            </Paper>
          </Grid>
        </Grid>

        <Dialog open={showWelcome} onClose={() => setShowWelcome(false)} maxWidth="sm" fullWidth>
          <DialogTitle>
            <Typography variant="h5" component="div">
              Welcome to Crypto Trading Simulator! 👋
            </Typography>
          </DialogTitle>
          <DialogContent>
            <Typography paragraph sx={{ mt: 2 }}>
              This simulator allows you to practice cryptocurrency trading without risking real money. Here's how to get started:
            </Typography>
            <Typography component="div" sx={{ mb: 2 }}>
              <ul>
                <li>You start with $10,000 in virtual money</li>
                <li>View real-time cryptocurrency prices</li>
                <li>Buy and sell various cryptocurrencies</li>
                <li>Track your portfolio performance</li>
                <li>View your transaction history</li>
              </ul>
            </Typography>
            <Typography>
              Remember: This is a simulator for learning purposes. No real money is involved!
            </Typography>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setShowWelcome(false)} variant="contained" color="primary">
              Get Started
            </Button>
          </DialogActions>
        </Dialog>

        <Snackbar 
          open={!!error} 
          autoHideDuration={6000} 
          onClose={() => setError(null)}
        >
          <Alert onClose={() => setError(null)} severity="error" sx={{ width: '100%' }}>
            {error}
          </Alert>
        </Snackbar>
      </Container>
    </ThemeProvider>
  );
}

export default App;
