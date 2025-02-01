import React, { useEffect, useState, useCallback } from 'react';
import { 
  Table, 
  TableBody, 
  TableCell, 
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
import { Add as AddIcon, Remove as RemoveIcon, CurrencyBitcoin as BitcoinIcon, CurrencyExchange as GenericCryptoIcon } from '@mui/icons-material';

// Define supported cryptocurrency pairs
const CRYPTO_PAIRS = [
  'XBT/USD',
  'ETH/USD',
  'USDT/USD',
  'BNB/USD',
  'SOL/USD',
  'XRP/USD',
  'USDC/USD',
  'ADA/USD',
  'AVAX/USD',
  'AAVE/GBP',
  'AAVE/USD',
  'ACA/USD',
  'ALGO/USD',
  'ADA/EUR'
  // Add more cryptocurrencies as needed
];

const DISPLAY_MAPPING = {
  'XBT/USD': 'BTC/USD',
  // Add other mappings if needed
};

const CryptoList = ({ prices, setPrices, onTransaction }) => {
  const [selectedCrypto, setSelectedCrypto] = useState('');
  const [amount, setAmount] = useState('');
  const [transactionType, setTransactionType] = useState('buy');
  const [isLoading, setIsLoading] = useState(false);
  const [updatingPrices, setUpdatingPrices] = useState({});
  const [error, setError] = useState(null);
  const [realTimeData, setRealTimeData] = useState({});

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
    const iconStyle = { width: 24, height: 24 };
    
    // Extract the base currency from the pair (e.g., 'BTC/USD' -> 'BTC')
    const baseCurrency = crypto.split('/')[0];
    
    switch (baseCurrency) {
      case 'BTC':
      case 'XBT':
        return <BitcoinIcon sx={{ ...iconStyle, color: '#f7931a' }} />;
      case 'ETH':
        return <GenericCryptoIcon sx={{ ...iconStyle, color: '#627eea' }} />;
      case 'USDT':
        return <GenericCryptoIcon sx={{ ...iconStyle, color: '#26a17b' }} />;
      case 'BNB':
        return <GenericCryptoIcon sx={{ ...iconStyle, color: '#f3ba2f' }} />;
      case 'SOL':
        return <GenericCryptoIcon sx={{ ...iconStyle, color: '#00ff9d' }} />;
      case 'XRP':
        return <GenericCryptoIcon sx={{ ...iconStyle, color: '#23292f' }} />;
      case 'USDC':
        return <GenericCryptoIcon sx={{ ...iconStyle, color: '#2775ca' }} />;
      case 'ADA':
        return <GenericCryptoIcon sx={{ ...iconStyle, color: '#0033ad' }} />;
      case 'AVAX':
        return <GenericCryptoIcon sx={{ ...iconStyle, color: '#e84142' }} />;
      case 'AAVE':
        return <GenericCryptoIcon sx={{ ...iconStyle, color: '#2ebac6' }} />;
      default:
        return <GenericCryptoIcon sx={{ ...iconStyle, color: 'grey.500' }} />;
    }
  };

  const getCryptoFullName = (crypto) => {
    // Extract the base currency from the pair (e.g., 'BTC/USD' -> 'BTC')
    const baseCurrency = crypto.split('/')[0];
    
    switch (baseCurrency) {
      case 'BTC':
      case 'XBT':
        return 'Bitcoin';
      case 'ETH':
        return 'Ethereum';
      case 'USDT':
        return 'Tether';
      case 'BNB':
        return 'Binance Coin';
      case 'SOL':
        return 'Solana';
      case 'XRP':
        return 'Ripple';
      case 'USDC':
        return 'USD Coin';
      case 'ADA':
        return 'Cardano';
      case 'AVAX':
        return 'Avalanche';
      case 'AAVE':
        return 'Aave';
      default:
        return baseCurrency;
    }
  };

  // Update the WebSocket connection and message handling
  const connectWebSocket = useCallback(() => {
    // Use the beta WebSocket endpoint
    const ws = new WebSocket('wss://beta-ws.kraken.com');

    let reconnectAttempts = 0;
    const maxReconnectAttempts = 5;
    
    const reconnect = () => {
      if (reconnectAttempts < maxReconnectAttempts) {
        reconnectAttempts++;
        console.log(`Attempting to reconnect (${reconnectAttempts}/${maxReconnectAttempts})...`);
        setTimeout(() => {
          connectWebSocket();
        }, 5000 * reconnectAttempts);
      } else {
        setError('Unable to maintain connection to Kraken. Please refresh the page to try again.');
      }
    };

    ws.onopen = () => {
      console.log('Connected to Kraken WebSocket');
      reconnectAttempts = 0;
      
      // Subscribe using the newer format
      const subscribeMsg = {
        event: 'subscribe',
        pair: CRYPTO_PAIRS,
        subscription: {
          name: 'ticker'
        }
      };
      
      console.log('Sending subscribe message:', subscribeMsg);
      ws.send(JSON.stringify(subscribeMsg));
    };

    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      console.log('Received WebSocket message:', data);
      
      // Handle heartbeat
      if (data.event === 'heartbeat') {
        return;
      }

      // Handle subscription status
      if (data.event === 'subscriptionStatus') {
        console.log('Subscription status:', data);
        return;
      }

      // Handle ticker data (array format)
      if (Array.isArray(data) && data[2] === 'ticker') {
        const krakenPair = data[3];
        const tickerData = data[1];
        
        if (tickerData && tickerData.c) {
          const price = parseFloat(tickerData.c[0]);
          
          if (!isNaN(price)) {
            console.log(`Received real-time price for ${krakenPair}: ${price}`);
            setPrices(prev => ({
              ...prev,
              [krakenPair]: price
            }));
            
            // Mark this price as real-time data
            setRealTimeData(prev => ({
              ...prev,
              [krakenPair]: true
            }));
            
            setUpdatingPrices(prev => ({
              ...prev,
              [krakenPair]: true
            }));
            setTimeout(() => {
              setUpdatingPrices(prev => ({
                ...prev,
                [krakenPair]: false
              }));
            }, 500);
          }
        }
      }
    };

    ws.onerror = (error) => {
      console.error('WebSocket error:', error);
      setError('Connection error occurred. Attempting to reconnect...');
      reconnect();
    };

    ws.onclose = (event) => {
      console.log('WebSocket closed:', event.code, event.reason);
      
      if (event.code !== 1000) {
        setError('Connection closed unexpectedly. Attempting to reconnect...');
        reconnect();
      }
    };

    return ws;
  }, [setPrices]);

  // Update the initial price fetching
  const fetchInitialPrices = useCallback(async () => {
    try {
      // Use the newer API endpoint
      const response = await fetch('https://api.kraken.com/0/public/Ticker', {
        method: 'GET',
        headers: {
          'Accept': 'application/json'
        }
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      
      if (data.error && data.error.length > 0) {
        throw new Error(`Kraken API error: ${data.error.join(', ')}`);
      }
      
      // Set some initial default prices while waiting for WebSocket
      const defaultPrices = {
        'XBT/USD': 45000,
        'ETH/USD': 2500,
        'USDT/USD': 1,
        'BNB/USD': 300, // Not supported by Kraken, can be removed, but keeping for educational purposes
        'SOL/USD': 100,
        'XRP/USD': 0.5,
        'USDC/USD': 1,
        'ADA/USD': 0.5,
        'AVAX/USD': 35,
        'AAVE/USD': 300 
      };
      
      console.log('Setting default prices:', defaultPrices);
      setPrices(defaultPrices);
      
    } catch (error) {
      console.error('Error fetching initial prices:', error);
      if (error.message === 'Failed to fetch') {
        setError('Unable to connect to Kraken API. Please check your internet connection or try again later.');
      } else {
        setError(`Failed to fetch prices: ${error.message}`);
      }
    } finally {
      setIsLoading(false);
    }
  }, [setPrices]);

  useEffect(() => {
    setIsLoading(true);
    const ws = connectWebSocket();
    fetchInitialPrices();

    return () => {
      if (ws && ws.readyState === WebSocket.OPEN) {
        ws.close(1000, 'Component unmounting');
      }
    };
  }, [connectWebSocket, fetchInitialPrices, setPrices]);

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
          {error ? (
            <TableRow>
              <TableCell colSpan={3} align="center" sx={{ py: 4 }}>
                <Alert severity="error">
                  {error}
                </Alert>
              </TableCell>
            </TableRow>
          ) : isLoading ? (
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
            Object.entries(prices).map(([crypto, price]) => {
              const displayCrypto = DISPLAY_MAPPING[crypto] || crypto;
              return (
                <TableRow 
                  key={crypto}
                  sx={{
                    '&:hover': { bgcolor: 'rgba(0, 0, 0, 0.04)' },
                    transition: 'background-color 0.2s'
                  }}
                >
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      {getCryptoIcon(displayCrypto)}
                      <Box sx={{ ml: 1 }}>
                        <Typography>{getCryptoFullName(displayCrypto)}</Typography>
                        <Typography variant="caption" color="textSecondary">
                          {displayCrypto}
                        </Typography>
                      </Box>
                    </Box>
                  </TableCell>
                  <TableCell align="right" sx={{
                    backgroundColor: updatingPrices[crypto] ? 'rgba(25, 118, 210, 0.08)' : 'transparent',
                    transition: 'background-color 0.5s'
                  }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end' }}>
                      <Typography sx={{ 
                        fontFamily: 'monospace',
                        color: realTimeData[crypto] ? 'success.main' : 'text.secondary'
                      }}>
                        ${price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </Typography>
                      {!realTimeData[crypto] && (
                        <Typography variant="caption" color="text.secondary" sx={{ ml: 1 }}>
                          (Demo)
                        </Typography>
                      )}
                    </Box>
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
              );
            })
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