export const getCryptoFullName = (symbol) => {
  const names = {
    'XBT/USD': 'Bitcoin',
    'ETH/USD': 'Ethereum',
    'USDT/USD': 'Tether',
    'BNB/USD': 'Binance Coin',
    'SOL/USD': 'Solana',
    'XRP/USD': 'Ripple',
    'USDC/USD': 'USD Coin',
    'ADA/USD': 'Cardano',
    'AVAX/USD': 'Avalanche',
    'DOGE/USD': 'Dogecoin',
    // Add more mappings as needed
  };
  return names[symbol] || symbol;
};

export const getCryptoIcon = (symbol) => {
  // You could return an image component here
  // For now, we'll return an emoji as a placeholder
  const icons = {
    'XBT/USD': '₿',
    'ETH/USD': 'Ξ',
    'USDT/USD': '₮',
    // Add more mappings as needed
  };
  return icons[symbol] || '🪙';
}; 