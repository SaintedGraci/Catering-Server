const { User } = require('../Models');
const jwt = require('jsonwebtoken');
const { authLogger } = require('../../config/logger');

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || 'your-refresh-secret-key-change-in-production';
const JWT_EXPIRES_IN = '15m'; // Short-lived access token (15 minutes)
const JWT_REFRESH_EXPIRES_IN = '7d'; // Long-lived refresh token (7 days)

// Generate access token
const generateAccessToken = (user) => {
  return jwt.sign(
    { 
      id: user.id, 
      email: user.email,
      type: 'access'
    },
    JWT_SECRET,
    { expiresIn: JWT_EXPIRES_IN }
  );
};

// Generate refresh token
const generateRefreshToken = (user) => {
  return jwt.sign(
    { 
      id: user.id,
      type: 'refresh'
    },
    JWT_REFRESH_SECRET,
    { expiresIn: JWT_REFRESH_EXPIRES_IN }
  );
};

// Set auth cookies
const setAuthCookies = (res, accessToken, refreshToken) => {
  const isProduction = process.env.NODE_ENV === 'production';
  
  // Access token cookie (short-lived)
  res.cookie('token', accessToken, {
    httpOnly: true,
    secure: isProduction, // Must be true for SameSite=None
    sameSite: isProduction ? 'none' : 'lax', // 'none' for cross-domain in production
    maxAge: 15 * 60 * 1000 // 15 minutes
  });

  // Refresh token cookie (long-lived)
  res.cookie('refreshToken', refreshToken, {
    httpOnly: true,
    secure: isProduction, // Must be true for SameSite=None
    sameSite: isProduction ? 'none' : 'lax', // 'none' for cross-domain in production
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    path: '/api/auth/refresh' // Only sent to refresh endpoint
  });
};

// Login
exports.login = async (req, res) => {
  const ip = req.ip || req.connection.remoteAddress;
  const userAgent = req.get('user-agent');
  
  try {
    const { email, password } = req.body;

    // Validate input
    if (!email || !password) {
      authLogger.warn('Login attempt with missing credentials', {
        ip,
        userAgent,
        email: email || 'not provided',
      });
      
      return res.status(400).json({
        success: false,
        message: 'Email and password are required'
      });
    }

    // Find user by email
    const user = await User.findOne({ where: { email } });

    if (!user) {
      authLogger.warn('Failed login attempt - user not found', {
        email,
        ip,
        userAgent,
        reason: 'User does not exist',
      });
      
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    // Check if user is active
    if (!user.isActive) {
      authLogger.warn('Failed login attempt - account deactivated', {
        userId: user.id,
        email: user.email,
        ip,
        userAgent,
        reason: 'Account deactivated',
      });
      
      return res.status(403).json({
        success: false,
        message: 'Account is deactivated. Contact administrator.'
      });
    }

    // Check password
    const isPasswordValid = await user.comparePassword(password);

    if (!isPasswordValid) {
      authLogger.warn('Failed login attempt - invalid password', {
        userId: user.id,
        email: user.email,
        ip,
        userAgent,
        reason: 'Invalid password',
      });
      
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    // Generate tokens
    const accessToken = generateAccessToken(user);
    const refreshToken = generateRefreshToken(user);

    // Set HTTP-only cookies
    setAuthCookies(res, accessToken, refreshToken);

    // Log successful login
    authLogger.info('Successful login', {
      userId: user.id,
      email: user.email,
      ip,
      userAgent,
    });

    // Return user data (without password)
    res.json({
      success: true,
      message: 'Login successful',
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        isActive: user.isActive
      }
    });

  } catch (error) {
    authLogger.error('Login error', {
      email: req.body.email,
      ip,
      userAgent,
      error: error.message,
      stack: error.stack,
    });
    
    res.status(500).json({
      success: false,
      message: 'Server error during login'
    });
  }
};

// Refresh access token
exports.refresh = async (req, res) => {
  const ip = req.ip || req.connection.remoteAddress;
  const userAgent = req.get('user-agent');
  
  try {
    const refreshToken = req.cookies.refreshToken;

    if (!refreshToken) {
      authLogger.warn('Token refresh attempt without refresh token', {
        ip,
        userAgent,
      });
      
      return res.status(401).json({
        success: false,
        message: 'No refresh token provided'
      });
    }

    // Verify refresh token
    const decoded = jwt.verify(refreshToken, JWT_REFRESH_SECRET);

    // Check token type
    if (decoded.type !== 'refresh') {
      authLogger.warn('Token refresh attempt with invalid token type', {
        ip,
        userAgent,
        tokenType: decoded.type,
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
      authLogger.warn('Token refresh attempt for non-existent user', {
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
      authLogger.warn('Token refresh attempt for deactivated account', {
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

    // Generate new access token
    const newAccessToken = generateAccessToken(user);

    const isProduction = process.env.NODE_ENV === 'production';
    
    // Set new access token cookie (keep refresh token)
    res.cookie('token', newAccessToken, {
      httpOnly: true,
      secure: isProduction,
      sameSite: isProduction ? 'none' : 'lax',
      maxAge: 15 * 60 * 1000 // 15 minutes
    });

    authLogger.info('Token refreshed successfully', {
      userId: user.id,
      email: user.email,
      ip,
      userAgent,
    });

    res.json({
      success: true,
      message: 'Token refreshed successfully',
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        isActive: user.isActive
      }
    });

  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      authLogger.warn('Token refresh failed - invalid token', {
        ip,
        userAgent,
        error: error.message,
      });
      
      return res.status(401).json({
        success: false,
        message: 'Invalid refresh token'
      });
    }
    if (error.name === 'TokenExpiredError') {
      authLogger.warn('Token refresh failed - token expired', {
        ip,
        userAgent,
      });
      
      return res.status(401).json({
        success: false,
        message: 'Refresh token expired'
      });
    }
    
    authLogger.error('Token refresh error', {
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

// Get current user profile
exports.getProfile = async (req, res) => {
  try {
    const user = await User.findByPk(req.user.id, {
      attributes: ['id', 'name', 'email', 'isActive', 'createdAt']
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.json({
      success: true,
      data: user
    });
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch profile'
    });
  }
};

// Update profile
exports.updateProfile = async (req, res) => {
  try {
    const { name, email } = req.body;

    const user = await User.findByPk(req.user.id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Check if email is already taken by another user
    if (email && email !== user.email) {
      const existingUser = await User.findOne({ where: { email } });
      if (existingUser) {
        return res.status(400).json({
          success: false,
          message: 'Email already in use'
        });
      }
    }

    await user.update({
      name: name || user.name,
      email: email || user.email
    });

    res.json({
      success: true,
      message: 'Profile updated successfully',
      data: {
        id: user.id,
        name: user.name,
        email: user.email,
        isActive: user.isActive
      }
    });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update profile'
    });
  }
};

// Change password
exports.changePassword = async (req, res) => {
  const ip = req.ip || req.connection.remoteAddress;
  const userAgent = req.get('user-agent');
  
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        message: 'Current password and new password are required'
      });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'New password must be at least 6 characters'
      });
    }

    const user = await User.findByPk(req.user.id);
    
    // Verify current password
    const isPasswordValid = await user.comparePassword(currentPassword);
    if (!isPasswordValid) {
      authLogger.warn('Failed password change attempt - invalid current password', {
        userId: user.id,
        email: user.email,
        ip,
        userAgent,
      });
      
      return res.status(401).json({
        success: false,
        message: 'Current password is incorrect'
      });
    }

    // Update password
    user.password = newPassword;
    await user.save();

    authLogger.info('Password changed successfully', {
      userId: user.id,
      email: user.email,
      ip,
      userAgent,
    });

    res.json({
      success: true,
      message: 'Password changed successfully'
    });
  } catch (error) {
    authLogger.error('Password change error', {
      userId: req.user.id,
      ip,
      userAgent,
      error: error.message,
      stack: error.stack,
    });
    
    res.status(500).json({
      success: false,
      message: 'Failed to change password'
    });
  }
};

// Verify token
exports.verifyToken = async (req, res) => {
  try {
    const user = req.user; // Set by auth middleware

    res.json({
      success: true,
      user: {
        id: user.id,
        name: user.name,
        email: user.email
      }
    });
  } catch (error) {
    console.error('Verify token error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// Logout (clear HTTP-only cookies)
exports.logout = async (req, res) => {
  const ip = req.ip || req.connection.remoteAddress;
  const userAgent = req.get('user-agent');
  
  // Log logout if user is authenticated
  if (req.user) {
    authLogger.info('User logged out', {
      userId: req.user.id,
      email: req.user.email,
      ip,
      userAgent,
    });
  }
  
  // Clear access token
  res.clearCookie('token', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict'
  });

  // Clear refresh token
  res.clearCookie('refreshToken', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    path: '/api/auth/refresh'
  });
  
  res.json({
    success: true,
    message: 'Logout successful'
  });
};
