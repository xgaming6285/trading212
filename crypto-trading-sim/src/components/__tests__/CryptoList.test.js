import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import CryptoList from '../CryptoList';

// Mock WebSocket
class MockWebSocket {
  constructor(url) {
    this.url = url;
    this.onmessage = null;
    this.onopen = null;
    this.onclose = null;
    this.onerror = null;
    this.readyState = WebSocket.OPEN;
  }

  send(data) {}
  close() {}
}

global.WebSocket = MockWebSocket;

describe('CryptoList Component', () => {
  const mockProps = {
    prices: {
      'XBT/USD': 45000,
      'ETH/USD': 2500,
    },
    setPrices: jest.fn(),
    onTransaction: jest.fn(),
    onReset: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  // Add cleanup after each test
  afterEach(() => {
    jest.clearAllTimers();
  });

  test('renders cryptocurrency prices title', async () => {
    render(<CryptoList {...mockProps} />);
    await waitFor(() => {
      expect(screen.getByText('Available Cryptocurrencies')).toBeInTheDocument();
    });
  });

  test('displays cryptocurrency table headers', async () => {
    render(<CryptoList {...mockProps} />);
    await waitFor(() => {
      expect(screen.getByText('Cryptocurrency')).toBeInTheDocument();
      expect(screen.getByText(/Price \(USD\)/)).toBeInTheDocument();
      expect(screen.getByText('Actions')).toBeInTheDocument();
    });
  });

  test('displays cryptocurrency prices correctly', async () => {
    render(<CryptoList {...mockProps} />);
    
    // Wait for prices to be displayed
    await waitFor(() => {
      const priceElements = screen.getAllByText(/\$[0-9,]+(\.[0-9]{2})?/);
      expect(priceElements.length).toBeGreaterThan(0);
      
      // Get all price text content
      const priceTexts = priceElements.map(el => el.textContent);
      
      // Check if either format of the price is present (with or without commas)
      expect(
        priceTexts.some(price => 
          price.includes('45,000.00') || 
          price.includes('45000.00')
        )
      ).toBe(true);
      
      expect(
        priceTexts.some(price => 
          price.includes('2,500.00') || 
          price.includes('2500.00')
        )
      ).toBe(true);
    }, { timeout: 5000 }); // Increase timeout to allow for async operations
  });

  test('shows buy/sell buttons for each cryptocurrency', async () => {
    render(<CryptoList {...mockProps} />);
    await waitFor(() => {
      expect(screen.getAllByText('Buy').length).toBeGreaterThan(0);
      expect(screen.getAllByText('Sell').length).toBeGreaterThan(0);
    });
  });

  test('opens transaction dialog when clicking buy button', async () => {
    render(<CryptoList {...mockProps} />);
    await waitFor(() => {
      const buyButtons = screen.getAllByText('Buy');
      fireEvent.click(buyButtons[0]);
      expect(screen.getByText(/Current Price/)).toBeInTheDocument();
    });
  });

  test('handles transaction submission', async () => {
    render(<CryptoList {...mockProps} />);
    
    await waitFor(() => {
      const buyButtons = screen.getAllByText('Buy');
      fireEvent.click(buyButtons[0]);
    });

    const amountInput = screen.getByLabelText(/Amount/i);
    fireEvent.change(amountInput, { target: { value: '1' } });

    const confirmButton = screen.getByRole('button', { name: /buy.*usd/i });
    fireEvent.click(confirmButton);

    expect(mockProps.onTransaction).toHaveBeenCalledWith('buy', 'XBT/USD', 1, 45000);
  });

  test('displays error message when prices cannot be loaded', async () => {
    render(<CryptoList {...mockProps} prices={{}} />);
    await waitFor(() => {
      const errorAlerts = screen.getAllByRole('alert');
      expect(errorAlerts.length).toBeGreaterThan(0);
      const errorMessages = errorAlerts.map(alert => alert.textContent);
      expect(
        errorMessages.some(msg => 
          /unable to maintain connection|failed to fetch prices|failed to fetch/i.test(msg)
        )
      ).toBe(true);
    });
  });
});