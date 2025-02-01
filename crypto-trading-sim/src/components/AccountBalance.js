import React from 'react';
import { 
  Paper, 
  Typography, 
  Button, 
  List, 
  ListItem, 
  ListItemText,
  Box,
  Grid,
} from '@mui/material';
import { Refresh as RefreshIcon } from '@mui/icons-material';

const AccountBalance = ({ balance, holdings, prices, onReset }) => {
  const calculateTotalHoldings = () => {
    return Object.entries(holdings).reduce((total, [crypto, amount]) => {
      const price = prices[crypto] || 0;
      return total + (amount * price);
    }, 0);
  };

  const totalHoldingsValue = calculateTotalHoldings();
  const totalValue = balance + totalHoldingsValue;

  return (
    <Paper sx={{ p: 3, mb: 3 }}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h5" component="h2">
          Account Overview
        </Typography>
        <Button 
          variant="contained" 
          color="secondary" 
          onClick={onReset}
          startIcon={<RefreshIcon />}
        >
          Reset Account
        </Button>
      </Box>
      
      <Grid container spacing={3}>
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 2, bgcolor: 'background.paper' }}>
            <Typography variant="subtitle2" color="textSecondary">
              Cash Balance
            </Typography>
            <Typography variant="h4" sx={{ fontWeight: 'medium' }}>
              ${balance.toLocaleString(undefined, { minimumFractionDigits: 2 })}
            </Typography>
          </Paper>
        </Grid>
        
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 2, bgcolor: 'background.paper' }}>
            <Typography variant="subtitle2" color="textSecondary">
              Holdings Value
            </Typography>
            <Typography variant="h4" sx={{ fontWeight: 'medium' }}>
              ${totalHoldingsValue.toLocaleString(undefined, { minimumFractionDigits: 2 })}
            </Typography>
          </Paper>
        </Grid>
        
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 2, bgcolor: 'background.paper' }}>
            <Typography variant="subtitle2" color="textSecondary">
              Total Value
            </Typography>
            <Typography variant="h4" sx={{ fontWeight: 'medium' }}>
              ${totalValue.toLocaleString(undefined, { minimumFractionDigits: 2 })}
            </Typography>
          </Paper>
        </Grid>
      </Grid>

      {Object.keys(holdings).length > 0 && (
        <>
          <Typography variant="h6" sx={{ mt: 2 }}>Your Holdings</Typography>
          <List>
            {Object.entries(holdings).map(([crypto, amount]) => (
              <ListItem key={crypto}>
                <ListItemText
                  primary={`${crypto}: ${amount.toFixed(8)}`}
                  secondary={`Value: $${(amount * (prices[crypto] || 0)).toFixed(2)}`}
                />
              </ListItem>
            ))}
          </List>
        </>
      )}
    </Paper>
  );
};

export default AccountBalance; 