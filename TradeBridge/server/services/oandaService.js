const axios = require('axios');
const MarketData = require('../models/MarketData');
const Configuration = require('../models/Configuration');

class OandaService {
  constructor() {
    this.apiUrl = process.env.OANDA_API_URL || 'https://api-fxtrade.oanda.com';
    this.practiceApiUrl = process.env.OANDA_PRACTICE_API_URL || 'https://api-fxpractice.oanda.com';
  }

  async getApiConfig(userId) {
    try {
      const config = await Configuration.findOne({ userId });
      if (!config || !config.oandaConfig || !config.oandaConfig.apiKey) {
        throw new Error('OANDA API configuration not found. Please configure your API settings.');
      }
      return config.oandaConfig;
    } catch (error) {
      console.error('Error fetching OANDA configuration:', error.message);
      throw error;
    }
  }

  getApiUrl(environment) {
    return environment === 'live' ? this.apiUrl : this.practiceApiUrl;
  }

  async makeApiRequest(userId, endpoint, params = {}) {
    try {
      const config = await this.getApiConfig(userId);
      const baseUrl = this.getApiUrl(config.environment);
      
      console.log(`Making OANDA API request to: ${baseUrl}${endpoint}`);
      
      const response = await axios.get(`${baseUrl}${endpoint}`, {
        headers: {
          'Authorization': `Bearer ${config.apiKey}`,
          'Content-Type': 'application/json'
        },
        params,
        timeout: 30000
      });

      return response.data;
    } catch (error) {
      console.error('OANDA API request failed:', error.message);
      if (error.response) {
        console.error('Response status:', error.response.status);
        console.error('Response data:', error.response.data);
        
        if (error.response.status === 401) {
          throw new Error('OANDA API authentication failed. Please check your API key.');
        } else if (error.response.status === 400) {
          throw new Error(`Invalid request parameters: ${error.response.data.errorMessage || error.response.data.message || 'Bad request'}`);
        } else if (error.response.status === 404) {
          throw new Error('Invalid currency pair or endpoint not found.');
        }
      }
      throw error;
    }
  }

  validateCurrencyPair(currencyPair) {
    // Convert underscore format to OANDA format if needed
    const instrument = currencyPair.replace('_', '_').toUpperCase();
    
    // Basic validation for currency pair format
    if (!/^[A-Z]{3}_[A-Z]{3}$/.test(instrument)) {
      throw new Error('Invalid currency pair format. Expected format: EUR_USD');
    }
    
    return instrument;
  }

  validateTimeframe(timeframe) {
    const validTimeframes = ['S5', 'S10', 'S15', 'S30', 'M1', 'M2', 'M4', 'M5', 'M10', 'M15', 'M30', 'H1', 'H2', 'H3', 'H4', 'H6', 'H8', 'H12', 'D', 'W', 'M'];
    
    if (!validTimeframes.includes(timeframe)) {
      throw new Error(`Invalid timeframe. Valid options: ${validTimeframes.join(', ')}`);
    }
    
    return timeframe;
  }

  async getHistoricalData(userId, currencyPair, options = {}) {
    try {
      const instrument = this.validateCurrencyPair(currencyPair);
      const { timeframe = 'M1', from, to, count = 500 } = options;
      
      this.validateTimeframe(timeframe);

      console.log(`Fetching historical data for ${instrument} with timeframe ${timeframe}`);

      // Check cache first
      const cached = await this.getCachedData(instrument, timeframe, from, to);
      if (cached) {
        console.log('Returning cached historical data');
        return cached;
      }

      const params = {
        granularity: timeframe,
        price: 'BA' // Both bid and ask prices
      };

      if (from && to) {
        params.from = new Date(from).toISOString();
        params.to = new Date(to).toISOString();
      } else if (count) {
        params.count = Math.min(count, 5000); // OANDA max is 5000
      }

      const data = await this.makeApiRequest(userId, `/v3/instruments/${instrument}/candles`, params);

      if (!data.candles || data.candles.length === 0) {
        console.log('No candles data received from OANDA API');
        return { candles: [] };
      }

      // Process and format the data
      const formattedCandles = data.candles
        .filter(candle => candle.complete) // Only use complete candles
        .map(candle => ({
          time: new Date(candle.time),
          bid: {
            o: parseFloat(candle.bid.o),
            h: parseFloat(candle.bid.h),
            l: parseFloat(candle.bid.l),
            c: parseFloat(candle.bid.c)
          },
          ask: {
            o: parseFloat(candle.ask.o),
            h: parseFloat(candle.ask.h),
            l: parseFloat(candle.ask.l),
            c: parseFloat(candle.ask.c)
          },
          volume: parseInt(candle.volume)
        }));

      // Cache the data
      if (from && to) {
        await this.cacheData(instrument, timeframe, formattedCandles, from, to);
      }

      console.log(`Successfully fetched ${formattedCandles.length} historical candles`);
      return { candles: formattedCandles };

    } catch (error) {
      console.error('Error fetching historical data:', error.message);
      throw error;
    }
  }

  async getRealTimeData(userId, currencyPair) {
    try {
      const instrument = this.validateCurrencyPair(currencyPair);
      
      console.log(`Fetching real-time data for ${instrument}`);

      const data = await this.makeApiRequest(userId, `/v3/pricing`, {
        instruments: instrument
      });

      if (!data.prices || data.prices.length === 0) {
        throw new Error('No pricing data received from OANDA API');
      }

      const price = data.prices[0];
      
      const result = {
        instrument: price.instrument,
        bid: parseFloat(price.closeoutBid || price.bids[0]?.price),
        ask: parseFloat(price.closeoutAsk || price.asks[0]?.price),
        timestamp: new Date(price.time),
        status: price.status
      };

      // Calculate spread
      result.spread = parseFloat((result.ask - result.bid).toFixed(5));

      console.log(`Successfully fetched real-time data for ${instrument}: bid=${result.bid}, ask=${result.ask}`);
      return result;

    } catch (error) {
      console.error('Error fetching real-time data:', error.message);
      throw error;
    }
  }

  async getCachedData(instrument, granularity, from, to) {
    try {
      if (!from || !to) return null;

      const cached = await MarketData.findOne({
        instrument,
        granularity,
        from: { $lte: new Date(from) },
        to: { $gte: new Date(to) },
        fetchedAt: { $gte: new Date(Date.now() - 3600000) } // Less than 1 hour old
      });

      if (cached) {
        // Filter candles to exact range
        const filteredCandles = cached.candles.filter(candle => {
          const candleTime = new Date(candle.time);
          return candleTime >= new Date(from) && candleTime <= new Date(to);
        });

        return { candles: filteredCandles };
      }

      return null;
    } catch (error) {
      console.error('Error checking cache:', error.message);
      return null;
    }
  }

  async cacheData(instrument, granularity, candles, from, to) {
    try {
      const marketData = new MarketData({
        instrument,
        granularity,
        candles,
        from: new Date(from),
        to: new Date(to)
      });

      await marketData.save();
      console.log(`Cached ${candles.length} candles for ${instrument}`);
    } catch (error) {
      console.error('Error caching data:', error.message);
      // Don't throw error for caching failures
    }
  }
}

module.exports = new OandaService();