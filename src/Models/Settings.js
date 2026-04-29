const { DataTypes } = require('sequelize');
const { sequelize } = require('../../config/database');

const Settings = sequelize.define('Settings', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  // Business Information
  businessName: {
    type: DataTypes.STRING,
    allowNull: false,
    defaultValue: 'Filipino Catering Co.',
    comment: 'Business name displayed on the website'
  },
  tagline: {
    type: DataTypes.STRING,
    allowNull: true,
    comment: 'Business tagline or slogan'
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true,
    comment: 'About the business'
  },
  logo: {
    type: DataTypes.STRING,
    allowNull: true,
    comment: 'Logo image path'
  },
  
  // Contact Information
  email: {
    type: DataTypes.STRING,
    allowNull: true,
    comment: 'Business email address'
  },
  phone: {
    type: DataTypes.STRING,
    allowNull: true,
    comment: 'Business phone number'
  },
  address: {
    type: DataTypes.TEXT,
    allowNull: true,
    comment: 'Business physical address'
  },
  
  // Social Media
  facebookUrl: {
    type: DataTypes.STRING,
    allowNull: true,
    comment: 'Facebook page URL'
  },
  instagramUrl: {
    type: DataTypes.STRING,
    allowNull: true,
    comment: 'Instagram profile URL'
  },
  twitterUrl: {
    type: DataTypes.STRING,
    allowNull: true,
    comment: 'Twitter profile URL'
  },
  
  // Business Hours
  businessHours: {
    type: DataTypes.JSON,
    allowNull: true,
    defaultValue: {
      monday: '9:00 AM - 6:00 PM',
      tuesday: '9:00 AM - 6:00 PM',
      wednesday: '9:00 AM - 6:00 PM',
      thursday: '9:00 AM - 6:00 PM',
      friday: '9:00 AM - 6:00 PM',
      saturday: '10:00 AM - 4:00 PM',
      sunday: 'Closed'
    },
    comment: 'Business operating hours'
  },
  
  // Website Settings
  maintenanceMode: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
    comment: 'Enable maintenance mode'
  },
  allowBookings: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
    comment: 'Allow customers to make bookings'
  },
  minGuestsDefault: {
    type: DataTypes.INTEGER,
    defaultValue: 20,
    comment: 'Default minimum guest count'
  },
  maxGuestsDefault: {
    type: DataTypes.INTEGER,
    defaultValue: 500,
    comment: 'Default maximum guest count'
  },
  
  // SEO
  metaTitle: {
    type: DataTypes.STRING,
    allowNull: true,
    comment: 'SEO meta title'
  },
  metaDescription: {
    type: DataTypes.TEXT,
    allowNull: true,
    comment: 'SEO meta description'
  },
  metaKeywords: {
    type: DataTypes.TEXT,
    allowNull: true,
    comment: 'SEO meta keywords'
  },
  
  // Additional Settings
  currency: {
    type: DataTypes.STRING,
    defaultValue: 'PHP',
    comment: 'Currency code (PHP, USD, etc.)'
  },
  currencySymbol: {
    type: DataTypes.STRING,
    defaultValue: '₱',
    comment: 'Currency symbol'
  },
  timezone: {
    type: DataTypes.STRING,
    defaultValue: 'Asia/Manila',
    comment: 'Business timezone'
  }
}, {
  tableName: 'settings',
  timestamps: true
});

module.exports = Settings;
