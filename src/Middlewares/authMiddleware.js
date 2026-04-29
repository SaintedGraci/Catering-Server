const jwt = require('jsonwebtoken');
const { User } = require('../Models');
const { authLogger } = require('../../config/logger');

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

// Verify JWT token
exports.authenticate = async (req, res, next) => {
  const ip = req.ip || req.connection.remoteAddress;
  const userAgent = req.get('user-agent');
  
  try {
    // Get token from cookie first, then fallback to Authorization header for backward compatibility
    let token = req.cookies.token;
    
    if (!token) {
      const authHeader = req.headers.authorization;
      if (authHeader && authHeader.startsWith('Bearer ')) {
        token = authHeader.substring(7); // Remove 'Bearer ' prefix
      }
    }

    if (!token) {
      authLogger.warn('Authentication failed - no token provided', {
        path: req.originalUrl,
        method: req.method,
        ip,
        userAgent,
      });
      
      return res.status(401).json({
        success: false,
        message: 'No token provided'
      });
    }

    // Verify token
    const decoded = jwt.verify(token, JWT_SECRET);

    // Check token type (must be access token)
    if (decoded.type && decoded.type !== 'access') {
      authLogger.warn('Authentication failed - invalid token type', {
        path: req.originalUrl,
        method: req.method,
        tokenType: decoded.type,
        ip,
        userAgent,
      });
      
      return res.status(401).json({
        success: false,
        message: 'Invalid token type'
      });
    }

    // Get user from database
    const user = await User.findByPk(decoded.id, {
      attributes: { exclude: ['password'] }
    });

    if (!user) {
      authLogger.warn('Authentication failed - user not found', {
        path: req.originalUrl,
        method: req.method,
        userId: decoded.id,
        ip,
        userAgent,
      });
      
      return res.status(401).json({
        success: false,
        message: 'User not found'
      });
    }

    // Check if user is active
    if (!user.isActive) {
      authLogger.warn('Authentication failed - account deactivated', {
        path: req.originalUrl,
        method: req.method,
        userId: user.id,
        email: user.email,
        ip,
        userAgent,
      });
      
      return res.status(403).json({
        success: false,
        message: 'Account is deactivated'
      });
    }

    // Attach user to request
    req.user = user;
    next();

  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      authLogger.warn('Authentication failed - invalid token', {
        path: req.originalUrl,
        method: req.method,
        ip,
        userAgent,
        error: error.message,
      });
      
      return res.status(401).json({
        success: false,
        message: 'Invalid token'
      });
    }
    if (error.name === 'TokenExpiredError') {
      authLogger.warn('Authentication failed - token expired', {
        path: req.originalUrl,
        method: req.method,
        ip,
        userAgent,
      });
      
      return res.status(401).json({
        success: false,
        message: 'Token expired',
        code: 'TOKEN_EXPIRED' // Frontend can use this to trigger refresh
      });
    }
    
    authLogger.error('Authentication middleware error', {
      path: req.originalUrl,
      method: req.method,
      ip,
      userAgent,
      error: error.message,
      stack: error.stack,
    });
    
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};
