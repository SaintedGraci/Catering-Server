const { Testimonial } = require('../Models');

// Get all testimonials (public - only active ones)
exports.getAllTestimonials = async (req, res) => {
  try {
    const testimonials = await Testimonial.findAll({
      where: { isActive: true },
      order: [
        ['isFeatured', 'DESC'],
        ['sortOrder', 'ASC'],
        ['createdAt', 'DESC']
      ]
    });

    res.json({
      success: true,
      data: testimonials
    });
  } catch (error) {
    console.error('Get testimonials error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching testimonials'
    });
  }
};

// Get all testimonials (admin - including inactive)
exports.getAllTestimonialsAdmin = async (req, res) => {
  try {
    const testimonials = await Testimonial.findAll({
      order: [
        ['isFeatured', 'DESC'],
        ['sortOrder', 'ASC'],
        ['createdAt', 'DESC']
      ]
    });

    res.json({
      success: true,
      data: testimonials
    });
  } catch (error) {
    console.error('Get testimonials error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching testimonials'
    });
  }
};

// Get single testimonial
exports.getTestimonialById = async (req, res) => {
  try {
    const { id } = req.params;
    const testimonial = await Testimonial.findByPk(id);

    if (!testimonial) {
      return res.status(404).json({
        success: false,
        message: 'Testimonial not found'
      });
    }

    res.json({
      success: true,
      data: testimonial
    });
  } catch (error) {
    console.error('Get testimonial error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching testimonial'
    });
  }
};

// Create new testimonial
exports.createTestimonial = async (req, res) => {
  try {
    const {
      customerName,
      customerRole,
      content,
      rating,
      eventType,
      image,
      isActive,
      isFeatured,
      sortOrder
    } = req.body;

    // Validate required fields
    if (!customerName || !content) {
      return res.status(400).json({
        success: false,
        message: 'Customer name and content are required'
      });
    }

    const testimonial = await Testimonial.create({
      customerName,
      customerRole,
      content,
      rating: rating || 5,
      eventType,
      image,
      isActive: isActive !== undefined ? isActive : true,
      isFeatured: isFeatured || false,
      sortOrder: sortOrder || 0
    });

    res.status(201).json({
      success: true,
      message: 'Testimonial created successfully',
      data: testimonial
    });
  } catch (error) {
    console.error('Create testimonial error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while creating testimonial'
    });
  }
};

// Update testimonial
exports.updateTestimonial = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      customerName,
      customerRole,
      content,
      rating,
      eventType,
      image,
      isActive,
      isFeatured,
      sortOrder
    } = req.body;

    const testimonial = await Testimonial.findByPk(id);

    if (!testimonial) {
      return res.status(404).json({
        success: false,
        message: 'Testimonial not found'
      });
    }

    await testimonial.update({
      customerName: customerName || testimonial.customerName,
      customerRole: customerRole !== undefined ? customerRole : testimonial.customerRole,
      content: content || testimonial.content,
      rating: rating !== undefined ? rating : testimonial.rating,
      eventType: eventType !== undefined ? eventType : testimonial.eventType,
      image: image !== undefined ? image : testimonial.image,
      isActive: isActive !== undefined ? isActive : testimonial.isActive,
      isFeatured: isFeatured !== undefined ? isFeatured : testimonial.isFeatured,
      sortOrder: sortOrder !== undefined ? sortOrder : testimonial.sortOrder
    });

    res.json({
      success: true,
      message: 'Testimonial updated successfully',
      data: testimonial
    });
  } catch (error) {
    console.error('Update testimonial error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while updating testimonial'
    });
  }
};

// Delete testimonial
exports.deleteTestimonial = async (req, res) => {
  try {
    const { id } = req.params;

    const testimonial = await Testimonial.findByPk(id);

    if (!testimonial) {
      return res.status(404).json({
        success: false,
        message: 'Testimonial not found'
      });
    }

    await testimonial.destroy();

    res.json({
      success: true,
      message: 'Testimonial deleted successfully'
    });
  } catch (error) {
    console.error('Delete testimonial error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while deleting testimonial'
    });
  }
};
