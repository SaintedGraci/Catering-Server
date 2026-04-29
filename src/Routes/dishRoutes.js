const express = require('express');
const router = express.Router();
const dishController = require('../Controller/dishController');
const { authenticate } = require('../Middlewares/authMiddleware');
const { validate } = require('../Middlewares/validationMiddleware');
const { createDishSchema, updateDishSchema, idParamSchema } = require('../Validators/dishValidators');

// Public routes
router.get('/', dishController.getAllDishes);
router.get('/category/:category', dishController.getDishesByCategory);
router.get('/:id', validate(idParamSchema, 'params'), dishController.getDishById);

// Protected routes (admin only)
router.post('/', authenticate, validate(createDishSchema), dishController.createDish);
router.put('/:id', authenticate, validate(idParamSchema, 'params'), validate(updateDishSchema), dishController.updateDish);
router.delete('/:id', authenticate, validate(idParamSchema, 'params'), dishController.deleteDish);

module.exports = router;
