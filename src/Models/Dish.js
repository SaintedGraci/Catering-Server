const { DataTypes } = require('sequelize');
const { sequelize } = require('../../config/database');

const Dish = sequelize.define('Dish', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  price: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: true,
    comment: 'DEPRECATED - Price is now at package level only'
  },
  category: {
    type: DataTypes.ENUM('appetizer', 'main_course', 'dessert', 'beverage', 'side_dish'),
    allowNull: false
  },
  image: {
    type: DataTypes.STRING,
    allowNull: true
  },
  isAvailable: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  },
  servingSize: {
    type: DataTypes.STRING,
    allowNull: true,
    comment: 'e.g., "Serves 10-15 people"'
  },
  preparationTime: {
    type: DataTypes.INTEGER,
    allowNull: true,
    comment: 'Time in minutes'
  }
}, {
  tableName: 'dishes',
  timestamps: true
});

module.exports = Dish;
