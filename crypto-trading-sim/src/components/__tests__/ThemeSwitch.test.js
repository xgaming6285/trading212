import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import ThemeSwitch from '../ThemeSwitch';

describe('ThemeSwitch Component', () => {
  const mockProps = {
    toggleTheme: jest.fn()
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('renders theme switch button', () => {
    render(<ThemeSwitch {...mockProps} />);
    expect(screen.getByRole('button')).toBeInTheDocument();
  });

  test('calls toggleTheme when clicked', () => {
    render(<ThemeSwitch {...mockProps} />);
    const button = screen.getByRole('button');
    fireEvent.click(button);
    expect(mockProps.toggleTheme).toHaveBeenCalled();
  });
});
