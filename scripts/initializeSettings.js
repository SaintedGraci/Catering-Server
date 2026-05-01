const { Settings } = require('../src/Models');
const { sequelize } = require('../config/database');

async function initializeSettings() {
  try {
    await sequelize.authenticate();
    console.log('Database connected.\n');

    // Check if settings already exist
    const existing = await Settings.findOne();
    
    if (existing) {
      console.log('Settings already exist:');
      console.log(`Business Name: ${existing.businessName}`);
      console.log(`Email: ${existing.email || 'Not set'}`);
      console.log(`Phone: ${existing.phone || 'Not set'}`);
      console.log('\nTo update settings, use the admin dashboard.');
      process.exit(0);
    }

    // Create default settings
    const settings = await Settings.create({
      businessName: 'Filipino Catering Co.',
      websiteName: 'Sampaguita & Saro',
      tagline: 'Authentic Filipino cuisine for your special events',
      description: 'We bring the authentic taste of Filipino cuisine to your special occasions. From intimate gatherings to grand celebrations, our experienced team delivers exceptional catering services with traditional recipes passed down through generations.',
      heroTitle: 'Authentic Filipino Catering',
      heroSubtitle: 'Bringing the flavors of the Philippines to your special events',
      heroCtaText: 'Book Your Event',
      aboutTitle: 'About Us',
      aboutContent: 'We are passionate about sharing the rich culinary heritage of the Philippines through our catering services.',
      email: 'info@filipinocatering.com',
      phone: '+63 912 345 6789',
      address: 'Manila, Philippines',
      businessHours: {
        monday: '9:00 AM - 6:00 PM',
        tuesday: '9:00 AM - 6:00 PM',
        wednesday: '9:00 AM - 6:00 PM',
        thursday: '9:00 AM - 6:00 PM',
        friday: '9:00 AM - 6:00 PM',
        saturday: '10:00 AM - 4:00 PM',
        sunday: 'Closed'
      },
      maintenanceMode: false,
      allowBookings: true,
      minGuestsDefault: 20,
      maxGuestsDefault: 500,
      bookingLeadTimeDays: 7,
      metaTitle: 'Filipino Catering - Authentic Cuisine for Your Events',
      metaDescription: 'Professional Filipino catering services for weddings, corporate events, birthdays, and special occasions. Authentic recipes, exceptional service.',
      metaKeywords: 'filipino catering, wedding catering, corporate catering, manila catering, authentic filipino food, event catering',
      currency: 'PHP',
      currencySymbol: '₱',
      timezone: 'Asia/Manila',
      primaryColor: '#D97706',
      secondaryColor: '#059669',
      emailNotificationsEnabled: true
    });

    console.log('✓ Default settings created successfully!\n');
    console.log('Settings:');
    console.log(`Business Name: ${settings.businessName}`);
    console.log(`Tagline: ${settings.tagline}`);
    console.log(`Email: ${settings.email}`);
    console.log(`Phone: ${settings.phone}`);
    console.log(`Currency: ${settings.currencySymbol} (${settings.currency})`);
    console.log(`Bookings Enabled: ${settings.allowBookings ? 'Yes' : 'No'}`);
    console.log('\nYou can update these settings in the admin dashboard.');

    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

initializeSettings();
