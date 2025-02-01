import { formatCurrency, calculateTotalValue } from '../cryptoUtils';

describe('cryptoUtils', () => {
  describe('formatCurrency', () => {
    test('formats currency with 2 decimal places', () => {
      expect(formatCurrency(1234.5678)).toBe('$1,234.57');
      expect(formatCurrency(1000000)).toBe('$1,000,000.00');
      expect(formatCurrency(0.1)).toBe('$0.10');
    });

    test('handles zero value', () => {
      expect(formatCurrency(0)).toBe('$0.00');
    });

    test('handles negative values', () => {
      expect(formatCurrency(-1234.56)).toBe('-$1,234.56');
    });
  });

  describe('calculateTotalValue', () => {
    const mockHoldings = {
      'BTC/USD': 2.5,
      'ETH/USD': 10
    };

    const mockPrices = {
      'BTC/USD': 40000,
      'ETH/USD': 2000
    };

    test('calculates total value correctly', () => {
      // 2.5 BTC * $40000 + 10 ETH * $2000 = $100,000 + $20,000 = $120,000
      expect(calculateTotalValue(mockHoldings, mockPrices)).toBe(120000);
    });

    test('handles empty holdings', () => {
      expect(calculateTotalValue({}, mockPrices)).toBe(0);
    });

    test('handles missing prices', () => {
      const holdingsWithMissingPrice = {
        'BTC/USD': 1,
        'UNKNOWN/USD': 1
      };
      // Should only count BTC value: 1 * $40000 = $40000
      expect(calculateTotalValue(holdingsWithMissingPrice, mockPrices)).toBe(40000);
    });

    test('handles zero quantities', () => {
      const holdingsWithZero = {
        'BTC/USD': 0,
        'ETH/USD': 0
      };
      expect(calculateTotalValue(holdingsWithZero, mockPrices)).toBe(0);
    });
  });
});
