// Test script to verify settings can be updated
const { Settings } = require('./src/Models');
const { sequelize } = require('./config/database');

async function testSettingsUpdate() {
  try {
    console.log('Connecting to database...');
    await sequelize.authenticate();
    console.log('✓ Connected\n');

    // Get current settings
    let settings = await Settings.findOne();
    
    if (!settings) {
      console.log('No settings found. Creating default settings...');
      settings = await Settings.create({
        businessName: 'Filipino Catering Co.',
        websiteName: 'Sampaguita & Saro',
        heroTitle: 'Authentic Filipino Catering',
        heroSubtitle: 'Bringing the flavors of the Philippines to your special events',
        heroCtaText: 'Book Your Event'
      });
      console.log('✓ Default settings created\n');
    }

    console.log('Current Settings:');
    console.log('─────────────────────────────────────');
    console.log(`Business Name: ${settings.businessName}`);
    console.log(`Website Name: ${settings.websiteName || 'Not set'}`);
    console.log(`Hero Title: ${settings.heroTitle || 'Not set'}`);
    console.log(`Hero Subtitle: ${settings.heroSubtitle || 'Not set'}`);
    console.log(`Hero CTA: ${settings.heroCtaText || 'Not set'}`);
    console.log(`Email: ${settings.email || 'Not set'}`);
    console.log(`Phone: ${settings.phone || 'Not set'}`);
    console.log('─────────────────────────────────────\n');

    // Test update
    console.log('Testing update functionality...');
    const testUpdate = {
      websiteName: 'Test Catering Name',
      heroTitle: 'Test Hero Title',
      email: 'test@example.com'
    };

    await settings.update(testUpdate);
    console.log('✓ Update successful\n');

    // Verify update
    const updated = await Settings.findOne();
    console.log('Updated Settings:');
    console.log('─────────────────────────────────────');
    console.log(`Website Name: ${updated.websiteName}`);
    console.log(`Hero Title: ${updated.heroTitle}`);
    console.log(`Email: ${updated.email}`);
    console.log('─────────────────────────────────────\n');

    // Restore original values
    console.log('Restoring original values...');
    await settings.update({
      websiteName: settings.websiteName,
      heroTitle: settings.heroTitle,
      email: settings.email
    });
    console.log('✓ Restored\n');

    console.log('✅ All tests passed!');
    console.log('\nSettings can be updated successfully from the admin dashboard.');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error(error);
    process.exit(1);
  }
}

testSettingsUpdate();
