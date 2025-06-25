import api from './api';

// Description: Get historical data status
// Endpoint: GET /api/data-monitor/historical
// Request: {}
// Response: { requests: Array<{ symbol: string, timeframe: string, progress: number, status: string, startDate: string, endDate: string }> }
export const getHistoricalDataStatus = () => {
  console.log('API: Fetching historical data status');
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        requests: [
          { symbol: 'EUR/USD', timeframe: '1H', progress: 100, status: 'completed', startDate: '2024-01-01', endDate: '2024-01-31' },
          { symbol: 'GBP/USD', timeframe: '15M', progress: 75, status: 'in_progress', startDate: '2024-01-01', endDate: '2024-01-31' },
          { symbol: 'USD/JPY', timeframe: '5M', progress: 0, status: 'queued', startDate: '2024-01-01', endDate: '2024-01-31' }
        ]
      });
    }, 600);
  });
};

// Description: Get live price data
// Endpoint: GET /api/v1/market/realtime
// Request: { instruments: string } (comma-separated list)
// Response: { success: boolean, data: { prices: Array<{ symbol: string, bid: number, ask: number, spread: number, timestamp: string, change: number }> } }
export const getLivePriceData = async () => {
  console.log('API: Fetching live price data');
  const instruments = 'EUR_USD,GBP_USD,USD_JPY,AUD_USD,USD_CAD,NZD_USD,EUR_GBP,GBP_JPY';
  
  try {
    const response = await api.get(`/api/v1/market/realtime?instruments=${instruments}`);
    return response.data.data;
  } catch (error) {
    console.error('Error fetching live price data:', error);
    throw new Error(error?.response?.data?.error || error.message);
  }
};

// Description: Get historical market data for a specific currency pair
// Endpoint: GET /api/v1/market/historical/{currency_pair}
// Request: { timeframe?: string, from?: string, to?: string, count?: number }
// Response: { success: boolean, data: { instrument: string, granularity: string, candles: Array<{ time: Date, bid: object, ask: object, volume: number }> } }
export const getHistoricalMarketData = async (currencyPair: string, options: {
  timeframe?: string;
  from?: string;
  to?: string;
  count?: number;
} = {}) => {
  console.log('API: Fetching historical market data for', currencyPair);
  
  try {
    const params = new URLSearchParams();
    if (options.timeframe) params.append('timeframe', options.timeframe);
    if (options.from) params.append('from', options.from);
    if (options.to) params.append('to', options.to);
    if (options.count) params.append('count', options.count.toString());

    const queryString = params.toString();
    const url = `/api/v1/market/historical/${currencyPair}${queryString ? `?${queryString}` : ''}`;
    
    const response = await api.get(url);
    return response.data.data;
  } catch (error) {
    console.error('Error fetching historical market data:', error);
    throw new Error(error?.response?.data?.error || error.message);
  }
};

// Description: Get real-time market data for a specific currency pair
// Endpoint: GET /api/v1/market/realtime/{currency_pair}
// Request: {}
// Response: { success: boolean, data: { instrument: string, bid: number, ask: number, spread: number, timestamp: Date, status: string } }
export const getRealTimeMarketData = async (currencyPair: string) => {
  console.log('API: Fetching real-time market data for', currencyPair);
  
  try {
    const response = await api.get(`/api/v1/market/realtime/${currencyPair}`);
    return response.data.data;
  } catch (error) {
    console.error('Error fetching real-time market data:', error);
    throw new Error(error?.response?.data?.error || error.message);
  }
};