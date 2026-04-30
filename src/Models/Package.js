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
  estimatedPrice: {
    type: DataTypes.STRING,
    allowNull: false,
    comment: 'Total package price range (e.g., "₱150 - ₱1000", "₱50,000")'
  },
  goodForPax: {
    type: DataTypes.INTEGER,
    allowNull: false,
    comment: 'Number of people this package is good for (e.g., 90, 50, 100)'
  },
  includes: {
    type: DataTypes.JSON,
    allowNull: false,
    defaultValue: [],
    comment: 'Array of included items/features'
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
