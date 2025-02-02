// jest-dom adds custom jest matchers for asserting on DOM nodes.
// allows you to do things like:
// expect(element).toHaveTextContent(/react/i)
// learn more: https://github.com/testing-library/jest-dom
import '@testing-library/jest-dom';

// Set timeout for tests
jest.setTimeout(10000);

// Suppress act() warning
const originalError = console.error;
beforeAll(() => {
  console.error = (...args) => {
    if (/Warning.*not wrapped in act/.test(args[0])) {
      return;
    }
    if (/Warning.*ReactDOMTestUtils.act/.test(args[0])) {
      return;
    }
    originalError.call(console, ...args);
  };
});

afterAll(() => {
  console.error = originalError;
});

// Update the mock fetch response to match the API structure
const mockFetchResponse = {
  ok: true,
  json: () => Promise.resolve({
    result: {
      // Include initial prices data
      XXBTZUSD: {
        c: ['45000.00', '1.00000000'],
        v: ['1000.00000000', '5000.00000000'],
        p: ['45000.00', '44500.00'],
      },
      XETHZUSD: {
        c: ['2500.00', '1.00000000'],
        v: ['5000.00000000', '25000.00000000'],
        p: ['2500.00', '2450.00'],
      },
      // Include pairs data
      pairs: {
        'XXBTZUSD': {
          altname: 'XBT/USD',
          wsname: 'XBT/USD',
          aclass_base: 'currency',
          base: 'XXBT',
          aclass_quote: 'currency',
          quote: 'ZUSD',
          lot: 'unit',
          pair_decimals: 1,
          lot_decimals: 8,
          lot_multiplier: 1,
          leverage_buy: [2, 3, 4, 5],
          leverage_sell: [2, 3, 4, 5],
          fees: [[0, 0.26], [50000, 0.24]],
          fees_maker: [[0, 0.16], [50000, 0.14]],
          fee_volume_currency: 'ZUSD',
          margin_call: 80,
          margin_stop: 40,
          ordermin: '0.0001'
        },
        'XETHZUSD': {
          altname: 'ETH/USD',
          wsname: 'ETH/USD',
          aclass_base: 'currency',
          base: 'XETH',
          aclass_quote: 'currency',
          quote: 'ZUSD',
          lot: 'unit',
          pair_decimals: 1,
          lot_decimals: 8,
          lot_multiplier: 1,
          leverage_buy: [2, 3, 4, 5],
          leverage_sell: [2, 3, 4, 5],
          fees: [[0, 0.26], [50000, 0.24]],
          fees_maker: [[0, 0.16], [50000, 0.14]],
          fee_volume_currency: 'ZUSD',
          margin_call: 80,
          margin_stop: 40,
          ordermin: '0.0001'
        }
      }
    }
  })
};

// Mock fetch globally
global.fetch = jest.fn(() => Promise.resolve(mockFetchResponse));

// Update WebSocket mock to handle connection properly
class MockWebSocket {
  constructor(url) {
    this.url = url;
    this.onmessage = null;
    this.onopen = null;
    this.onclose = null;
    this.onerror = null;
    this.readyState = WebSocket.CONNECTING;
  }

  send(data) {
    const message = JSON.parse(data);
    
    // Handle ping messages
    if (message.event === 'ping') {
      setTimeout(() => {
        if (this.onmessage) {
          this.onmessage({
            data: JSON.stringify({
              event: 'pong',
              reqid: message.reqid
            })
          });
        }
      }, 0);
      return;
    }

    // Set connection to open when send is called
    this.readyState = WebSocket.OPEN;
    
    // Simulate successful connection
    if (this.onopen) {
      setTimeout(() => this.onopen({ type: 'open' }), 0);
    }
    
    // Simulate subscription success
    if (message.event === 'subscribe' && this.onmessage) {
      setTimeout(() => {
        this.onmessage({
          data: JSON.stringify({
            event: 'subscriptionStatus',
            pair: message.pair[0],
            status: 'subscribed',
            subscription: message.subscription
          })
        });
      }, 0);
    }
    
    // Simulate receiving price updates
    if (this.onmessage) {
      const updates = [
        {
          data: JSON.stringify([
            null,
            {
              c: ['45000.00', '1.00000000']
            },
            'ticker',
            'XBT/USD'
          ])
        },
        {
          data: JSON.stringify([
            null,
            {
              c: ['2500.00', '1.00000000']
            },
            'ticker',
            'ETH/USD'
          ])
        }
      ];
      
      updates.forEach(update => {
        setTimeout(() => this.onmessage(update), 50);
      });
    }
  }

  close() {
    this.readyState = WebSocket.CLOSED;
    if (this.onclose) {
      this.onclose({ code: 1000, reason: 'Normal closure', wasClean: true });
    }
  }
}

// Define WebSocket constants if not available in test environment
if (!global.WebSocket) {
  global.WebSocket = {
    CONNECTING: 0,
    OPEN: 1,
    CLOSING: 2,
    CLOSED: 3
  };
}

global.WebSocket = MockWebSocket;
