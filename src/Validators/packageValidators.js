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
  priceRange: Joi.string()
    .min(1)
    .max(100)
    .required()
    .messages({
      'string.min': 'Price range is required',
      'string.max': 'Price range cannot exceed 100 characters',
      'any.required': 'Price range is required'
    }),
  minPrice: Joi.number()
    .positive()
    .optional()
    .messages({
      'number.base': 'Minimum price must be a number',
      'number.positive': 'Minimum price must be positive'
    }),
  maxPrice: Joi.number()
    .positive()
    .greater(Joi.ref('minPrice'))
    .optional()
    .messages({
      'number.base': 'Maximum price must be a number',
      'number.positive': 'Maximum price must be positive',
      'number.greater': 'Maximum price must be greater than minimum price'
    }),
  includes: Joi.array()
    .items(Joi.string().max(500))
    .optional()
    .default([])
    .messages({
      'array.base': 'Includes must be an array of strings'
    }),
  dishSelectionCount: Joi.number()
    .integer()
    .min(0)
    .max(100)
    .optional()
    .default(0)
    .messages({
      'number.base': 'Dish selection count must be a number',
      'number.integer': 'Dish selection count must be a whole number',
      'number.min': 'Dish selection count cannot be negative',
      'number.max': 'Dish selection count cannot exceed 100'
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
  priceRange: Joi.string()
    .min(1)
    .max(100)
    .optional()
    .messages({
      'string.min': 'Price range cannot be empty',
      'string.max': 'Price range cannot exceed 100 characters'
    }),
  minPrice: Joi.number()
    .positive()
    .optional()
    .messages({
      'number.base': 'Minimum price must be a number',
      'number.positive': 'Minimum price must be positive'
    }),
  maxPrice: Joi.number()
    .positive()
    .optional()
    .messages({
      'number.base': 'Maximum price must be a number',
      'number.positive': 'Maximum price must be positive'
    }),
  includes: Joi.array()
    .items(Joi.string().max(500))
    .optional()
    .messages({
      'array.base': 'Includes must be an array of strings'
    }),
  dishSelectionCount: Joi.number()
    .integer()
    .min(0)
    .max(100)
    .optional()
    .messages({
      'number.base': 'Dish selection count must be a number',
      'number.integer': 'Dish selection count must be a whole number',
      'number.min': 'Dish selection count cannot be negative',
      'number.max': 'Dish selection count cannot exceed 100'
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
