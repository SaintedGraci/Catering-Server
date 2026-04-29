require('dotenv').config();
const { Dish } = require('./src/Models');
const { connectDB } = require('./config/database');

async function createTestDish() {
  try {
    await connectDB();
    
    const dish = await Dish.create({
      name: 'Test Adobo',
      description: 'Classic Filipino chicken adobo',
      category: 'main_course',
      isAvailable: true,
      servingSize: 'Serves 8-10 people',
      preparationTime: 45
    });

    console.log('✅ Dish created successfully!');
    console.log('Dish ID:', dish.id);
    console.log('Dish Name:', dish.name);
    console.log('Category:', dish.category);
    console.log('Price field:', dish.price); // Should be null
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error creating dish:', error.message);
    console.error('Full error:', error);
    process.exit(1);
  }
}

createTestDish();
