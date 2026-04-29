const { Menu } = require('../src/Models');
const { sequelize } = require('../config/database');

const menus = [
  {
    name: "Wedding Package",
    description: "Elegant catering for your special day with premium dishes and presentation",
    type: "wedding",
    isActive: true
  },
  {
    name: "Corporate Events",
    description: "Professional catering for business meetings, conferences, and corporate gatherings",
    type: "corporate",
    isActive: true
  },
  {
    name: "Birthday Celebration",
    description: "Fun and festive menu options perfect for birthday parties of all ages",
    type: "birthday",
    isActive: true
  },
  {
    name: "Private Events",
    description: "Customized menu for private gatherings, family reunions, and intimate celebrations",
    type: "private",
    isActive: true
  },
  {
    name: "Custom Package",
    description: "Build your own menu with our wide selection of Filipino dishes",
    type: "custom",
    isActive: true
  }
];

async function seedMenus() {
  try {
    console.log('Connecting to database...');
    await sequelize.authenticate();
    console.log('✓ Database connection established.\n');

    console.log('Creating menus...\n');

    let created = 0;
    let errors = 0;

    for (const menuData of menus) {
      try {
        await Menu.create(menuData);
        console.log(`✓ Created: ${menuData.name}`);
        created++;
      } catch (error) {
        console.error(`✗ Error creating ${menuData.name}:`, error.message);
        errors++;
      }
    }

    console.log('\n=== SEEDING COMPLETE ===');
    console.log(`Total menus: ${menus.length}`);
    console.log(`Successfully created: ${created}`);
    console.log(`Errors: ${errors}\n`);

    process.exit(0);
  } catch (error) {
    console.error('Error seeding menus:', error);
    process.exit(1);
  }
}

seedMenus();
