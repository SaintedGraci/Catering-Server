const { sequelize } = require('../../config/database');

// Import all models here
const User = require('./User');
const Dish = require('./Dish');
const Menu = require('./Menu');
const Booking = require('./Booking');
const Testimonial = require('./Testimonial');
const Package = require('./Package');
const PackageDish = require('./PackageDish');
const Settings = require('./Settings');

const models = {
  User,
  Dish,
  Menu,
  Booking,
  Testimonial,
  Package,
  PackageDish,
  Settings,
};

// Setup associations
// Package has many Dishes through PackageDish
Package.belongsToMany(Dish, { 
  through: PackageDish, 
  foreignKey: 'packageId',
  as: 'dishes'
});

Dish.belongsToMany(Package, { 
  through: PackageDish, 
  foreignKey: 'dishId',
  as: 'packages'
});

// Direct associations for easier querying
Package.hasMany(PackageDish, { foreignKey: 'packageId', as: 'packageDishes' });
PackageDish.belongsTo(Package, { foreignKey: 'packageId' });
PackageDish.belongsTo(Dish, { foreignKey: 'dishId' });

// Booking associations
Booking.belongsTo(Menu, { foreignKey: 'packageId', as: 'package' });

// Setup other associations if any
Object.values(models).forEach(model => {
  if (model.associate) {
    model.associate(models);
  }
});

module.exports = {
  sequelize,
  ...models
};
