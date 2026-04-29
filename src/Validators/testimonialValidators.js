const Joi = require('joi');

// Create testimonial validation
const createTestimonialSchema = Joi.object({
  customerName: Joi.string()
    .min(2)
    .max(200)
    .required()
    .messages({
      'string.min': 'Customer name must be at least 2 characters long',
      'string.max': 'Customer name cannot exceed 200 characters',
      'any.required': 'Customer name is required'
    }),
  content: Joi.string()
    .min(10)
    .max(2000)
    .required()
    .messages({
      'string.min': 'Testimonial content must be at least 10 characters long',
      'string.max': 'Testimonial content cannot exceed 2000 characters',
      'any.required': 'Testimonial content is required'
    }),
  rating: Joi.number()
    .integer()
    .min(1)
    .max(5)
    .required()
    .messages({
      'number.base': 'Rating must be a number',
      'number.integer': 'Rating must be a whole number',
      'number.min': 'Rating must be at least 1',
      'number.max': 'Rating cannot exceed 5',
      'any.required': 'Rating is required'
    }),
  eventType: Joi.string()
    .max(100)
    .optional()
    .allow('')
    .messages({
      'string.max': 'Event type cannot exceed 100 characters'
    }),
  isApproved: Joi.boolean()
    .optional()
    .default(false)
});

// Update testimonial validation
const updateTestimonialSchema = Joi.object({
  customerName: Joi.string()
    .min(2)
    .max(200)
    .optional()
    .messages({
      'string.min': 'Customer name must be at least 2 characters long',
      'string.max': 'Customer name cannot exceed 200 characters'
    }),
  content: Joi.string()
    .min(10)
    .max(2000)
    .optional()
    .messages({
      'string.min': 'Testimonial content must be at least 10 characters long',
      'string.max': 'Testimonial content cannot exceed 2000 characters'
    }),
  rating: Joi.number()
    .integer()
    .min(1)
    .max(5)
    .optional()
    .messages({
      'number.base': 'Rating must be a number',
      'number.integer': 'Rating must be a whole number',
      'number.min': 'Rating must be at least 1',
      'number.max': 'Rating cannot exceed 5'
    }),
  eventType: Joi.string()
    .max(100)
    .optional()
    .allow('')
    .messages({
      'string.max': 'Event type cannot exceed 100 characters'
    }),
  isApproved: Joi.boolean()
    .optional()
});

module.exports = {
  createTestimonialSchema,
  updateTestimonialSchema
};
