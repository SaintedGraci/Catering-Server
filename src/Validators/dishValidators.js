const Joi = require('joi');

// Create dish validation
const createDishSchema = Joi.object({
  name: Joi.string()
    .min(2)
    .max(200)
    .required()
    .messages({
      'string.min': 'Dish name must be at least 2 characters long',
      'string.max': 'Dish name cannot exceed 200 characters',
      'any.required': 'Dish name is required'
    }),
  description: Joi.string()
    .max(1000)
    .optional()
    .allow('')
    .messages({
      'string.max': 'Description cannot exceed 1000 characters'
    }),
  category: Joi.string()
    .valid('appetizer', 'main_course', 'side_dish', 'dessert', 'beverage')
    .required()
    .messages({
      'any.only': 'Category must be one of: appetizer, main_course, side_dish, dessert, beverage',
      'any.required': 'Category is required'
    }),
  image: Joi.string()
    .optional()
    .allow('')
    .messages({
      'string.base': 'Image must be a valid string'
    }),
  isAvailable: Joi.boolean()
    .optional()
    .default(true)
});

// Update dish validation
const updateDishSchema = Joi.object({
  name: Joi.string()
    .min(2)
    .max(200)
    .optional()
    .messages({
      'string.min': 'Dish name must be at least 2 characters long',
      'string.max': 'Dish name cannot exceed 200 characters'
    }),
  description: Joi.string()
    .max(1000)
    .optional()
    .allow('')
    .messages({
      'string.max': 'Description cannot exceed 1000 characters'
    }),
  category: Joi.string()
    .valid('appetizer', 'main_course', 'side_dish', 'dessert', 'beverage')
    .optional()
    .messages({
      'any.only': 'Category must be one of: appetizer, main_course, side_dish, dessert, beverage'
    }),
  image: Joi.string()
    .optional()
    .allow('')
    .messages({
      'string.base': 'Image must be a valid string'
    }),
  isAvailable: Joi.boolean()
    .optional()
});

// ID parameter validation
const idParamSchema = Joi.object({
  id: Joi.number()
    .integer()
    .positive()
    .required()
    .messages({
      'number.base': 'ID must be a number',
      'number.integer': 'ID must be an integer',
      'number.positive': 'ID must be a positive number',
      'any.required': 'ID is required'
    })
});

module.exports = {
  createDishSchema,
  updateDishSchema,
  idParamSchema
};
