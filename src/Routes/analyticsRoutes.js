const express = require('express');
const router = express.Router();
const { 
  getDashboardStats, 
  getRevenueAnalytics, 
  getPackagePerformance 
} = require('../Controller/analyticsController');
const { authenticate } = require('../Middlewares/authMiddleware');

// All analytics routes require authentication
router.use(authenticate);

// Dashboard statistics
router.get('/dashboard', getDashboardStats);

// Revenue analytics
router.get('/revenue', getRevenueAnalytics);

// Package performance
router.get('/packages', getPackagePerformance);

module.exports = router;
