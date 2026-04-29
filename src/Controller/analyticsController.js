const { Booking, Package, Dish, Menu, Testimonial } = require('../Models');
const { Op } = require('sequelize');
const { sequelize } = require('../../config/database');

// Get dashboard statistics
const getDashboardStats = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;

    // Build date filter
    const dateFilter = {};
    if (startDate && endDate) {
      dateFilter.createdAt = {
        [Op.between]: [new Date(startDate), new Date(endDate)]
      };
    }

    // Total bookings
    const totalBookings = await Booking.count({ where: dateFilter });

    // Bookings by status
    const bookingsByStatus = await Booking.findAll({
      where: dateFilter,
      attributes: [
        'status',
        [sequelize.fn('COUNT', sequelize.col('id')), 'count']
      ],
      group: ['status']
    });

    // Total revenue (estimated from confirmed bookings)
    const confirmedBookings = await Booking.findAll({
      where: {
        ...dateFilter,
        status: 'confirmed',
        estimatedPrice: { [Op.not]: null }
      },
      attributes: ['estimatedPrice']
    });

    const totalRevenue = confirmedBookings.reduce((sum, booking) => {
      return sum + (parseFloat(booking.estimatedPrice) || 0);
    }, 0);

    // Average booking value
    const avgBookingValue = confirmedBookings.length > 0 
      ? totalRevenue / confirmedBookings.length 
      : 0;

    // Pending bookings (need attention)
    const pendingBookings = await Booking.count({
      where: { status: 'pending' }
    });

    // Total customers (unique emails)
    const uniqueCustomers = await Booking.findAll({
      attributes: [[sequelize.fn('DISTINCT', sequelize.col('customerEmail')), 'email']],
      where: dateFilter
    });

    // Popular packages
    const popularPackages = await Booking.findAll({
      where: {
        ...dateFilter,
        packageName: { [Op.not]: null }
      },
      attributes: [
        'packageName',
        [sequelize.fn('COUNT', sequelize.col('id')), 'count']
      ],
      group: ['packageName'],
      order: [[sequelize.fn('COUNT', sequelize.col('id')), 'DESC']],
      limit: 5
    });

    // Bookings trend (last 12 months)
    const monthlyBookings = await Booking.findAll({
      where: {
        createdAt: {
          [Op.gte]: new Date(new Date().setMonth(new Date().getMonth() - 12))
        }
      },
      attributes: [
        [sequelize.fn('DATE_FORMAT', sequelize.col('createdAt'), '%Y-%m'), 'month'],
        [sequelize.fn('COUNT', sequelize.col('id')), 'count'],
        [sequelize.fn('SUM', sequelize.col('estimatedPrice')), 'revenue']
      ],
      group: [sequelize.fn('DATE_FORMAT', sequelize.col('createdAt'), '%Y-%m')],
      order: [[sequelize.fn('DATE_FORMAT', sequelize.col('createdAt'), '%Y-%m'), 'ASC']]
    });

    // Guest count distribution
    const guestDistribution = await Booking.findAll({
      where: dateFilter,
      attributes: [
        [sequelize.literal('CASE WHEN guestCount < 50 THEN "0-50" WHEN guestCount < 100 THEN "50-100" WHEN guestCount < 200 THEN "100-200" WHEN guestCount < 500 THEN "200-500" ELSE "500+" END'), 'range'],
        [sequelize.fn('COUNT', sequelize.col('id')), 'count']
      ],
      group: [sequelize.literal('CASE WHEN guestCount < 50 THEN "0-50" WHEN guestCount < 100 THEN "50-100" WHEN guestCount < 200 THEN "100-200" WHEN guestCount < 500 THEN "200-500" ELSE "500+" END')]
    });

    // Recent bookings
    const recentBookings = await Booking.findAll({
      order: [['createdAt', 'DESC']],
      limit: 10,
      attributes: ['id', 'customerName', 'packageName', 'eventDate', 'guestCount', 'status', 'estimatedPrice', 'createdAt']
    });

    res.json({
      success: true,
      data: {
        overview: {
          totalBookings,
          totalRevenue: Math.round(totalRevenue),
          avgBookingValue: Math.round(avgBookingValue),
          pendingBookings,
          totalCustomers: uniqueCustomers.length
        },
        bookingsByStatus: bookingsByStatus.map(b => ({
          status: b.status,
          count: parseInt(b.dataValues.count)
        })),
        popularPackages: popularPackages.map(p => ({
          name: p.packageName,
          count: parseInt(p.dataValues.count)
        })),
        monthlyTrend: monthlyBookings.map(m => ({
          month: m.dataValues.month,
          bookings: parseInt(m.dataValues.count),
          revenue: parseFloat(m.dataValues.revenue) || 0
        })),
        guestDistribution: guestDistribution.map(g => ({
          range: g.dataValues.range,
          count: parseInt(g.dataValues.count)
        })),
        recentBookings
      }
    });
  } catch (error) {
    console.error('Dashboard stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching dashboard statistics'
    });
  }
};

// Get revenue analytics
const getRevenueAnalytics = async (req, res) => {
  try {
    const { period = 'month' } = req.query; // day, week, month, year

    let dateFormat;
    let dateRange;

    switch (period) {
      case 'day':
        dateFormat = '%Y-%m-%d';
        dateRange = new Date(new Date().setDate(new Date().getDate() - 30));
        break;
      case 'week':
        dateFormat = '%Y-%u';
        dateRange = new Date(new Date().setMonth(new Date().getMonth() - 3));
        break;
      case 'year':
        dateFormat = '%Y';
        dateRange = new Date(new Date().setFullYear(new Date().getFullYear() - 5));
        break;
      default: // month
        dateFormat = '%Y-%m';
        dateRange = new Date(new Date().setMonth(new Date().getMonth() - 12));
    }

    const revenueData = await Booking.findAll({
      where: {
        createdAt: { [Op.gte]: dateRange },
        status: { [Op.in]: ['confirmed', 'completed'] },
        estimatedPrice: { [Op.not]: null }
      },
      attributes: [
        [sequelize.fn('DATE_FORMAT', sequelize.col('createdAt'), dateFormat), 'period'],
        [sequelize.fn('SUM', sequelize.col('estimatedPrice')), 'revenue'],
        [sequelize.fn('COUNT', sequelize.col('id')), 'bookings'],
        [sequelize.fn('AVG', sequelize.col('estimatedPrice')), 'avgValue']
      ],
      group: [sequelize.fn('DATE_FORMAT', sequelize.col('createdAt'), dateFormat)],
      order: [[sequelize.fn('DATE_FORMAT', sequelize.col('createdAt'), dateFormat), 'ASC']]
    });

    res.json({
      success: true,
      data: revenueData.map(r => ({
        period: r.dataValues.period,
        revenue: parseFloat(r.dataValues.revenue) || 0,
        bookings: parseInt(r.dataValues.bookings),
        avgValue: parseFloat(r.dataValues.avgValue) || 0
      }))
    });
  } catch (error) {
    console.error('Revenue analytics error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching revenue analytics'
    });
  }
};

// Get package performance
const getPackagePerformance = async (req, res) => {
  try {
    const packageStats = await Booking.findAll({
      where: {
        packageName: { [Op.not]: null }
      },
      attributes: [
        'packageName',
        'tierName',
        [sequelize.fn('COUNT', sequelize.col('id')), 'bookings'],
        [sequelize.fn('SUM', sequelize.col('estimatedPrice')), 'revenue'],
        [sequelize.fn('AVG', sequelize.col('guestCount')), 'avgGuests']
      ],
      group: ['packageName', 'tierName'],
      order: [[sequelize.fn('COUNT', sequelize.col('id')), 'DESC']]
    });

    res.json({
      success: true,
      data: packageStats.map(p => ({
        packageName: p.packageName,
        tierName: p.tierName,
        bookings: parseInt(p.dataValues.bookings),
        revenue: parseFloat(p.dataValues.revenue) || 0,
        avgGuests: Math.round(parseFloat(p.dataValues.avgGuests) || 0)
      }))
    });
  } catch (error) {
    console.error('Package performance error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching package performance'
    });
  }
};

module.exports = {
  getDashboardStats,
  getRevenueAnalytics,
  getPackagePerformance
};
