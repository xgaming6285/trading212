import React, { useState, useCallback, useMemo } from 'react';
import './App.css';
import CryptoList from './components/CryptoList';
import AccountBalance from './components/AccountBalance';
import TransactionHistory from './components/TransactionHistory';
import ThemeSwitch from './components/ThemeSwitch';
import { Container, Grid, Paper, Typography, Box, createTheme, ThemeProvider, CssBaseline } from '@mui/material';

const INITIAL_BALANCE = 10000;

function App() {
  const [balance, setBalance] = useState(INITIAL_BALANCE);
  const [holdings, setHoldings] = useState({});
  const [transactions, setTransactions] = useState([]);
  const [cryptoPrices, setCryptoPrices] = useState({});
  const [resetTrigger, setResetTrigger] = useState(false);
  const [mode, setMode] = useState('light');

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

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography variant="h4" component="h1">
            Crypto Trading Simulator
          </Typography>
          <ThemeSwitch toggleTheme={toggleTheme} />
        </Box>
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <AccountBalance 
              balance={balance} 
              holdings={holdings} 
              prices={cryptoPrices}
              onReset={handleReset}
            />
          </Grid>
          <Grid item xs={12} md={8}>
            <Paper>
              <CryptoList 
                prices={cryptoPrices} 
                setPrices={handleSetPrices}
                onTransaction={handleTransaction}
                onReset={resetTrigger}
              />
            </Paper>
          </Grid>
          <Grid item xs={12} md={4}>
            <Paper>
              <TransactionHistory 
                transactions={transactions}
                currentPrices={cryptoPrices}
              />
            </Paper>
          </Grid>
        </Grid>
      </Container>
    </ThemeProvider>
  );
}

export default App;
