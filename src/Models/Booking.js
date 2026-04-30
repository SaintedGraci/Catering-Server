const { DataTypes } = require('sequelize');
const { sequelize } = require('../../config/database');

const Booking = sequelize.define('Booking', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  // Customer Information
  customerName: {
    type: DataTypes.STRING,
    allowNull: false
  },
  customerEmail: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: {
      isEmail: true
    }
  },
  customerPhone: {
    type: DataTypes.STRING,
    allowNull: false
  },
  // Event Details
  eventDate: {
    type: DataTypes.DATEONLY,
    allowNull: false
  },
  guestCount: {
    type: DataTypes.INTEGER,
    allowNull: false,
    validate: {
      min: 1
    }
  },
  venue: {
    type: DataTypes.STRING,
    allowNull: true
  },
  // Package Selection
  packageId: {
    type: DataTypes.INTEGER,
    allowNull: true,
    comment: 'Reference to Menu ID'
  },
  packageName: {
    type: DataTypes.STRING,
    allowNull: true,
    comment: 'Menu/Package name at time of booking'
  },
  tier: {
    type: DataTypes.ENUM('essential', 'signature', 'bespoke'),
    allowNull: false
  },
  tierName: {
    type: DataTypes.STRING,
    allowNull: true,
    comment: 'Tier name at time of booking'
  },
  selectedDishes: {
    type: DataTypes.JSON,
    allowNull: true,
    defaultValue: [],
    comment: 'Array of dish IDs selected by customer'
  },
  // Additional Information
  notes: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  // Status
  status: {
    type: DataTypes.ENUM('pending', 'confirmed', 'cancelled', 'completed'),
    defaultValue: 'pending'
  },
  // Pricing (optional, can be added later)
  estimatedPrice: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: true
  }
}, {
  tableName: 'bookings',
  timestamps: true
});

module.exports = Booking;
