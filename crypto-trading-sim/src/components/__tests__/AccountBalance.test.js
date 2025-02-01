import React from 'react';
import { render, screen } from '@testing-library/react';
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

  test('renders account overview section', () => {
    render(<AccountBalance {...mockProps} />);
    expect(screen.getByText('Account Overview')).toBeInTheDocument();
  });

  test('displays correct cash balance', () => {
    render(<AccountBalance {...mockProps} />);
    expect(screen.getByText('Cash Balance')).toBeInTheDocument();
    expect(screen.getByText('$10,000.00')).toBeInTheDocument();
  });

  test('calculates and displays correct holdings value', () => {
    render(<AccountBalance {...mockProps} />);
    // Holdings value = (0.5 * 45000) + (2.0 * 2500) = 22500 + 5000 = 27500
    expect(screen.getByText('$27,500.00')).toBeInTheDocument();
  });

  test('calculates and displays correct total value', () => {
    render(<AccountBalance {...mockProps} />);
    // Total value = Cash balance + Holdings value = 10000 + 27500 = 37500
    expect(screen.getByText('$37,500.00')).toBeInTheDocument();
  });

  test('displays holdings list when holdings exist', () => {
    render(<AccountBalance {...mockProps} />);
    expect(screen.getByText('Your Holdings')).toBeInTheDocument();
    expect(screen.getByText('BTC/USD: 0.50000000')).toBeInTheDocument();
    expect(screen.getByText('ETH/USD: 2.00000000')).toBeInTheDocument();
  });

  test('reset button triggers onReset callback', () => {
    render(<AccountBalance {...mockProps} />);
    const resetButton = screen.getByText('Reset Account');
    resetButton.click();
    expect(mockProps.onReset).toHaveBeenCalled();
  });
});