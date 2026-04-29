const express = require('express');
const router = express.Router();
const rateLimit = require('express-rate-limit');
const bookingController = require('../Controller/bookingController');
const { authenticate } = require('../Middlewares/authMiddleware');
const { validate } = require('../Middlewares/validationMiddleware');
const { createBookingSchema, updateStatusSchema } = require('../Validators/bookingValidators');
const { idParamSchema } = require('../Validators/dishValidators');

// Rate limiter for booking creation to prevent spam
const createBookingLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 10, // Limit each IP to 10 booking requests per hour
  message: {
    success: false,
    message: 'Too many booking requests from this IP, please try again later.'
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Public route - create booking (inquiry) with rate limiting
router.post('/', createBookingLimiter, validate(createBookingSchema), bookingController.createBooking);

// Protected routes - require authentication
router.get('/', authenticate, bookingController.getAllBookings);
router.get('/status/:status', authenticate, bookingController.getBookingsByStatus);
router.get('/:id', authenticate, validate(idParamSchema, 'params'), bookingController.getBookingById);
router.put('/:id', authenticate, validate(idParamSchema, 'params'), bookingController.updateBooking);
router.delete('/:id', authenticate, validate(idParamSchema, 'params'), bookingController.deleteBooking);
router.patch('/:id/status', authenticate, validate(idParamSchema, 'params'), validate(updateStatusSchema), bookingController.updateBookingStatus);

module.exports = router;
