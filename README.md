# Crypto Trading Simulator

A web-based cryptocurrency trading simulator that allows users to practice trading with virtual funds in a risk-free environment.

## Features

- Real-time cryptocurrency price tracking through Kraken API
- Virtual portfolio management
- Transaction history tracking
- Account balance monitoring
- Dark/Light theme switching
- Responsive design for desktop and mobile use

## Project Structure

```
crypto-trading-sim/
├── public/                 # Static files
├── server/                 # Backend server files
│   ├── config/            # Server configuration
│   ├── models/            # Database models
│   └── routes/            # API routes
└── src/                   # Frontend source code
    ├── components/        # React components
    │   └── __tests__/    # Component tests
    └── utils/             # Utility functions
```

## Technology Stack

- Frontend: React.js
- Backend: Node.js with Express
- Database: MongoDB
- Testing: Jest and React Testing Library

## Getting Started

1. Clone the repository
2. Install dependencies:
   ```bash
   cd crypto-trading-sim
   npm install
   ```
3. Set up environment variables:
   - Create `.env` file in the root directory
   - Add required environment variables (see `.env.development` for reference)

4. Start the development server:
   ```bash
   npm start
   ```

## Testing

Run the test suite with:
```bash
npm test
```

## Components

- **AccountBalance**: Displays and manages user's virtual account balance
- **CryptoList**: Shows available cryptocurrencies and their current prices
- **TransactionHistory**: Displays user's trading history
- **ThemeSwitch**: Toggles between light and dark themes

## API Integration

The application integrates with the Kraken API to fetch real-time cryptocurrency prices and market data.

## Development Status

This project is actively maintained and continuously improved. Feel free to contribute or report issues through the repository's issue tracker.

## License

[Include license information here]
