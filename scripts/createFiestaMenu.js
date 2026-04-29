const { Menu } = require('../src/Models');
const { sequelize } = require('../config/database');

async function createFiestaMenu() {
  try {
    await sequelize.authenticate();
    
    const menu = await Menu.create({
      name: "Fiesta & Community Events",
      description: "Large-scale catering for barangay fiestas, town celebrations, and community gatherings. Authentic Filipino flavors for the whole community.",
      type: "custom",
      isActive: true
    });

    console.log(`✓ Created menu: ${menu.name} (ID: ${menu.id})`);
    process.exit(0);
  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
}

createFiestaMenu();
