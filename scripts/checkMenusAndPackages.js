const { Menu, Package, Dish, PackageDish } = require('../src/Models');
const { sequelize } = require('../config/database');

async function checkMenusAndPackages() {
  try {
    await sequelize.authenticate();
    
    const menus = await Menu.findAll({
      order: [['id', 'ASC']]
    });

    console.log(`\n=== TOTAL MENUS: ${menus.length} ===\n`);

    for (const menu of menus) {
      console.log(`\n📋 ${menu.name.toUpperCase()}`);
      console.log(`   Type: ${menu.type}`);
      console.log(`   Status: ${menu.isActive ? '✓ Active' : '✗ Inactive'}`);
      console.log(`   Description: ${menu.description}`);

      const packages = await Package.findAll({
        where: { menuType: menu.type },
        include: [{
          model: Dish,
          as: 'dishes',
          through: { attributes: [] }
        }],
        order: [['isFeatured', 'DESC'], ['name', 'ASC']]
      });

      console.log(`\n   PACKAGES (${packages.length}):`);
      
      for (const pkg of packages) {
        const featured = pkg.isFeatured ? '⭐ FEATURED' : '';
        const status = pkg.isActive ? '✓' : '✗';
        console.log(`\n   ${status} ${pkg.name} ${featured}`);
        console.log(`      Price: ${pkg.priceRange}`);
        console.log(`      Dishes: ${pkg.dishes.length} available, customer selects ${pkg.dishSelectionCount}`);
        console.log(`      Includes:`);
        pkg.includes.forEach(item => console.log(`        • ${item}`));
      }
      console.log('\n   ' + '─'.repeat(80));
    }

    // Summary
    const totalPackages = await Package.count();
    const featuredPackages = await Package.count({ where: { isFeatured: true } });
    const totalDishes = await Dish.count();

    console.log('\n\n=== SUMMARY ===');
    console.log(`Total Event Types (Menus): ${menus.length}`);
    console.log(`Total Packages: ${totalPackages}`);
    console.log(`Featured Packages: ${featuredPackages}`);
    console.log(`Total Dishes Available: ${totalDishes}`);

    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

checkMenusAndPackages();
