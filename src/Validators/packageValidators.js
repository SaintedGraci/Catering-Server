const Joi = require('joi');

// Create package validation
const createPackageSchema = Joi.object({
  name: Joi.string()
    .min(2)
    .max(200)
    .required()
    .messages({
      'string.min': 'Package name must be at least 2 characters long',
      'string.max': 'Package name cannot exceed 200 characters',
      'any.required': 'Package name is required'
    }),
  description: Joi.string()
    .max(2000)
    .optional()
    .allow('')
    .messages({
      'string.max': 'Description cannot exceed 2000 characters'
    }),
  menuType: Joi.string()
    .valid('wedding', 'corporate', 'private', 'birthday', 'custom')
    .required()
    .messages({
      'any.only': 'Menu type must be one of: wedding, corporate, private, birthday, custom',
      'any.required': 'Menu type is required'
    }),
  estimatedPrice: Joi.string()
    .min(1)
    .max(100)
    .required()
    .messages({
      'string.min': 'Estimated price is required',
      'string.max': 'Estimated price cannot exceed 100 characters',
      'any.required': 'Estimated price is required'
    }),
  goodForPax: Joi.number()
    .integer()
    .positive()
    .required()
    .messages({
      'number.base': 'Good for pax must be a number',
      'number.integer': 'Good for pax must be a whole number',
      'number.positive': 'Good for pax must be positive',
      'any.required': 'Good for pax is required'
    }),
  includes: Joi.array()
    .items(Joi.string().max(500))
    .optional()
    .default([])
    .messages({
      'array.base': 'Includes must be an array of strings'
    }),
  dishSelectionRules: Joi.object()
    .pattern(
      Joi.string().valid('appetizer', 'main_course', 'side_dish', 'dessert', 'beverage'),
      Joi.number().integer().min(0).max(50)
    )
    .optional()
    .allow(null)
    .messages({
      'object.base': 'Dish selection rules must be an object with category counts'
    }),
  isFeatured: Joi.boolean()
    .optional()
    .default(false),
  isActive: Joi.boolean()
    .optional()
    .default(true),
  dishes: Joi.array()
    .items(Joi.number().integer().positive())
    .optional()
    .default([])
    .messages({
      'array.base': 'Dishes must be an array of dish IDs'
    })
});

// Update package validation
const updatePackageSchema = Joi.object({
  name: Joi.string()
    .min(2)
    .max(200)
    .optional()
    .messages({
      'string.min': 'Package name must be at least 2 characters long',
      'string.max': 'Package name cannot exceed 200 characters'
    }),
  description: Joi.string()
    .max(2000)
    .optional()
    .allow('')
    .messages({
      'string.max': 'Description cannot exceed 2000 characters'
    }),
  menuType: Joi.string()
    .valid('wedding', 'corporate', 'private', 'birthday', 'custom')
    .optional()
    .messages({
      'any.only': 'Menu type must be one of: wedding, corporate, private, birthday, custom'
    }),
  estimatedPrice: Joi.string()
    .min(1)
    .max(100)
    .optional()
    .messages({
      'string.min': 'Estimated price cannot be empty',
      'string.max': 'Estimated price cannot exceed 100 characters'
    }),
  goodForPax: Joi.number()
    .integer()
    .positive()
    .optional()
    .messages({
      'number.base': 'Good for pax must be a number',
      'number.integer': 'Good for pax must be a whole number',
      'number.positive': 'Good for pax must be positive'
    }),
  includes: Joi.array()
    .items(Joi.string().max(500))
    .optional()
    .messages({
      'array.base': 'Includes must be an array of strings'
    }),
  dishSelectionRules: Joi.object()
    .pattern(
      Joi.string().valid('appetizer', 'main_course', 'side_dish', 'dessert', 'beverage'),
      Joi.number().integer().min(0).max(50)
    )
    .optional()
    .allow(null)
    .messages({
      'object.base': 'Dish selection rules must be an object with category counts'
    }),
  isFeatured: Joi.boolean()
    .optional(),
  isActive: Joi.boolean()
    .optional(),
  dishes: Joi.array()
    .items(Joi.number().integer().positive())
    .optional()
    .messages({
      'array.base': 'Dishes must be an array of dish IDs'
    })
});

module.exports = {
  createPackageSchema,
  updatePackageSchema
};
