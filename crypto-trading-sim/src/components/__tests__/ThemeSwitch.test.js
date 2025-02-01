import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import ThemeSwitch from '../ThemeSwitch';

describe('ThemeSwitch Component', () => {
  const mockProps = {
    darkMode: false,
    onToggle: jest.fn()
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('renders theme switch button', () => {
    render(<ThemeSwitch {...mockProps} />);
    expect(screen.getByRole('button')).toBeInTheDocument();
  });

  test('displays light mode icon when in light mode', () => {
    render(<ThemeSwitch darkMode={false} onToggle={mockProps.onToggle} />);
    expect(screen.getByTestId('LightModeIcon')).toBeInTheDocument();
  });

  test('displays dark mode icon when in dark mode', () => {
    render(<ThemeSwitch darkMode={true} onToggle={mockProps.onToggle} />);
    expect(screen.getByTestId('DarkModeIcon')).toBeInTheDocument();
  });

  test('calls onToggle when clicked', () => {
    render(<ThemeSwitch {...mockProps} />);
    const button = screen.getByRole('button');
    fireEvent.click(button);
    expect(mockProps.onToggle).toHaveBeenCalled();
  });
});
