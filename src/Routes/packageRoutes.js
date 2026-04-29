const express = require('express');
const router = express.Router();
const packageController = require('../Controller/packageController');
const { authenticate } = require('../Middlewares/authMiddleware');
const { validate } = require('../Middlewares/validationMiddleware');
const { createPackageSchema, updatePackageSchema } = require('../Validators/packageValidators');
const { idParamSchema } = require('../Validators/dishValidators');

// Public routes - get active packages
router.get('/', packageController.getAllPackages);
router.get('/menu-type/:menuType', packageController.getPackagesByMenuType);

// Protected routes - require authentication
router.get('/admin/all', authenticate, packageController.getAllPackagesAdmin);
router.get('/:id', authenticate, validate(idParamSchema, 'params'), packageController.getPackageById);
router.post('/', authenticate, validate(createPackageSchema), packageController.createPackage);
router.put('/:id', authenticate, validate(idParamSchema, 'params'), validate(updatePackageSchema), packageController.updatePackage);
router.delete('/:id', authenticate, validate(idParamSchema, 'params'), packageController.deletePackage);

module.exports = router;
