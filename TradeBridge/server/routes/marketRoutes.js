const express = require('express');
const router = express.Router();
const oandaService = require('../services/oandaService');
const { requireUser } = require('./middleware/auth');

// Get historical market data
router.get('/historical/:currency_pair', requireUser, async (req, res) => {
  try {
    const { currency_pair } = req.params;
    const { timeframe = 'M1', from, to, count } = req.query;

    console.log(`Historical data request: ${currency_pair}, timeframe: ${timeframe}, from: ${from}, to: ${to}, count: ${count}`);

    if (!currency_pair) {
      return res.status(400).json({
        success: false,
        error: 'Currency pair is required'
      });
    }

    const options = { timeframe };
    
    if (from && to) {
      options.from = from;
      options.to = to;
    } else if (count) {
      options.count = parseInt(count);
    }

    const data = await oandaService.getHistoricalData(req.user.id, currency_pair, options);

    res.json({
      success: true,
      data: {
        instrument: currency_pair.toUpperCase(),
        granularity: timeframe,
        candles: data.candles
      }
    });

  } catch (error) {
    console.error('Historical data endpoint error:', error.message);
    res.status(400).json({
      success: false,
      error: error.message
    });
  }
});

// Get real-time market data
router.get('/realtime/:currency_pair', requireUser, async (req, res) => {
  try {
    const { currency_pair } = req.params;

    console.log(`Real-time data request: ${currency_pair}`);

    if (!currency_pair) {
      return res.status(400).json({
        success: false,
        error: 'Currency pair is required'
      });
    }

    const data = await oandaService.getRealTimeData(req.user.id, currency_pair);

    res.json({
      success: true,
      data
    });

  } catch (error) {
    console.error('Real-time data endpoint error:', error.message);
    res.status(400).json({
      success: false,
      error: error.message
    });
  }
});

// Get multiple real-time prices (for data monitor)
router.get('/realtime', requireUser, async (req, res) => {
  try {
    const { instruments } = req.query;
    
    if (!instruments) {
      return res.status(400).json({
        success: false,
        error: 'Instruments parameter is required'
      });
    }

    const instrumentList = instruments.split(',').map(i => i.trim());
    console.log(`Multiple real-time data request for: ${instrumentList.join(', ')}`);

    const promises = instrumentList.map(async (instrument) => {
      try {
        const data = await oandaService.getRealTimeData(req.user.id, instrument);
        return {
          symbol: instrument,
          bid: data.bid,
          ask: data.ask,
          spread: data.spread,
          timestamp: data.timestamp,
          change: Math.random() * 0.02 - 0.01 // Mock change for now
        };
      } catch (error) {
        console.error(`Error fetching data for ${instrument}:`, error.message);
        return null;
      }
    });

    const results = await Promise.all(promises);
    const validResults = results.filter(result => result !== null);

    res.json({
      success: true,
      data: {
        prices: validResults
      }
    });

  } catch (error) {
    console.error('Multiple real-time data endpoint error:', error.message);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

module.exports = router;