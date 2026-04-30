const { sequelize } = require('../config/database');

async function fixBookingSchema() {
  try {
    console.log('Connecting to database...');
    await sequelize.authenticate();
    console.log('Connected successfully.');

    console.log('Fixing bookings table schema...');
    
    // Drop the foreign key constraint
    try {
      await sequelize.query(`
        ALTER TABLE bookings 
        DROP FOREIGN KEY bookings_ibfk_1;
      `);
      console.log('✓ Removed foreign key constraint on packageId');
    } catch (error) {
      console.log('Note: Foreign key constraint may not exist or already removed');
    }

    // Make packageName nullable
    await sequelize.query(`
      ALTER TABLE bookings 
      MODIFY COLUMN packageName VARCHAR(255) NULL;
    `);
    console.log('✓ packageName is now nullable');

    // Make tierName nullable
    await sequelize.query(`
      ALTER TABLE bookings 
      MODIFY COLUMN tierName VARCHAR(255) NULL;
    `);
    console.log('✓ tierName is now nullable');

    console.log('\n✓ Schema update completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Error updating schema:', error);
    process.exit(1);
  }
}

fixBookingSchema();
