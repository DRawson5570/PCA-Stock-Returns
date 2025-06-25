const mongoose = require('mongoose');

const configurationSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },
  oandaConfig: {
    apiKey: {
      type: String,
      required: true
    },
    accountId: {
      type: String,
      required: true
    },
    environment: {
      type: String,
      enum: ['practice', 'live'],
      default: 'practice'
    }
  },
  ddeConfig: {
    serviceName: {
      type: String,
      default: 'ElwaveDDE'
    },
    refreshInterval: {
      type: Number,
      default: 1000
    }
  },
  historicalConfig: {
    maxDays: {
      type: Number,
      default: 30
    },
    defaultTimeframe: {
      type: String,
      default: '1H'
    }
  }
}, {
  timestamps: true
});

const Configuration = mongoose.model('Configuration', configurationSchema);

module.exports = Configuration;