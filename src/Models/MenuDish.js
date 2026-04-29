const { DataTypes } = require('sequelize');
const { sequelize } = require('../../config/database');

const MenuDish = sequelize.define('MenuDish', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  quantity: {
    type: DataTypes.INTEGER,
    defaultValue: 1,
    comment: 'Number of servings of this dish in the menu'
  },
  category: {
    type: DataTypes.STRING,
    allowNull: true,
    comment: 'Category within the menu (e.g., starter, main, dessert)'
  },
  sortOrder: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
    comment: 'Display order in the menu'
  }
}, {
  tableName: 'menu_dishes',
  timestamps: true
});

module.exports = MenuDish;
