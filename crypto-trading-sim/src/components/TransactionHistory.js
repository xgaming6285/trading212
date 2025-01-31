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
        t.crypto === transaction.crypto && 
        t.type === 'buy' &&
        new Date(t.timestamp) < new Date(transaction.timestamp)
      );
      
      if (buyTransactions.length === 0) return 0;
      
      // Calculate average buy price
      const totalBuyAmount = buyTransactions.reduce((sum, t) => sum + t.amount, 0);
      const weightedBuyPrice = buyTransactions.reduce((sum, t) => 
        sum + (t.price * t.amount), 0) / totalBuyAmount;
      
      return (transaction.price - weightedBuyPrice) * transaction.amount;
    }
    return 0;
  };

  return (
    <Box sx={{ p: 2 }}>
      <Typography variant="h6" gutterBottom>
        Transaction History
      </Typography>
      <List>
        {transactions.map((transaction, index) => {
          const profit = calculateProfit(transaction);
          return (
            <ListItem key={index} divider>
              <ListItemText
                primary={`${transaction.type.toUpperCase()} ${transaction.amount} ${transaction.crypto}`}
                secondary={
                  <>
                    <Typography component="span" variant="body2">
                      Price: ${transaction.price.toFixed(2)}
                      <br />
                      Total: ${transaction.total.toFixed(2)}
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