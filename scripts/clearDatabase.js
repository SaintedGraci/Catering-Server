const { sequelize } = require('../config/database');
const { 
  Dish, 
  Menu, 
  Package, 
  PackageDish, 
  Booking, 
  Testimonial,
  Settings,
  User
} = require('../src/Models');

async function clearDatabase() {
  try {
    console.log('Connecting to database...');
    await sequelize.authenticate();
    console.log('✓ Database connection established.\n');

    console.log('Clearing all data...\n');

    // Delete in order to respect foreign key constraints
    await PackageDish.destroy({ where: {}, force: true });
    console.log('✓ Cleared PackageDish');

    await Booking.destroy({ where: {}, force: true });
    console.log('✓ Cleared Bookings');

    await Package.destroy({ where: {}, force: true });
    console.log('✓ Cleared Packages');

    await Menu.destroy({ where: {}, force: true });
    console.log('✓ Cleared Menus');

    await Dish.destroy({ where: {}, force: true });
    console.log('✓ Cleared Dishes');

    await Testimonial.destroy({ where: {}, force: true });
    console.log('✓ Cleared Testimonials');

    // Don't delete Settings or Users (keep admin accounts)
    console.log('✓ Kept Settings and Users intact');

    console.log('\n=== DATABASE CLEARED ===');
    console.log('All data removed except Users and Settings\n');

    process.exit(0);
  } catch (error) {
    console.error('Error clearing database:', error);
    process.exit(1);
  }
}

clearDatabase();
