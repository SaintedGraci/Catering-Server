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
  websiteName: {
    type: DataTypes.STRING,
    allowNull: true,
    defaultValue: 'Filipino Catering',
    comment: 'Website name/title shown in browser tab and header'
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
  favicon: {
    type: DataTypes.STRING,
    allowNull: true,
    comment: 'Favicon image path'
  },
  
  // Hero Section
  heroTitle: {
    type: DataTypes.STRING,
    allowNull: true,
    defaultValue: 'Authentic Filipino Catering',
    comment: 'Main hero section title'
  },
  heroSubtitle: {
    type: DataTypes.TEXT,
    allowNull: true,
    defaultValue: 'Bringing the flavors of the Philippines to your special events',
    comment: 'Hero section subtitle'
  },
  heroCtaText: {
    type: DataTypes.STRING,
    allowNull: true,
    defaultValue: 'Book Your Event',
    comment: 'Hero call-to-action button text'
  },
  heroImage: {
    type: DataTypes.STRING,
    allowNull: true,
    comment: 'Hero section background image'
  },
  
  // About Section
  aboutTitle: {
    type: DataTypes.STRING,
    allowNull: true,
    defaultValue: 'About Us',
    comment: 'About section title'
  },
  aboutContent: {
    type: DataTypes.TEXT,
    allowNull: true,
    comment: 'About section content'
  },
  
  // Footer
  footerText: {
    type: DataTypes.TEXT,
    allowNull: true,
    comment: 'Footer copyright/description text'
  },
  footerLinks: {
    type: DataTypes.JSON,
    allowNull: true,
    defaultValue: [],
    comment: 'Footer navigation links'
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
  whatsapp: {
    type: DataTypes.STRING,
    allowNull: true,
    comment: 'WhatsApp number for quick contact'
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
  linkedinUrl: {
    type: DataTypes.STRING,
    allowNull: true,
    comment: 'LinkedIn profile URL'
  },
  youtubeUrl: {
    type: DataTypes.STRING,
    allowNull: true,
    comment: 'YouTube channel URL'
  },
  tiktokUrl: {
    type: DataTypes.STRING,
    allowNull: true,
    comment: 'TikTok profile URL'
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
  bookingLeadTimeDays: {
    type: DataTypes.INTEGER,
    defaultValue: 7,
    comment: 'Minimum days in advance for bookings'
  },
  cancellationPolicy: {
    type: DataTypes.TEXT,
    allowNull: true,
    comment: 'Cancellation policy text'
  },
  termsAndConditions: {
    type: DataTypes.TEXT,
    allowNull: true,
    comment: 'Terms and conditions text'
  },
  privacyPolicy: {
    type: DataTypes.TEXT,
    allowNull: true,
    comment: 'Privacy policy text'
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
  },
  
  // Email Notifications
  notificationEmail: {
    type: DataTypes.STRING,
    allowNull: true,
    comment: 'Email to receive booking notifications'
  },
  emailNotificationsEnabled: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
    comment: 'Enable email notifications for new bookings'
  },
  
  // Theme/Branding
  primaryColor: {
    type: DataTypes.STRING,
    defaultValue: '#D97706',
    comment: 'Primary brand color (hex)'
  },
  secondaryColor: {
    type: DataTypes.STRING,
    defaultValue: '#059669',
    comment: 'Secondary brand color (hex)'
  },
  fontFamily: {
    type: DataTypes.STRING,
    defaultValue: 'Inter',
    comment: 'Website font family'
  }
}, {
  tableName: 'settings',
  timestamps: true
});

module.exports = Settings;
