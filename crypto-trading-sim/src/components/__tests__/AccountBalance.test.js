import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import AccountBalance from '../AccountBalance';

describe('AccountBalance Component', () => {
  const mockProps = {
    balance: 10000,
    holdings: {
      'BTC/USD': 0.5,
      'ETH/USD': 2.0
    },
    prices: {
      'BTC/USD': 45000,
      'ETH/USD': 2500
    },
    onReset: jest.fn()
  };

  test('renders portfolio overview section', () => {
    render(<AccountBalance {...mockProps} />);
    expect(screen.getByText('Portfolio Overview')).toBeInTheDocument();
  });

  test('displays correct available balance', () => {
    render(<AccountBalance {...mockProps} />);
    expect(screen.getByText('Available Balance')).toBeInTheDocument();
    // Use a function to match text that might be split across elements
    const balanceElement = screen.getByText((content, element) => {
      return element.textContent === '$10000.00';
    });
    expect(balanceElement).toBeInTheDocument();
  });

  test('calculates and displays correct portfolio value', () => {
    render(<AccountBalance {...mockProps} />);
    // Holdings value = (0.5 * 45000) + (2.0 * 2500) = 22500 + 5000 = 27500
    const valueElement = screen.getByText((content, element) => {
      return element.textContent === '$27500.00';
    });
    expect(valueElement).toBeInTheDocument();
  });

  test('displays holdings when they exist', () => {
    render(<AccountBalance {...mockProps} />);
    expect(screen.getByText('Current Holdings')).toBeInTheDocument();
    
    // Check for BTC/USD
    expect(screen.getByText('BTC/USD')).toBeInTheDocument();
    
    // Check for BTC amount and price
    const btcAmountAndPrice = screen.getByText((content, element) => {
      return element.textContent === '0.50000000 × $45000.00';
    });
    expect(btcAmountAndPrice).toBeInTheDocument();
    
    // Check for BTC value
    const btcValue = screen.getByText((content, element) => {
      return element.textContent === '$22500.00';
    });
    expect(btcValue).toBeInTheDocument();
    
    // Check for ETH/USD
    expect(screen.getByText('ETH/USD')).toBeInTheDocument();
    
    // Check for ETH amount and price
    const ethAmountAndPrice = screen.getByText((content, element) => {
      return element.textContent === '2.00000000 × $2500.00';
    });
    expect(ethAmountAndPrice).toBeInTheDocument();
    
    // Check for ETH value
    const ethValue = screen.getByText((content, element) => {
      return element.textContent === '$5000.00';
    });
    expect(ethValue).toBeInTheDocument();
  });

  test('reset button triggers onReset callback', () => {
    render(<AccountBalance {...mockProps} />);
    const resetButton = screen.getByRole('button', { name: /reset/i });
    fireEvent.click(resetButton);
    expect(mockProps.onReset).toHaveBeenCalled();
  });
});