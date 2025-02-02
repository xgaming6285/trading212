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
  ButtonGroup,
  Snackbar,
  IconButton,
  Tooltip,
  Autocomplete,
  Fade,
  InputAdornment
} from '@mui/material';
import { 
  Add as AddIcon, 
  Remove as RemoveIcon, 
  CurrencyBitcoin as BitcoinIcon, 
  CurrencyExchange as GenericCryptoIcon,
  AddCircleOutline as AddPairIcon,
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon,
  Info as InfoIcon,
  Sort as SortIcon,
  SortByAlpha as SortByAlphaIcon
} from '@mui/icons-material';

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

const CryptoList = ({ prices, setPrices, onTransaction, onReset }) => {
  const [selectedCrypto, setSelectedCrypto] = useState('');
  const [amount, setAmount] = useState('');
  const [transactionType, setTransactionType] = useState('buy');
  const [updatingPrices, setUpdatingPrices] = useState({});
  const [error, setError] = useState(null);
  const [customPairs, setCustomPairs] = useState([]);
  const [addPairDialogOpen, setAddPairDialogOpen] = useState(false);
  const [notification, setNotification] = useState({ open: false, message: '', severity: 'success' });
  const [availablePairs, setAvailablePairs] = useState([]);
  const [loadingPairs, setLoadingPairs] = useState(false);
  const [searchInput, setSearchInput] = useState('');
  const [previousPrices, setPreviousPrices] = useState({});
  const [priceChanges, setPriceChanges] = useState({});
  const [sortType, setSortType] = useState('none'); // 'none', 'value', 'alpha'
  const [sortDirection, setSortDirection] = useState('asc');

  // Move allPairs declaration here, before it's used
  const allPairs = [...CRYPTO_PAIRS, ...customPairs];

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
      
      // Use the current value of allPairs from closure
      const subscribeMsg = {
        event: 'subscribe',
        pair: [...CRYPTO_PAIRS, ...customPairs], 
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
            setUpdatingPrices(prev => ({
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
  }, [customPairs, setPrices]); // Add setPrices to dependency array

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
    }
  }, [setPrices]);

  const fetchAvailablePairs = useCallback(async () => {
    setLoadingPairs(true);
    try {
      const response = await fetch('https://api.kraken.com/0/public/AssetPairs');
      const data = await response.json();
      
      if (data.error && data.error.length > 0) {
        throw new Error(data.error.join(', '));
      }

      // Extract and format pairs from the API response
      const pairs = Object.entries(data.result)
        .filter(([_, info]) => info.status === 'online') // Only include online pairs
        .map(([_, info]) => ({
          wsname: info.wsname || `${info.base}/${info.quote}`, // Use wsname if available, otherwise construct from base/quote
          name: info.altname,
          base: info.base,
          quote: info.quote,
          displayName: info.wsname || `${info.base}/${info.quote}`, // Use wsname for display if available
          status: info.status,
          ordermin: info.ordermin,
          costmin: info.costmin,
          pairDecimals: info.pair_decimals,
          lotDecimals: info.lot_decimals
        }))
        .sort((a, b) => a.displayName.localeCompare(b.displayName)); // Sort alphabetically

      console.log(`Loaded ${pairs.length} trading pairs from Kraken`);
      setAvailablePairs(pairs);
    } catch (error) {
      console.error('Error fetching pairs:', error);
      setNotification({
        open: true,
        message: 'Failed to fetch available pairs: ' + error.message,
        severity: 'error'
      });
    } finally {
      setLoadingPairs(false);
    }
  }, []);

  const handleAddPair = async () => {
    if (!searchInput) {
      setNotification({
        open: true,
        message: 'Please select a valid trading pair',
        severity: 'error'
      });
      return;
    }

    try {
      const selectedPair = availablePairs.find(p => p.displayName === searchInput);
      if (!selectedPair) {
        throw new Error('Invalid trading pair selected');
      }

      const standardizedPair = selectedPair.wsname;
      if (!CRYPTO_PAIRS.includes(standardizedPair) && !customPairs.includes(standardizedPair)) {
        setCustomPairs(prev => [...prev, standardizedPair]);
        setNotification({
          open: true,
          message: `Successfully added ${standardizedPair}`,
          severity: 'success'
        });
      } else {
        setNotification({
          open: true,
          message: 'This pair is already in the list',
          severity: 'warning'
        });
      }
      
      setAddPairDialogOpen(false);
      setSearchInput('');
      
    } catch (error) {
      setNotification({
        open: true,
        message: error.message || 'Failed to add trading pair',
        severity: 'error'
      });
    }
  };

  // Modify the WebSocket subscription to include custom pairs
  useEffect(() => {
    const ws = connectWebSocket();
    return () => {
      if (ws && ws.readyState === WebSocket.OPEN) {
        ws.close(1000, 'Component unmounting');
      }
    };
  }, [connectWebSocket]);

  useEffect(() => {
    fetchInitialPrices();
  }, [fetchInitialPrices]);

  // Add effect to clear custom pairs when account is reset
  useEffect(() => {
    if (onReset) {
      setCustomPairs([]);
    }
  }, [onReset]);

  // Add effect to fetch pairs when dialog opens
  useEffect(() => {
    if (addPairDialogOpen && availablePairs.length === 0) {
      fetchAvailablePairs();
    }
  }, [addPairDialogOpen, availablePairs.length, fetchAvailablePairs]);

  useEffect(() => {
    Object.entries(prices).forEach(([pair, price]) => {
      const prevPrice = previousPrices[pair];
      if (prevPrice && price !== prevPrice) {
        setPriceChanges(prev => ({
          ...prev,
          [pair]: {
            direction: price > prevPrice ? 'up' : 'down',
            percentage: ((price - prevPrice) / prevPrice * 100).toFixed(2)
          }
        }));
      }
      setPreviousPrices(prev => ({
        ...prev,
        [pair]: price
      }));
    });
  }, [prices, previousPrices]);

  const renderPriceChange = (pair) => {
    const change = priceChanges[pair];
    if (!change) return null;

    const color = change.direction === 'up' ? 'success.main' : 'error.main';
    const Icon = change.direction === 'up' ? TrendingUpIcon : TrendingDownIcon;

    return (
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
        <Icon sx={{ color }} />
        <Typography variant="body2" sx={{ color }}>
          {change.direction === 'up' ? '+' : ''}{change.percentage}%
        </Typography>
      </Box>
    );
  };

  const getSortedPairs = () => {
    const pairs = [...allPairs];
    
    switch (sortType) {
      case 'value':
        return pairs.sort((a, b) => {
          const priceA = prices[a] || 0;
          const priceB = prices[b] || 0;
          return sortDirection === 'asc' ? priceA - priceB : priceB - priceA;
        });
      case 'alpha':
        return pairs.sort((a, b) => {
          return sortDirection === 'asc' 
            ? a.localeCompare(b) 
            : b.localeCompare(a);
        });
      default:
        return pairs;
    }
  };

  const handleSort = (type) => {
    if (sortType === type) {
      setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc');
    } else {
      setSortType(type);
      setSortDirection('asc');
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h6" component="h2">
          Available Cryptocurrencies
        </Typography>
        <Box>
          <ButtonGroup variant="outlined" size="small" sx={{ mr: 2 }}>
            <Tooltip title="Sort by Value">
              <Button 
                onClick={() => handleSort('value')}
                variant={sortType === 'value' ? 'contained' : 'outlined'}
                startIcon={<SortIcon />}
              >
                Value {sortType === 'value' && (sortDirection === 'asc' ? '↑' : '↓')}
              </Button>
            </Tooltip>
            <Tooltip title="Sort Alphabetically">
              <Button 
                onClick={() => handleSort('alpha')}
                variant={sortType === 'alpha' ? 'contained' : 'outlined'}
                startIcon={<SortByAlphaIcon />}
              >
                A-Z {sortType === 'alpha' && (sortDirection === 'asc' ? '↑' : '↓')}
              </Button>
            </Tooltip>
          </ButtonGroup>
          <Tooltip title="Add a new cryptocurrency pair to track">
            <IconButton onClick={() => setAddPairDialogOpen(true)} color="primary">
              <AddPairIcon />
            </IconButton>
          </Tooltip>
        </Box>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <Table>
        <TableHead>
          <TableRow>
            <TableCell>Cryptocurrency</TableCell>
            <TableCell align="right">
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 1 }}>
                Price (USD)
                <Tooltip title="Prices are updated in real-time">
                  <InfoIcon fontSize="small" color="action" />
                </Tooltip>
              </Box>
            </TableCell>
            <TableCell align="right">24h Change</TableCell>
            <TableCell align="center">Actions</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {getSortedPairs().map((pair) => (
            <TableRow key={pair} sx={{ '&:hover': { backgroundColor: 'action.hover' } }}>
              <TableCell>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  {getCryptoIcon(pair)}
                  <Box>
                    <Typography variant="body1">
                      {DISPLAY_MAPPING[pair] || pair}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {getCryptoFullName(pair)}
                    </Typography>
                  </Box>
                </Box>
              </TableCell>
              <TableCell align="right">
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end' }}>
                  <Fade in={updatingPrices[pair]} timeout={200}>
                    <Box sx={{ position: 'absolute', mr: 2 }}>
                      <CircularProgress size={16} />
                    </Box>
                  </Fade>
                  <Typography>
                    ${prices[pair]?.toFixed(2) || 'Loading...'}
                  </Typography>
                </Box>
              </TableCell>
              <TableCell align="right">
                {renderPriceChange(pair)}
              </TableCell>
              <TableCell align="center">
                <ButtonGroup variant="outlined" size="small">
                  <Tooltip title="Buy this cryptocurrency">
                    <Button
                      onClick={() => handleTransactionClick(pair, 'buy')}
                      startIcon={<AddIcon />}
                      color="success"
                    >
                      Buy
                    </Button>
                  </Tooltip>
                  <Tooltip title="Sell this cryptocurrency">
                    <Button
                      onClick={() => handleTransactionClick(pair, 'sell')}
                      startIcon={<RemoveIcon />}
                      color="error"
                    >
                      Sell
                    </Button>
                  </Tooltip>
                </ButtonGroup>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      <Dialog 
        open={!!selectedCrypto} 
        onClose={() => setSelectedCrypto('')}
        maxWidth="xs"
        fullWidth
      >
        <DialogTitle>
          {transactionType === 'buy' ? 'Buy' : 'Sell'} {selectedCrypto}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ mt: 2 }}>
            <Typography variant="body2" color="text.secondary" gutterBottom>
              Current Price: ${prices[selectedCrypto]?.toFixed(2) || 'Loading...'}
            </Typography>
            <TextField
              label="Amount"
              type="number"
              fullWidth
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              sx={{ mt: 1 }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    {getCryptoIcon(selectedCrypto)}
                  </InputAdornment>
                ),
              }}
              helperText={
                amount && prices[selectedCrypto] 
                  ? `Total: $${(amount * prices[selectedCrypto]).toFixed(2)}`
                  : 'Enter the amount you want to trade'
              }
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setSelectedCrypto('')}>Cancel</Button>
          <Button 
            onClick={handleTransactionSubmit}
            variant="contained"
            color={transactionType === 'buy' ? 'success' : 'error'}
          >
            {transactionType === 'buy' ? 'Buy' : 'Sell'} {selectedCrypto}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Update the Add New Pair Dialog */}
      <Dialog 
        open={addPairDialogOpen} 
        onClose={() => setAddPairDialogOpen(false)}
        maxWidth="xs"
        fullWidth
      >
        <DialogTitle>Add New Trading Pair</DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 2 }}>
            {loadingPairs ? (
              <Box display="flex" justifyContent="center" p={2}>
                <CircularProgress size={24} />
              </Box>
            ) : (
              <Autocomplete
                fullWidth
                value={searchInput}
                onChange={(_, newValue) => setSearchInput(newValue || '')}
                inputValue={searchInput}
                onInputChange={(_, newInputValue) => setSearchInput(newInputValue || '')}
                options={availablePairs.map(pair => pair.displayName)}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label="Trading Pair"
                    helperText={`${availablePairs.length} pairs available. Type to search (e.g., BTC/USD, ETH/EUR)`}
                    fullWidth
                    autoFocus
                  />
                )}
                renderOption={(props, option) => {
                  const pair = availablePairs.find(p => p.displayName === option);
                  return (
                    <li {...props}>
                      <Box>
                        <Typography variant="body1">
                          {pair.displayName}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          Min Order: {pair.ordermin} {pair.base} • Min Cost: {pair.costmin} {pair.quote}
                        </Typography>
                      </Box>
                    </li>
                  );
                }}
                filterOptions={(options, { inputValue }) => {
                  const input = (inputValue || '').toUpperCase();
                  return options.filter(option => 
                    option.toUpperCase().includes(input)
                  );
                }}
                freeSolo={false}
                selectOnFocus
                clearOnBlur
                handleHomeEndKeys
                ListboxProps={{
                  style: { maxHeight: '50vh' }
                }}
              />
            )}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => {
            setAddPairDialogOpen(false);
            setSearchInput('');
          }}>
            Cancel
          </Button>
          <Button 
            onClick={handleAddPair}
            variant="contained"
            color="primary"
            disabled={loadingPairs || !searchInput}
          >
            Add Pair
          </Button>
        </DialogActions>
      </Dialog>

      {/* Notification Snackbar */}
      <Snackbar
        open={notification.open}
        autoHideDuration={6000}
        onClose={() => setNotification({ ...notification, open: false })}
      >
        <Alert 
          onClose={() => setNotification({ ...notification, open: false })} 
          severity={notification.severity}
          variant="filled"
        >
          {notification.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default CryptoList; 