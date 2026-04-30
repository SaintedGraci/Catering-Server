const { Booking, Menu } = require('../Models');

// Get all bookings
exports.getAllBookings = async (req, res) => {
  try {
    const bookings = await Booking.findAll({
      include: [{
        model: Menu,
        as: 'package',
        attributes: ['id', 'name', 'type']
      }],
      order: [['eventDate', 'ASC'], ['createdAt', 'DESC']]
    });

    res.json({
      success: true,
      data: bookings
    });
  } catch (error) {
    console.error('Get bookings error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching bookings'
    });
  }
};

// Get single booking
exports.getBookingById = async (req, res) => {
  try {
    const { id } = req.params;
    const booking = await Booking.findByPk(id, {
      include: [{
        model: Menu,
        as: 'package',
        attributes: ['id', 'name', 'type', 'description']
      }]
    });

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found'
      });
    }

    res.json({
      success: true,
      data: booking
    });
  } catch (error) {
    console.error('Get booking error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching booking'
    });
  }
};

// Create new booking
exports.createBooking = async (req, res) => {
  try {
    const {
      customerName,
      customerEmail,
      customerPhone,
      eventDate,
      guestCount,
      venue,
      packageId,
      packageName,
      packagePrice,
      tier,
      tierName,
      selectedDishes,
      notes,
      estimatedPrice
    } = req.body;

    // Validate required fields
    if (!customerName || !customerEmail || !customerPhone || !eventDate || !guestCount || !tier) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields'
      });
    }

    const booking = await Booking.create({
      customerName,
      customerEmail,
      customerPhone,
      eventDate,
      guestCount,
      venue,
      packageId,
      packageName,
      packagePrice,
      tier,
      tierName,
      selectedDishes: selectedDishes || [],
      notes,
      estimatedPrice,
      status: 'pending'
    });

    res.status(201).json({
      success: true,
      message: 'Booking created successfully',
      data: booking
    });
  } catch (error) {
    console.error('Create booking error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while creating booking'
    });
  }
};

// Update booking
exports.updateBooking = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      customerName,
      customerEmail,
      customerPhone,
      eventDate,
      guestCount,
      venue,
      notes,
      status,
      estimatedPrice
    } = req.body;

    const booking = await Booking.findByPk(id);

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found'
      });
    }

    await booking.update({
      customerName: customerName || booking.customerName,
      customerEmail: customerEmail || booking.customerEmail,
      customerPhone: customerPhone || booking.customerPhone,
      eventDate: eventDate || booking.eventDate,
      guestCount: guestCount || booking.guestCount,
      venue: venue !== undefined ? venue : booking.venue,
      notes: notes !== undefined ? notes : booking.notes,
      status: status || booking.status,
      estimatedPrice: estimatedPrice !== undefined ? estimatedPrice : booking.estimatedPrice
    });

    res.json({
      success: true,
      message: 'Booking updated successfully',
      data: booking
    });
  } catch (error) {
    console.error('Update booking error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while updating booking'
    });
  }
};

// Delete booking
exports.deleteBooking = async (req, res) => {
  try {
    const { id } = req.params;

    const booking = await Booking.findByPk(id);

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found'
      });
    }

    await booking.destroy();

    res.json({
      success: true,
      message: 'Booking deleted successfully'
    });
  } catch (error) {
    console.error('Delete booking error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while deleting booking'
    });
  }
};

// Update booking status
exports.updateBookingStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!['pending', 'confirmed', 'cancelled', 'completed'].includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid status value'
      });
    }

    const booking = await Booking.findByPk(id);

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found'
      });
    }

    await booking.update({ status });

    res.json({
      success: true,
      message: 'Booking status updated successfully',
      data: booking
    });
  } catch (error) {
    console.error('Update booking status error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while updating booking status'
    });
  }
};

// Get bookings by status
exports.getBookingsByStatus = async (req, res) => {
  try {
    const { status } = req.params;

    const bookings = await Booking.findAll({
      where: { status },
      include: [{
        model: Menu,
        as: 'package',
        attributes: ['id', 'name', 'type']
      }],
      order: [['eventDate', 'ASC']]
    });

    res.json({
      success: true,
      data: bookings
    });
  } catch (error) {
    console.error('Get bookings by status error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching bookings'
    });
  }
};
