import React from 'react';
import { render, screen, waitForElementToBeRemoved } from '@testing-library/react';
import App from './App';

describe('App Component', () => {
  beforeEach(() => {
    // Mock localStorage to prevent welcome dialog
    Storage.prototype.getItem = jest.fn(() => 'true');
  });

  test('renders main app title', async () => {
    render(<App />);
    const titleElement = screen.getByRole('heading', {
      name: /crypto trading simulator/i,
      level: 3
    });
    expect(titleElement).toBeInTheDocument();
  });

  // Add more tests as needed
  test('renders portfolio overview section', () => {
    render(<App />);
    expect(screen.getByText('Portfolio Overview')).toBeInTheDocument();
  });

  test('renders initial balance correctly', () => {
    render(<App />);
    expect(screen.getByText(/\$10,000\.00|\$10000\.00|\$10,000/)).toBeInTheDocument();
  });
});
