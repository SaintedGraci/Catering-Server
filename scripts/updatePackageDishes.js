const { Package, Dish, PackageDish } = require('../src/Models');
const { sequelize } = require('../config/database');

async function updatePackageDishes() {
  try {
    await sequelize.authenticate();
    console.log('Database connected.\n');

    const packages = await Package.findAll({
      include: [{
        model: Dish,
        as: 'dishes',
        through: { attributes: [] }
      }]
    });

    const allDishes = await Dish.findAll({ where: { isAvailable: true } });
    console.log(`Found ${allDishes.length} available dishes\n`);

    // Helper function to get dishes by category
    const getDishesByCategory = (category, count) => {
      const categoryDishes = allDishes.filter(d => d.category === category);
      const shuffled = categoryDishes.sort(() => 0.5 - Math.random());
      return shuffled.slice(0, Math.min(count, categoryDishes.length));
    };

    console.log('=== UPDATING PACKAGE DISHES ===\n');

    for (const pkg of packages) {
      try {
        // Clear existing dishes
        await PackageDish.destroy({ where: { packageId: pkg.id } });

        const dishSelectionCount = pkg.dishSelectionCount || 5;
        
        // Assign MORE dishes than the customer needs to select
        // This gives them choices!
        let dishesToAssign = [];
        
        if (dishSelectionCount <= 4) {
          // Small package: customer selects 4, we offer 10-12 dishes
          dishesToAssign = [
            ...getDishesByCategory('appetizer', 2),
            ...getDishesByCategory('main_course', 6),
            ...getDishesByCategory('side_dish', 2),
            ...getDishesByCategory('dessert', 2)
          ];
        } else if (dishSelectionCount <= 6) {
          // Medium package: customer selects 5-6, we offer 15-18 dishes
          dishesToAssign = [
            ...getDishesByCategory('appetizer', 3),
            ...getDishesByCategory('main_course', 8),
            ...getDishesByCategory('side_dish', 3),
            ...getDishesByCategory('dessert', 3),
            ...getDishesByCategory('beverage', 1)
          ];
        } else if (dishSelectionCount <= 8) {
          // Large package: customer selects 7-8, we offer 20-25 dishes
          dishesToAssign = [
            ...getDishesByCategory('appetizer', 4),
            ...getDishesByCategory('main_course', 12),
            ...getDishesByCategory('side_dish', 4),
            ...getDishesByCategory('dessert', 4),
            ...getDishesByCategory('beverage', 2)
          ];
        } else {
          // Extra large package: customer selects 10+, we offer 30+ dishes
          dishesToAssign = [
            ...getDishesByCategory('appetizer', 5),
            ...getDishesByCategory('main_course', 15),
            ...getDishesByCategory('side_dish', 5),
            ...getDishesByCategory('dessert', 5),
            ...getDishesByCategory('beverage', 3)
          ];
        }

        // Remove duplicates (in case we got the same dish twice)
        const uniqueDishes = Array.from(new Set(dishesToAssign.map(d => d.id)))
          .map(id => dishesToAssign.find(d => d.id === id))
          .filter(Boolean);

        // Create PackageDish associations
        for (let i = 0; i < uniqueDishes.length; i++) {
          await PackageDish.create({
            packageId: pkg.id,
            dishId: uniqueDishes[i].id,
            sortOrder: i
          });
        }

        console.log(`✓ ${pkg.name}`);
        console.log(`  Customer selects: ${dishSelectionCount} dishes`);
        console.log(`  Available to choose from: ${uniqueDishes.length} dishes`);
        console.log(`  Breakdown:`);
        console.log(`    - Appetizers: ${uniqueDishes.filter(d => d.category === 'appetizer').length}`);
        console.log(`    - Main Courses: ${uniqueDishes.filter(d => d.category === 'main_course').length}`);
        console.log(`    - Side Dishes: ${uniqueDishes.filter(d => d.category === 'side_dish').length}`);
        console.log(`    - Desserts: ${uniqueDishes.filter(d => d.category === 'dessert').length}`);
        console.log(`    - Beverages: ${uniqueDishes.filter(d => d.category === 'beverage').length}`);
        console.log('');

      } catch (error) {
        console.error(`✗ Failed to update ${pkg.name}:`, error.message);
      }
    }

    console.log('\n=== UPDATE COMPLETE ===');
    console.log(`Total packages updated: ${packages.length}`);
    
    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

updatePackageDishes();
