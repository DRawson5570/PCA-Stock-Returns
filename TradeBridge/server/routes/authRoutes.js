const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const User = require('../models/User');
const { generateAccessToken, generateRefreshToken } = require('../utils/auth');

// Register route
router.post('/register', async (req, res) => {
  try {
    console.log('[AUTH ROUTES] Registration attempt:', { email: req.body.email });
    
    const { username, email, password } = req.body;

    if (!email || !password) {
      console.log('[AUTH ROUTES] Registration failed: Missing required fields');
      return res.status(400).json({
        success: false,
        error: 'Email and password are required'
      });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      console.log('[AUTH ROUTES] Registration failed: User already exists');
      return res.status(400).json({
        success: false,
        error: 'User already exists'
      });
    }

    // Create new user
    const user = new User({ username, email, password });
    await user.save();
    console.log('[AUTH ROUTES] User created successfully:', user.email);

    // Generate tokens
    const accessToken = generateAccessToken(user);
    console.log('[AUTH ROUTES] Access token generated for registration');

    res.json({
      success: true,
      data: {
        user: {
          id: user._id,
          email: user.email,
          username: user.username
        },
        accessToken
      }
    });
  } catch (error) {
    console.error('[AUTH ROUTES] Registration error:', error.message);
    console.error('[AUTH ROUTES] Registration error stack:', error.stack);
    res.status(500).json({
      success: false,
      error: 'Registration failed'
    });
  }
});

// Login route
router.post('/login', async (req, res) => {
  try {
    console.log('[AUTH ROUTES] Login attempt:', { email: req.body.email });
    console.log('[AUTH ROUTES] Request body keys:', Object.keys(req.body));
    
    const { email, password } = req.body;

    if (!email || !password) {
      console.log('[AUTH ROUTES] Login failed: Missing credentials');
      return res.status(400).json({
        success: false,
        error: 'Email and password are required'
      });
    }

    // Find user
    console.log('[AUTH ROUTES] Looking up user in database');
    const user = await User.findOne({ email });
    if (!user) {
      console.log('[AUTH ROUTES] Login failed: User not found');
      return res.status(400).json({
        success: false,
        error: 'Email or password is incorrect'
      });
    }

    console.log('[AUTH ROUTES] User found, verifying password');
    // Check password
    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      console.log('[AUTH ROUTES] Login failed: Invalid password');
      return res.status(400).json({
        success: false,
        error: 'Email or password is incorrect'
      });
    }

    console.log('[AUTH ROUTES] Password verified, generating tokens');
    // Generate tokens
    const accessToken = generateAccessToken(user);
    const refreshToken = generateRefreshToken(user);
    
    console.log('[AUTH ROUTES] Tokens generated successfully');
    console.log('[AUTH ROUTES] Access token length:', accessToken ? accessToken.length : 0);
    console.log('[AUTH ROUTES] Refresh token length:', refreshToken ? refreshToken.length : 0);

    res.json({
      success: true,
      data: {
        user: {
          id: user._id,
          email: user.email,
          username: user.username
        },
        accessToken,
        refreshToken
      }
    });
  } catch (error) {
    console.error('[AUTH ROUTES] Login error:', error.message);
    console.error('[AUTH ROUTES] Login error stack:', error.stack);
    res.status(500).json({
      success: false,
      error: 'Login failed'
    });
  }
});

// Logout route
router.post('/logout', (req, res) => {
  console.log('[AUTH ROUTES] Logout request received');
  res.json({
    success: true,
    message: 'Logged out successfully'
  });
});

module.exports = router;