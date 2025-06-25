import api from './api';

// Description: Get dashboard statistics and status
// Endpoint: GET /api/dashboard/stats
// Request: {}
// Response: { connectionStatus: { oanda: boolean, dde: boolean }, clientCount: number, activeSymbols: number, dataQuality: number, apiCallsPerMinute: number, bandwidth: string }
export const getDashboardStats = () => {
  console.log('API: Fetching dashboard statistics');
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        connectionStatus: {
          oanda: Math.random() > 0.1,
          dde: Math.random() > 0.2
        },
        clientCount: Math.floor(Math.random() * 5) + 1,
        activeSymbols: Math.floor(Math.random() * 10) + 15,
        dataQuality: Math.floor(Math.random() * 20) + 80,
        apiCallsPerMinute: Math.floor(Math.random() * 50) + 25,
        bandwidth: `${(Math.random() * 2 + 1).toFixed(1)} MB/s`
      });
    }, 800);
  });
};

// Description: Get real-time tick data
// Endpoint: GET /api/dashboard/ticks
// Request: {}
// Response: { ticks: Array<{ symbol: string, bid: number, ask: number, timestamp: string, volume: number }> }
export const getRealtimeTicks = () => {
  console.log('API: Fetching real-time tick data');
  const symbols = ['EUR/USD', 'GBP/USD', 'USD/JPY', 'AUD/USD', 'USD/CAD'];
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        ticks: symbols.map(symbol => ({
          symbol,
          bid: Math.random() * 0.1 + 1.1,
          ask: Math.random() * 0.1 + 1.12,
          timestamp: new Date().toISOString(),
          volume: Math.floor(Math.random() * 1000) + 100
        }))
      });
    }, 300);
  });
};