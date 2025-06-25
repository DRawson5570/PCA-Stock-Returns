const jwt = require('jsonwebtoken');
const User = require('../../models/User');

const requireUser = async (req, res, next) => {
  try {
    console.log('[AUTH MIDDLEWARE] Starting authentication check');
    console.log('[AUTH MIDDLEWARE] Headers:', JSON.stringify(req.headers, null, 2));
    
    const authHeader = req.headers.authorization;
    console.log('[AUTH MIDDLEWARE] Authorization header:', authHeader);
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      console.log('[AUTH MIDDLEWARE] No valid authorization header found');
      return res.status(401).json({ 
        success: false, 
        error: 'Access token required' 
      });
    }

    const token = authHeader.substring(7);
    console.log('[AUTH MIDDLEWARE] Extracted token:', token ? 'Token present' : 'No token');
    console.log('[AUTH MIDDLEWARE] Token length:', token ? token.length : 0);
    
    if (!token) {
      console.log('[AUTH MIDDLEWARE] Empty token after extraction');
      return res.status(401).json({ 
        success: false, 
        error: 'Access token required' 
      });
    }

    console.log('[AUTH MIDDLEWARE] Attempting to verify token with JWT_SECRET');
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log('[AUTH MIDDLEWARE] Token decoded successfully:', { userId: decoded.userId, email: decoded.email });

    const user = await User.findById(decoded.userId);
    console.log('[AUTH MIDDLEWARE] User lookup result:', user ? 'User found' : 'User not found');
    
    if (!user) {
      console.log('[AUTH MIDDLEWARE] User not found in database for ID:', decoded.userId);
      return res.status(401).json({ 
        success: false, 
        error: 'User not found' 
      });
    }

    req.user = user;
    console.log('[AUTH MIDDLEWARE] Authentication successful for user:', user.email);
    next();
  } catch (error) {
    console.error('[AUTH MIDDLEWARE] Authentication error:', error.message);
    console.error('[AUTH MIDDLEWARE] Error type:', error.name);
    console.error('[AUTH MIDDLEWARE] Full error:', error);
    
    if (error.name === 'JsonWebTokenError') {
      console.log('[AUTH MIDDLEWARE] JWT malformed error detected');
      return res.status(401).json({ 
        success: false, 
        error: 'Invalid token' 
      });
    }
    
    if (error.name === 'TokenExpiredError') {
      console.log('[AUTH MIDDLEWARE] JWT expired error detected');
      return res.status(401).json({ 
        success: false, 
        error: 'Token expired' 
      });
    }
    
    return res.status(403).json({ 
      success: false, 
      error: 'Authentication failed' 
    });
  }
};

module.exports = { requireUser };