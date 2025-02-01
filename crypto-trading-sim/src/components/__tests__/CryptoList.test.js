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
      'BTC/USD': 45000,
      'ETH/USD': 2500,
    },
    setPrices: jest.fn(),
    onTransaction: jest.fn(),
    onReset: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('renders cryptocurrency prices title', () => {
    render(<CryptoList {...mockProps} />);
    expect(screen.getByText('Cryptocurrency Prices')).toBeInTheDocument();
  });

  test('displays cryptocurrency table headers', () => {
    render(<CryptoList {...mockProps} />);
    expect(screen.getByText('Cryptocurrency')).toBeInTheDocument();
    expect(screen.getByText('Price (USD)')).toBeInTheDocument();
    expect(screen.getByText('Actions')).toBeInTheDocument();
  });

  test('displays cryptocurrency prices correctly', () => {
    render(<CryptoList {...mockProps} />);
    expect(screen.getByText('$45,000.00')).toBeInTheDocument();
    expect(screen.getByText('$2,500.00')).toBeInTheDocument();
  });

  test('shows buy/sell buttons for each cryptocurrency', () => {
    render(<CryptoList {...mockProps} />);
    const buyButtons = screen.getAllByText('Buy');
    const sellButtons = screen.getAllByText('Sell');
    expect(buyButtons).toHaveLength(2);
    expect(sellButtons).toHaveLength(2);
  });

  test('opens transaction dialog when clicking buy button', async () => {
    render(<CryptoList {...mockProps} />);
    const buyButtons = screen.getAllByText('Buy');
    fireEvent.click(buyButtons[0]);
    
    await waitFor(() => {
      expect(screen.getByText(/Current Price/)).toBeInTheDocument();
    });
  });

  test('handles transaction submission', async () => {
    render(<CryptoList {...mockProps} />);
    const buyButtons = screen.getAllByText('Buy');
    fireEvent.click(buyButtons[0]);
    
    const amountInput = screen.getByLabelText(/Amount of .* to buy/i);
    fireEvent.change(amountInput, { target: { value: '1' } });
    
    const confirmButton = screen.getByText('Confirm buy');
    fireEvent.click(confirmButton);
    
    expect(mockProps.onTransaction).toHaveBeenCalledWith('buy', 'BTC/USD', 1, 45000);
  });

  test('displays error message when prices cannot be loaded', () => {
    render(<CryptoList {...mockProps} prices={{}} />);
    expect(screen.getByText(/No cryptocurrency data available/)).toBeInTheDocument();
  });
});