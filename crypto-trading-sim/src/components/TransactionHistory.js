import React from 'react';
import { 
  Typography, 
  List, 
  ListItem, 
  ListItemText,
  Box
} from '@mui/material';

const TransactionHistory = ({ transactions, currentPrices }) => {
  const calculateProfit = (transaction) => {
    if (transaction.type === 'sell') {
      const buyTransactions = transactions.filter(t => 
        t.cryptoId === transaction.cryptoId && 
        t.type === 'buy' &&
        new Date(t.timestamp) < new Date(transaction.timestamp)
      );
      
      if (buyTransactions.length === 0) return 0;
      
      // Calculate average buy price
      const totalBuyAmount = buyTransactions.reduce((sum, t) => sum + (t.amount || 0), 0);
      const weightedBuyPrice = buyTransactions.reduce((sum, t) => 
        sum + ((t.price || 0) * (t.amount || 0)), 0) / totalBuyAmount;
      
      return ((transaction.price || 0) - weightedBuyPrice) * (transaction.amount || 0);
    }
    return 0;
  };

  if (!transactions || transactions.length === 0) {
    return (
      <Box sx={{ p: 2 }}>
        <Typography variant="h6" gutterBottom>
          Transaction History
        </Typography>
        <Typography variant="body2" color="text.secondary">
          No transactions yet
        </Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 2 }}>
      <Typography variant="h6" gutterBottom>
        Transaction History
      </Typography>
      <List>
        {transactions.map((transaction, index) => {
          const profit = calculateProfit(transaction);
          const price = transaction.price || 0;
          const amount = transaction.amount || 0;
          const total = transaction.total || 0;

          return (
            <ListItem key={transaction._id || index} divider>
              <ListItemText
                primary={`${transaction.type.toUpperCase()} ${amount.toFixed(8)} ${transaction.cryptoId}`}
                secondary={
                  <>
                    <Typography component="span" variant="body2">
                      Price: ${price.toFixed(2)}
                      <br />
                      Total: ${total.toFixed(2)}
                      <br />
                      {transaction.type === 'sell' && (
                        <span style={{ color: profit >= 0 ? 'green' : 'red' }}>
                          Profit/Loss: ${profit.toFixed(2)}
                        </span>
                      )}
                      <br />
                      {new Date(transaction.timestamp).toLocaleString()}
                    </Typography>
                  </>
                }
              />
            </ListItem>
          );
        })}
      </List>
    </Box>
  );
};

export default TransactionHistory; 