import React, { useState, useCallback, useMemo, useEffect } from 'react';
import './App.css';
import CryptoList from './components/CryptoList';
import AccountBalance from './components/AccountBalance';
import TransactionHistory from './components/TransactionHistory';
import ThemeSwitch from './components/ThemeSwitch';
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
  Divider
} from '@mui/material';

const INITIAL_BALANCE = 10000;

function App() {
  const [balance, setBalance] = useState(INITIAL_BALANCE);
  const [holdings, setHoldings] = useState({});
  const [transactions, setTransactions] = useState([]);
  const [cryptoPrices, setCryptoPrices] = useState({});
  const [resetTrigger, setResetTrigger] = useState(false);
  const [mode, setMode] = useState('light');
  const [showWelcome, setShowWelcome] = useState(() => {
    return !localStorage.getItem('welcomeShown');
  });

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

  const handleTransaction = (type, crypto, amount, price) => {
    const total = amount * price;
    
    if (type === 'buy') {
      if (total > balance) {
        alert('Insufficient funds! You need $' + total.toFixed(2) + ' but have $' + balance.toFixed(2));
        return;
      }
      
      setBalance(prevBalance => {
        const newBalance = prevBalance - total;
        return Number(newBalance.toFixed(2));
      });
      
      setHoldings(prev => ({
        ...prev,
        [crypto]: Number((prev[crypto] || 0) + amount)
      }));
    } else { // sell
      const currentHolding = holdings[crypto] || 0;
      if (!currentHolding) {
        alert(`You don't own any ${crypto} to sell. Please buy some first.`);
        return;
      }
      
      if (currentHolding < amount) {
        alert(`Insufficient ${crypto} holdings! You only have ${currentHolding} ${crypto}`);
        return;
      }
      
      setBalance(prevBalance => {
        const newBalance = prevBalance + total;
        return Number(newBalance.toFixed(2));
      });
      
      const newAmount = Number(holdings[crypto] - amount);
      setHoldings(prev => ({
        ...prev,
        [crypto]: newAmount
      }));

      if (newAmount === 0) {
        setHoldings(prev => {
          const newHoldings = { ...prev };
          delete newHoldings[crypto];
          return newHoldings;
        });
      }
    }

    setTransactions(prev => [...prev, {
      type,
      crypto,
      amount: Number(amount),
      price: Number(price),
      total: Number(total.toFixed(2)),
      timestamp: new Date().toISOString()
    }]);
  };

  const handleReset = () => {
    setBalance(INITIAL_BALANCE);
    setHoldings({});
    setTransactions([]);
    setResetTrigger(prev => !prev);
  };

  useEffect(() => {
    if (showWelcome) {
      localStorage.setItem('welcomeShown', 'true');
    }
  }, [showWelcome]);

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
                onReset={resetTrigger}
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
                <li>You start with ${INITIAL_BALANCE.toLocaleString()} in virtual money</li>
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
      </Container>
    </ThemeProvider>
  );
}

export default App;
