const express = require('express');
const router = express.Router();
const rateLimit = require('express-rate-limit');
const authController = require('../Controller/authController');
const { authenticate } = require('../Middlewares/authMiddleware');
const { validate } = require('../Middlewares/validationMiddleware');
const { 
  loginSchema, 
  updateProfileSchema, 
  changePasswordSchema 
} = require('../Validators/authValidators');

// Strict rate limiter for login attempts
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // Limit each IP to 5 login attempts per 15 minutes
  message: {
    success: false,
    message: 'Too many login attempts from this IP, please try again after 15 minutes.'
  },
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: false,
  skipFailedRequests: false,
});

// Rate limiter for refresh token endpoint
const refreshLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 20, // Allow more frequent refresh attempts
  message: {
    success: false,
    message: 'Too many refresh attempts from this IP, please try again later.'
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Public routes with strict rate limiting
router.post('/login', loginLimiter, validate(loginSchema), authController.login);
router.post('/refresh', refreshLimiter, authController.refresh);
router.post('/logout', authController.logout);

// Protected routes
router.get('/verify', authenticate, authController.verifyToken);
router.get('/profile', authenticate, authController.getProfile);
router.put('/profile', authenticate, validate(updateProfileSchema), authController.updateProfile);
router.post('/change-password', authenticate, validate(changePasswordSchema), authController.changePassword);

module.exports = router;
