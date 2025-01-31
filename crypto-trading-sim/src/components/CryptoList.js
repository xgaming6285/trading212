import React, { useEffect, useState } from 'react';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableContainer, 
  TableHead, 
  TableRow,
  Button,
  TextField,
  Box,
  Typography,
  CircularProgress,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  ButtonGroup
} from '@mui/material';
import { Add as AddIcon, Remove as RemoveIcon } from '@mui/icons-material';

// Simulated crypto data since we don't have the actual Kraken WebSocket yet
const MOCK_CRYPTO_DATA = {
  'BTC': 45000,
  'ETH': 2800,
  'DOGE': 0.15,
  'ADA': 1.20,
  'SOL': 100,
  'DOT': 18,
  'AVAX': 80,
  'MATIC': 2,
  'LINK': 15,
  'UNI': 5
};

const CryptoList = ({ prices, setPrices, onTransaction }) => {
  const [selectedCrypto, setSelectedCrypto] = useState('');
  const [amount, setAmount] = useState('');
  const [transactionType, setTransactionType] = useState('buy');
  const [isLoading, setIsLoading] = useState(false);
  const [updatingPrices, setUpdatingPrices] = useState({});

  // Simulate real-time price updates
  useEffect(() => {
    setPrices(MOCK_CRYPTO_DATA);
    
    const interval = setInterval(() => {
      const updatedPrices = {};
      Object.keys(MOCK_CRYPTO_DATA).forEach(crypto => {
        // Random price fluctuation ±2%
        const currentPrice = MOCK_CRYPTO_DATA[crypto];
        const fluctuation = currentPrice * (Math.random() * 0.04 - 0.02);
        updatedPrices[crypto] = Number((currentPrice + fluctuation).toFixed(2));
      });
      setPrices(updatedPrices);
    }, 5000); // Update every 5 seconds

    return () => clearInterval(interval);
  }, [setPrices]);

  const handleBuy = (crypto) => {
    if (!amount || isNaN(amount) || amount <= 0) {
      alert('Please enter a valid amount');
      return;
    }
    onTransaction('buy', crypto, Number(amount), prices[crypto]);
    setAmount('');
    setSelectedCrypto('');
  };

  const handleSell = (crypto) => {
    if (!amount || isNaN(amount) || amount <= 0) {
      alert('Please enter a valid amount');
      return;
    }
    onTransaction('sell', crypto, Number(amount), prices[crypto]);
    setAmount('');
    setSelectedCrypto('');
  };

  const handleTransactionClick = (crypto, type) => {
    setTransactionType(type);
    setSelectedCrypto(crypto);
  };

  const handleTransactionSubmit = () => {
    if (!selectedCrypto || !amount || isNaN(amount) || amount <= 0) {
      alert('Please fill in all fields');
      return;
    }
    onTransaction(transactionType, selectedCrypto, Number(amount), prices[selectedCrypto]);
    setAmount('');
    setSelectedCrypto('');
  };

  const getCryptoIcon = (crypto) => {
    // Implement your logic to return the appropriate icon based on the crypto
    return null; // Placeholder, actual implementation needed
  };

  const getCryptoFullName = (crypto) => {
    // Implement your logic to return the full name of the crypto
    return crypto; // Placeholder, actual implementation needed
  };

  return (
    <Box sx={{ p: 2 }}>
      <Typography variant="h6" gutterBottom>
        Cryptocurrency Prices
      </Typography>
      
      <Table>
        <TableHead>
          <TableRow sx={{ bgcolor: '#f5f5f5' }}>
            <TableCell>Cryptocurrency</TableCell>
            <TableCell align="right">Price (USD)</TableCell>
            <TableCell align="center">Actions</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {isLoading ? (
            <TableRow>
              <TableCell colSpan={3} align="center" sx={{ py: 4 }}>
                <CircularProgress size={24} sx={{ mr: 2 }} />
                Loading cryptocurrency prices...
              </TableCell>
            </TableRow>
          ) : Object.entries(prices).length === 0 ? (
            <TableRow>
              <TableCell colSpan={3} align="center" sx={{ py: 4 }}>
                <Alert severity="warning">
                  No cryptocurrency data available. Please check your connection.
                </Alert>
              </TableCell>
            </TableRow>
          ) : (
            Object.entries(prices).map(([crypto, price]) => (
              <TableRow 
                key={crypto}
                sx={{
                  '&:hover': { bgcolor: 'rgba(0, 0, 0, 0.04)' },
                  transition: 'background-color 0.2s'
                }}
              >
                <TableCell>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    {getCryptoIcon(crypto)}
                    <Box sx={{ ml: 1 }}>
                      <Typography>{getCryptoFullName(crypto)}</Typography>
                      <Typography variant="caption" color="textSecondary">
                        {crypto}
                      </Typography>
                    </Box>
                  </Box>
                </TableCell>
                <TableCell align="right" sx={{
                  backgroundColor: updatingPrices[crypto] ? 'rgba(25, 118, 210, 0.08)' : 'transparent',
                  transition: 'background-color 0.5s'
                }}>
                  <Typography sx={{ fontFamily: 'monospace' }}>
                    ${price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </Typography>
                </TableCell>
                <TableCell align="center">
                  <ButtonGroup size="small" variant="outlined">
                    <Button 
                      onClick={() => handleTransactionClick(crypto, 'buy')}
                      color="primary"
                      startIcon={<AddIcon />}
                    >
                      Buy
                    </Button>
                    <Button 
                      onClick={() => handleTransactionClick(crypto, 'sell')}
                      color="secondary"
                      startIcon={<RemoveIcon />}
                    >
                      Sell
                    </Button>
                  </ButtonGroup>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>

      <Dialog 
        open={!!selectedCrypto} 
        onClose={() => setSelectedCrypto(null)}
        maxWidth="xs"
        fullWidth
      >
        <DialogTitle>
          {transactionType === 'buy' ? 'Buy' : 'Sell'} {getCryptoFullName(selectedCrypto)}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 2 }}>
            <Typography variant="subtitle2" gutterBottom>
              Current Price: ${selectedCrypto && prices[selectedCrypto]?.toFixed(2)}
            </Typography>
            <TextField
              autoFocus
              margin="dense"
              label={`Amount of ${selectedCrypto} to ${transactionType}`}
              type="number"
              fullWidth
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              InputProps={{
                inputProps: { min: 0, step: "0.00000001" }
              }}
            />
            {amount && selectedCrypto && (
              <Typography variant="body2" sx={{ mt: 2 }}>
                Total Cost: ${(amount * prices[selectedCrypto]).toFixed(2)}
              </Typography>
            )}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setSelectedCrypto(null)}>
            Cancel
          </Button>
          <Button 
            onClick={handleTransactionSubmit}
            variant="contained"
            color={transactionType === 'buy' ? 'primary' : 'secondary'}
          >
            Confirm {transactionType}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default CryptoList; 