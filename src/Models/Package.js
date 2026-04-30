const { DataTypes } = require('sequelize');
const { sequelize } = require('../../config/database');

const Package = sequelize.define('Package', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
    comment: 'e.g., "Bahay Kubo", "Salu-Salo", "Handaan ng Hari"'
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  menuType: {
    type: DataTypes.STRING,
    allowNull: false,
    comment: 'Links to menu type: wedding, corporate, private, birthday, custom'
  },
  priceRange: {
    type: DataTypes.STRING,
    allowNull: false,
    comment: 'e.g., "₱850 – ₱1,500 / guest"'
  },
  minPrice: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: true,
    comment: 'Minimum price per guest'
  },
  maxPrice: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: true,
    comment: 'Maximum price per guest'
  },
  includes: {
    type: DataTypes.JSON,
    allowNull: false,
    defaultValue: [],
    comment: 'Array of included items/features'
  },
  dishSelectionCount: {
    type: DataTypes.INTEGER,
    allowNull: true,
    comment: 'DEPRECATED: Use dishSelectionRules instead. Number of dishes customer can select'
  },
  dishSelectionRules: {
    type: DataTypes.JSON,
    allowNull: true,
    defaultValue: null,
    comment: 'Category-specific dish selection rules, e.g., {"main_course": 2, "appetizer": 2, "beverage": 1}'
  },
  isFeatured: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
    comment: 'Featured packages show "Most chosen" badge'
  },
  isActive: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  }
}, {
  tableName: 'packages',
  timestamps: true
});

module.exports = Package;
