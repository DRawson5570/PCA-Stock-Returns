const jwt = require('jsonwebtoken');

const generateAccessToken = (user) => {
  try {
    console.log('[AUTH UTILS] Generating access token for user:', user.email);
    console.log('[AUTH UTILS] JWT_SECRET exists:', !!process.env.JWT_SECRET);
    console.log('[AUTH UTILS] JWT_SECRET length:', process.env.JWT_SECRET ? process.env.JWT_SECRET.length : 0);
    
    if (!process.env.JWT_SECRET) {
      throw new Error('JWT_SECRET not configured');
    }
    
    const payload = {
      userId: user._id,
      email: user.email
    };
    
    console.log('[AUTH UTILS] Token payload:', payload);
    
    const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '24h' });
    console.log('[AUTH UTILS] Access token generated successfully, length:', token.length);
    
    return token;
  } catch (error) {
    console.error('[AUTH UTILS] Error generating access token:', error.message);
    throw error;
  }
};

const generateRefreshToken = (user) => {
  try {
    console.log('[AUTH UTILS] Generating refresh token for user:', user.email);
    console.log('[AUTH UTILS] REFRESH_TOKEN_SECRET exists:', !!process.env.REFRESH_TOKEN_SECRET);
    
    if (!process.env.REFRESH_TOKEN_SECRET) {
      throw new Error('REFRESH_TOKEN_SECRET not configured');
    }
    
    const payload = {
      userId: user._id,
      email: user.email
    };
    
    const token = jwt.sign(payload, process.env.REFRESH_TOKEN_SECRET, { expiresIn: '7d' });
    console.log('[AUTH UTILS] Refresh token generated successfully, length:', token.length);
    
    return token;
  } catch (error) {
    console.error('[AUTH UTILS] Error generating refresh token:', error.message);
    throw error;
  }
};

module.exports = {
  generateAccessToken,
  generateRefreshToken
};