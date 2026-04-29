const { Dish } = require('../src/Models');
const { sequelize } = require('../config/database');

async function checkDishes() {
  try {
    await sequelize.authenticate();
    
    const dishes = await Dish.findAll({
      order: [['category', 'ASC'], ['name', 'ASC']]
    });

    console.log(`\n=== TOTAL DISHES: ${dishes.length} ===\n`);

    const categories = {
      appetizer: [],
      main_course: [],
      side_dish: [],
      dessert: [],
      beverage: []
    };

    dishes.forEach(dish => {
      categories[dish.category].push(dish.name);
    });

    console.log(`APPETIZERS (${categories.appetizer.length}):`);
    categories.appetizer.forEach((name, i) => console.log(`  ${i + 1}. ${name}`));

    console.log(`\nMAIN COURSES (${categories.main_course.length}):`);
    categories.main_course.forEach((name, i) => console.log(`  ${i + 1}. ${name}`));

    console.log(`\nSIDE DISHES (${categories.side_dish.length}):`);
    categories.side_dish.forEach((name, i) => console.log(`  ${i + 1}. ${name}`));

    console.log(`\nDESSERTS (${categories.dessert.length}):`);
    categories.dessert.forEach((name, i) => console.log(`  ${i + 1}. ${name}`));

    console.log(`\nBEVERAGES (${categories.beverage.length}):`);
    categories.beverage.forEach((name, i) => console.log(`  ${i + 1}. ${name}`));

    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

checkDishes();
