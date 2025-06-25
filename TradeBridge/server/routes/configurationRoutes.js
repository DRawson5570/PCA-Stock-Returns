const express = require('express');
const router = express.Router();
const configurationService = require('../services/configurationService');
const { requireUser } = require('./middleware/auth');

// Get configuration
router.get('/', requireUser, async (req, res) => {
  try {
    console.log('Configuration GET request from user:', req.user.id);
    
    const config = await configurationService.getConfiguration(req.user.id);
    
    res.json({
      success: true,
      data: config
    });
  } catch (error) {
    console.error('Get configuration error:', error.message);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Update configuration
router.post('/', requireUser, async (req, res) => {
  try {
    console.log('Configuration POST request from user:', req.user.id);
    
    const result = await configurationService.updateConfiguration(req.user.id, req.body);
    
    res.json({
      success: true,
      data: result
    });
  } catch (error) {
    console.error('Update configuration error:', error.message);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Validate OANDA configuration
router.get('/validate-oanda', requireUser, async (req, res) => {
  try {
    console.log('OANDA validation request from user:', req.user.id);
    
    const result = await configurationService.validateOandaConfiguration(req.user.id);
    
    res.json({
      success: true,
      data: result
    });
  } catch (error) {
    console.error('OANDA validation error:', error.message);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

module.exports = router;