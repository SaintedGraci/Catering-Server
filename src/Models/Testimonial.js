const { DataTypes } = require('sequelize');
const { sequelize } = require('../../config/database');

const Testimonial = sequelize.define('Testimonial', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  customerName: {
    type: DataTypes.STRING,
    allowNull: false
  },
  customerRole: {
    type: DataTypes.STRING,
    allowNull: true,
    comment: 'e.g., "Bride", "Event Coordinator", "CEO"'
  },
  content: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  rating: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 5,
    validate: {
      min: 1,
      max: 5
    }
  },
  eventType: {
    type: DataTypes.STRING,
    allowNull: true,
    comment: 'e.g., "Wedding", "Corporate Event"'
  },
  image: {
    type: DataTypes.STRING,
    allowNull: true,
    comment: 'Customer photo URL'
  },
  isActive: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
    comment: 'Whether to display on website'
  },
  isFeatured: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
    comment: 'Featured testimonials appear first'
  },
  sortOrder: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
    comment: 'Display order (lower numbers first)'
  }
}, {
  tableName: 'testimonials',
  timestamps: true
});

module.exports = Testimonial;
