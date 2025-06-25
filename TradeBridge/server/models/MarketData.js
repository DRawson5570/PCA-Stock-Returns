const mongoose = require('mongoose');

const candleSchema = new mongoose.Schema({
  time: {
    type: Date,
    required: true
  },
  bid: {
    o: { type: Number, required: true },
    h: { type: Number, required: true },
    l: { type: Number, required: true },
    c: { type: Number, required: true }
  },
  ask: {
    o: { type: Number, required: true },
    h: { type: Number, required: true },
    l: { type: Number, required: true },
    c: { type: Number, required: true }
  },
  volume: {
    type: Number,
    required: true
  }
}, { _id: false });

const marketDataSchema = new mongoose.Schema({
  instrument: {
    type: String,
    required: true,
    index: true
  },
  granularity: {
    type: String,
    required: true,
    enum: ['S5', 'S10', 'S15', 'S30', 'M1', 'M2', 'M4', 'M5', 'M10', 'M15', 'M30', 'H1', 'H2', 'H3', 'H4', 'H6', 'H8', 'H12', 'D', 'W', 'M']
  },
  candles: [candleSchema],
  fetchedAt: {
    type: Date,
    default: Date.now
  },
  from: {
    type: Date,
    required: true
  },
  to: {
    type: Date,
    required: true
  }
}, {
  timestamps: true
});

// Create compound index for efficient querying
marketDataSchema.index({ instrument: 1, granularity: 1, from: 1, to: 1 });

// TTL index to automatically remove old cached data after 1 hour
marketDataSchema.index({ fetchedAt: 1 }, { expireAfterSeconds: 3600 });

const MarketData = mongoose.model('MarketData', marketDataSchema);

module.exports = MarketData;