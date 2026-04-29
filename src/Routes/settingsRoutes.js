const express = require('express');
const router = express.Router();
const { getSettings, updateSettings } = require('../Controller/settingsController');
const { authenticate } = require('../Middlewares/authMiddleware');

// Public route - get settings
router.get('/', getSettings);

// Admin routes - update settings
router.put('/', authenticate, updateSettings);

module.exports = router;
