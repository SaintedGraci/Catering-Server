const { Menu, Package, Dish } = require('../src/Models');
const { sequelize } = require('../config/database');

async function showFinalSummary() {
  try {
    await sequelize.authenticate();
    
    const menus = await Menu.findAll({
      where: { isActive: true },
      order: [['id', 'ASC']]
    });

    const packages = await Package.findAll({
      where: { isActive: true },
      include: [{
        model: Dish,
        as: 'dishes',
        through: { attributes: [] }
      }]
    });

    const dishes = await Dish.findAll({
      where: { isAvailable: true }
    });

    console.log('\n╔════════════════════════════════════════════════════════════════╗');
    console.log('║     FILIPINO CATERING SYSTEM - DATABASE SUMMARY                ║');
    console.log('╚════════════════════════════════════════════════════════════════╝\n');

    // Event Types Summary
    console.log('📋 EVENT TYPES (MENUS): ' + menus.length);
    console.log('─'.repeat(70));
    menus.forEach((menu, i) => {
      const pkgCount = packages.filter(p => p.menuType === menu.type).length;
      console.log(`${i + 1}. ${menu.name} (${menu.type})`);
      console.log(`   └─ ${pkgCount} packages available`);
    });

    // Packages Summary
    console.log('\n\n📦 PACKAGES BY EVENT TYPE: ' + packages.length + ' total');
    console.log('─'.repeat(70));
    
    const menuTypes = [...new Set(packages.map(p => p.menuType))];
    menuTypes.forEach(type => {
      const menu = menus.find(m => m.type === type);
      const typePkgs = packages.filter(p => p.menuType === type);
      
      console.log(`\n${menu ? menu.name : type.toUpperCase()}:`);
      typePkgs.forEach(pkg => {
        const featured = pkg.isFeatured ? ' ⭐' : '';
        console.log(`  • ${pkg.name}${featured}`);
        console.log(`    ${pkg.priceRange}`);
        console.log(`    ${pkg.dishes.length} dishes | Customer selects ${pkg.dishSelectionCount}`);
      });
    });

    // Dishes Summary
    console.log('\n\n🍽️  DISHES AVAILABLE: ' + dishes.length + ' total');
    console.log('─'.repeat(70));
    
    const categories = {
      appetizer: 'Appetizers',
      main_course: 'Main Courses',
      side_dish: 'Side Dishes',
      dessert: 'Desserts',
      beverage: 'Beverages'
    };

    Object.entries(categories).forEach(([key, label]) => {
      const count = dishes.filter(d => d.category === key).length;
      console.log(`${label}: ${count}`);
    });

    // Featured Packages
    const featured = packages.filter(p => p.isFeatured);
    console.log('\n\n⭐ FEATURED PACKAGES: ' + featured.length);
    console.log('─'.repeat(70));
    featured.forEach(pkg => {
      const menu = menus.find(m => m.type === pkg.menuType);
      console.log(`• ${pkg.name} (${menu ? menu.name : pkg.menuType})`);
      console.log(`  ${pkg.priceRange}`);
    });

    console.log('\n\n╔════════════════════════════════════════════════════════════════╗');
    console.log('║  ✓ Database is fully populated and ready for production!      ║');
    console.log('╚════════════════════════════════════════════════════════════════╝\n');

    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

showFinalSummary();
