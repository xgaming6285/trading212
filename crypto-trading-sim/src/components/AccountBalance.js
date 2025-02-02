import React, { useMemo } from 'react';
import {
  Typography,
  Box,
  Grid,
  Paper,
  Tooltip,
  IconButton,
  Card,
  CardContent,
  LinearProgress
} from '@mui/material';
import {
  AccountBalance as WalletIcon,
  RestartAlt as ResetIcon,
  TrendingUp as ProfitIcon,
  TrendingDown as LossIcon,
  Info as InfoIcon
} from '@mui/icons-material';

const AccountBalance = ({ balance, holdings, prices, onReset }) => {
  const portfolioValue = useMemo(() => {
    return Object.entries(holdings).reduce((total, [crypto, amount]) => {
      return total + (amount * (prices[crypto] || 0));
    }, 0);
  }, [holdings, prices]);

  const totalValue = balance + portfolioValue;
  const profitLoss = totalValue - 10000; // Initial balance is 10000
  const profitLossPercentage = ((profitLoss / 10000) * 100).toFixed(2);
  const isProfitable = profitLoss >= 0;

  const renderHolding = (crypto, amount) => {
    const value = amount * (prices[crypto] || 0);
    const percentage = (value / portfolioValue * 100).toFixed(1);

    return (
      <Box key={crypto} sx={{ mb: 2 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
          <Typography variant="body2">
            {crypto}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {amount.toFixed(8)} × ${prices[crypto]?.toFixed(2) || '0.00'}
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <LinearProgress
            variant="determinate"
            value={parseFloat(percentage)}
            sx={{ 
              flexGrow: 1,
              height: 8,
              borderRadius: 4
            }}
          />
          <Typography variant="caption" color="text.secondary">
            {percentage}%
          </Typography>
        </Box>
        <Typography variant="body2" color="text.secondary" align="right">
          ${value.toFixed(2)}
        </Typography>
      </Box>
    );
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <WalletIcon color="primary" />
          <Typography variant="h6">Portfolio Overview</Typography>
        </Box>
        <Tooltip title="Reset your portfolio to initial state">
          <IconButton onClick={onReset} color="primary" size="small">
            <ResetIcon />
          </IconButton>
        </Tooltip>
      </Box>

      <Grid container spacing={3}>
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography color="text.secondary" gutterBottom>
                Available Balance
              </Typography>
              <Typography variant="h4" component="div">
                ${balance.toFixed(2)}
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography color="text.secondary" gutterBottom>
                Portfolio Value
              </Typography>
              <Typography variant="h4" component="div">
                ${portfolioValue.toFixed(2)}
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Typography color="text.secondary" gutterBottom>
                  Total Profit/Loss
                </Typography>
                <Tooltip title="Calculated from initial balance of $10,000">
                  <InfoIcon fontSize="small" color="action" />
                </Tooltip>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Typography 
                  variant="h4" 
                  component="div"
                  color={isProfitable ? 'success.main' : 'error.main'}
                >
                  {isProfitable ? '+' : ''}{profitLoss.toFixed(2)}
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  {isProfitable ? (
                    <ProfitIcon color="success" />
                  ) : (
                    <LossIcon color="error" />
                  )}
                  <Typography 
                    variant="body2"
                    color={isProfitable ? 'success.main' : 'error.main'}
                  >
                    {isProfitable ? '+' : ''}{profitLossPercentage}%
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {Object.keys(holdings).length > 0 && (
        <Box sx={{ mt: 4 }}>
          <Typography variant="h6" gutterBottom>
            Current Holdings
          </Typography>
          <Paper sx={{ p: 2 }}>
            {Object.entries(holdings).map(([crypto, amount]) => renderHolding(crypto, amount))}
          </Paper>
        </Box>
      )}
    </Box>
  );
};

export default AccountBalance; 