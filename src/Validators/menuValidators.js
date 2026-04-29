const Joi = require('joi');

// Create menu validation
const createMenuSchema = Joi.object({
  name: Joi.string()
    .min(2)
    .max(200)
    .required()
    .messages({
      'string.min': 'Menu name must be at least 2 characters long',
      'string.max': 'Menu name cannot exceed 200 characters',
      'any.required': 'Menu name is required'
    }),
  description: Joi.string()
    .max(1000)
    .optional()
    .allow('')
    .messages({
      'string.max': 'Description cannot exceed 1000 characters'
    }),
  type: Joi.string()
    .valid('wedding', 'corporate', 'private', 'birthday', 'custom')
    .required()
    .messages({
      'any.only': 'Type must be one of: wedding, corporate, private, birthday, custom',
      'any.required': 'Menu type is required'
    }),
  image: Joi.string()
    .optional()
    .allow('')
    .messages({
      'string.base': 'Image must be a valid string'
    }),
  isActive: Joi.boolean()
    .optional()
    .default(true)
});

// Update menu validation
const updateMenuSchema = Joi.object({
  name: Joi.string()
    .min(2)
    .max(200)
    .optional()
    .messages({
      'string.min': 'Menu name must be at least 2 characters long',
      'string.max': 'Menu name cannot exceed 200 characters'
    }),
  description: Joi.string()
    .max(1000)
    .optional()
    .allow('')
    .messages({
      'string.max': 'Description cannot exceed 1000 characters'
    }),
  type: Joi.string()
    .valid('wedding', 'corporate', 'private', 'birthday', 'custom')
    .optional()
    .messages({
      'any.only': 'Type must be one of: wedding, corporate, private, birthday, custom'
    }),
  image: Joi.string()
    .optional()
    .allow('')
    .messages({
      'string.base': 'Image must be a valid string'
    }),
  isActive: Joi.boolean()
    .optional()
});

module.exports = {
  createMenuSchema,
  updateMenuSchema
};
