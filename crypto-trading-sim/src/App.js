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
const USER_ID = 'user123'; // In a real app, this would come from authentication

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
      const response = await axios.get(`${API_BASE_URL}/portfolio/${USER_ID}`);
      const portfolio = response.data;
      setBalance(portfolio.balance);
      
      // Convert holdings array to object format
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

  // Fetch transaction history
  const fetchTransactions = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/transactions/${USER_ID}`);
      setTransactions(response.data);
    } catch (err) {
      setError('Failed to fetch transactions');
      console.error('Error fetching transactions:', err);
    }
  };

  // Initial data fetch
  useEffect(() => {
    fetchPortfolio();
    fetchTransactions();
  }, []);

  const theme = useMemo(
    () =>
      createTheme({
        palette: {
          mode,
        },
      }),
    [mode],
  );

  const toggleTheme = () => {
    setMode((prevMode) => (prevMode === 'light' ? 'dark' : 'light'));
  };

  const handleSetPrices = useCallback((prices) => {
    setCryptoPrices(prices);
  }, []);

  const handleTransaction = async (type, crypto, amount, price) => {
    try {
      const response = await axios.post(`${API_BASE_URL}/trade`, {
        userId: USER_ID,
        type,
        cryptoId: crypto,
        amount: Number(amount),
        price: Number(price)
      });

      // Update local state with the response data
      const { portfolio, transaction } = response.data;
      setBalance(portfolio.balance);
      
      // Convert holdings array to object format
      const holdingsObj = {};
      portfolio.holdings.forEach(holding => {
        holdingsObj[holding.cryptoId] = holding.amount;
      });
      setHoldings(holdingsObj);

      // Update transactions
      setTransactions(prev => [transaction, ...prev]);
    } catch (err) {
      setError(err.response?.data?.message || 'Transaction failed');
      console.error('Error executing trade:', err);
    }
  };

  const handleReset = async () => {
    try {
      const response = await axios.post(`${API_BASE_URL}/reset/${USER_ID}`);
      
      // Update local state with the response data
      if (response.data.portfolio) {
        setBalance(response.data.portfolio.balance);
        setHoldings({});  // Clear holdings
      }
      setTransactions([]); // Clear transactions
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
