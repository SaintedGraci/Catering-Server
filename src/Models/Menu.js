const { DataTypes } = require('sequelize');
const { sequelize } = require('../../config/database');

const Menu = sequelize.define('Menu', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
    comment: 'Event type name (e.g., Wedding, Corporate, Birthday)'
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true,
    comment: 'Brief description of the event type'
  },
  type: {
    type: DataTypes.ENUM('wedding', 'corporate', 'birthday', 'private', 'custom'),
    allowNull: false,
    defaultValue: 'custom',
    comment: 'Event type identifier'
  },
  isActive: {   
    type: DataTypes.BOOLEAN,
    defaultValue: true
  },
  image: {
    type: DataTypes.STRING,
    allowNull: true,
    comment: 'Image for the event type'
  }
}, {
  tableName: 'menus',
  timestamps: true
});

module.exports = Menu;
