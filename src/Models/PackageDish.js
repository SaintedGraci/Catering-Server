const { DataTypes } = require('sequelize');
const { sequelize } = require('../../config/database');

const PackageDish = sequelize.define('PackageDish', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  packageId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'packages',
      key: 'id'
    }
  },
  dishId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'dishes',
      key: 'id'
    }
  },
  category: {
    type: DataTypes.STRING,
    allowNull: true,
    comment: 'Category grouping for the dish in this package (e.g., appetizer, main, dessert)'
  },
  sortOrder: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
    comment: 'Display order within the package'
  }
}, {
  tableName: 'package_dishes',
  timestamps: true
});

module.exports = PackageDish;
