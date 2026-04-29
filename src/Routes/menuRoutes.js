const express = require('express');
const router = express.Router();
const menuController = require('../Controller/menuController');
const { authenticate } = require('../Middlewares/authMiddleware');
const { validate } = require('../Middlewares/validationMiddleware');
const { createMenuSchema, updateMenuSchema } = require('../Validators/menuValidators');
const { idParamSchema } = require('../Validators/dishValidators');

// Public routes
router.get('/', menuController.getAllMenus);
router.get('/:id', validate(idParamSchema, 'params'), menuController.getMenuById);

// Protected routes (admin only)
router.post('/', authenticate, validate(createMenuSchema), menuController.createMenu);
router.put('/:id', authenticate, validate(idParamSchema, 'params'), validate(updateMenuSchema), menuController.updateMenu);
router.delete('/:id', authenticate, validate(idParamSchema, 'params'), menuController.deleteMenu);

module.exports = router;
