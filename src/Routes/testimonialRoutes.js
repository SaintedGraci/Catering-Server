const express = require('express');
const router = express.Router();
const testimonialController = require('../Controller/testimonialController');
const { authenticate } = require('../Middlewares/authMiddleware');
const { validate } = require('../Middlewares/validationMiddleware');
const { createTestimonialSchema, updateTestimonialSchema } = require('../Validators/testimonialValidators');
const { idParamSchema } = require('../Validators/dishValidators');

// Public route - get active testimonials
router.get('/', testimonialController.getAllTestimonials);

// Protected routes - require authentication
router.get('/admin/all', authenticate, testimonialController.getAllTestimonialsAdmin);
router.get('/:id', authenticate, validate(idParamSchema, 'params'), testimonialController.getTestimonialById);
router.post('/', authenticate, validate(createTestimonialSchema), testimonialController.createTestimonial);
router.put('/:id', authenticate, validate(idParamSchema, 'params'), validate(updateTestimonialSchema), testimonialController.updateTestimonial);
router.delete('/:id', authenticate, validate(idParamSchema, 'params'), testimonialController.deleteTestimonial);

module.exports = router;
