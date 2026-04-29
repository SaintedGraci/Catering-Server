const Joi = require('joi');

// Create booking validation
const createBookingSchema = Joi.object({
  customerName: Joi.string()
    .min(2)
    .max(200)
    .required()
    .messages({
      'string.min': 'Customer name must be at least 2 characters long',
      'string.max': 'Customer name cannot exceed 200 characters',
      'any.required': 'Customer name is required'
    }),
  customerEmail: Joi.string()
    .email({ tlds: { allow: false } })
    .required()
    .messages({
      'string.email': 'Please provide a valid email address',
      'any.required': 'Customer email is required'
    }),
  customerPhone: Joi.string()
    .pattern(/^[\d\s\-\+\(\)]+$/)
    .min(7)
    .max(20)
    .required()
    .messages({
      'string.pattern.base': 'Please provide a valid phone number',
      'string.min': 'Phone number must be at least 7 characters',
      'string.max': 'Phone number cannot exceed 20 characters',
      'any.required': 'Customer phone is required'
    }),
  customerAddress: Joi.string()
    .max(500)
    .optional()
    .allow('')
    .messages({
      'string.max': 'Address cannot exceed 500 characters'
    }),
  eventDate: Joi.date()
    .iso()
    .custom((value, helpers) => {
      // Get today's date at midnight in local timezone
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      // Get the event date at midnight
      const eventDate = new Date(value);
      eventDate.setHours(0, 0, 0, 0);
      
      // Compare dates (not times)
      if (eventDate < today) {
        return helpers.error('date.min');
      }
      
      return value;
    })
    .required()
    .messages({
      'date.base': 'Please provide a valid event date',
      'date.min': 'Event date must be today or in the future',
      'any.required': 'Event date is required'
    }),
  eventTime: Joi.string()
    .pattern(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/)
    .optional()
    .allow('')
    .messages({
      'string.pattern.base': 'Please provide a valid time in HH:MM format'
    }),
  eventLocation: Joi.string()
    .max(500)
    .optional()
    .allow('')
    .messages({
      'string.max': 'Event location cannot exceed 500 characters'
    }),
  guestCount: Joi.number()
    .integer()
    .min(1)
    .max(10000)
    .required()
    .messages({
      'number.base': 'Guest count must be a number',
      'number.integer': 'Guest count must be a whole number',
      'number.min': 'Guest count must be at least 1',
      'number.max': 'Guest count cannot exceed 10,000',
      'any.required': 'Guest count is required'
    }),
  packageId: Joi.number()
    .integer()
    .positive()
    .required()
    .messages({
      'number.base': 'Package ID must be a number',
      'number.positive': 'Package ID must be positive',
      'any.required': 'Package selection is required'
    }),
  tier: Joi.string()
    .valid('essential', 'signature', 'bespoke')
    .required()
    .messages({
      'any.only': 'Tier must be one of: essential, signature, bespoke',
      'any.required': 'Tier selection is required'
    }),
  selectedDishes: Joi.array()
    .items(Joi.number().integer().positive())
    .optional()
    .default([])
    .messages({
      'array.base': 'Selected dishes must be an array'
    }),
  specialRequests: Joi.string()
    .max(2000)
    .optional()
    .allow('')
    .messages({
      'string.max': 'Special requests cannot exceed 2000 characters'
    }),
  estimatedPrice: Joi.number()
    .positive()
    .optional()
    .messages({
      'number.base': 'Estimated price must be a number',
      'number.positive': 'Estimated price must be positive'
    })
});

// Update booking status validation
const updateStatusSchema = Joi.object({
  status: Joi.string()
    .valid('pending', 'confirmed', 'cancelled', 'completed')
    .required()
    .messages({
      'any.only': 'Status must be one of: pending, confirmed, cancelled, completed',
      'any.required': 'Status is required'
    })
});

module.exports = {
  createBookingSchema,
  updateStatusSchema
};
