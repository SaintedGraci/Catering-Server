const { Dish } = require('../src/Models');
const { sequelize } = require('../config/database');

const filipinoDishes = [
  // APPETIZERS
  {
    name: "Lumpiang Shanghai",
    description: "Crispy spring rolls filled with seasoned ground pork and vegetables, served with sweet and sour sauce",
    category: "appetizer",
    servingSize: "50 pieces per tray",
    preparationTime: 45,
    isAvailable: true
  },
  {
    name: "Dynamite Lumpia",
    description: "Spicy cheese-stuffed green chili peppers wrapped in spring roll wrapper, deep-fried to perfection",
    category: "appetizer",
    servingSize: "40 pieces per tray",
    preparationTime: 40,
    isAvailable: true
  },
  {
    name: "Fresh Lumpia (Ubod)",
    description: "Fresh spring rolls with heart of palm, vegetables, and shrimp, topped with sweet peanut sauce",
    category: "appetizer",
    servingSize: "30 pieces per tray",
    preparationTime: 35,
    isAvailable: true
  },
  {
    name: "Chicken Empanada",
    description: "Flaky pastry filled with savory chicken, potatoes, carrots, and raisins",
    category: "appetizer",
    servingSize: "40 pieces per tray",
    preparationTime: 50,
    isAvailable: true
  },
  {
    name: "Ukoy (Shrimp Fritters)",
    description: "Crispy vegetable and shrimp fritters served with spiced vinegar dipping sauce",
    category: "appetizer",
    servingSize: "40 pieces per tray",
    preparationTime: 30,
    isAvailable: true
  },
  {
    name: "Tokwa't Baboy",
    description: "Crispy fried tofu and tender pork belly in tangy soy-vinegar sauce with onions and chili",
    category: "appetizer",
    servingSize: "Serves 15-20 people",
    preparationTime: 40,
    isAvailable: true
  },
  {
    name: "Kilawin na Tanigue",
    description: "Fresh Spanish mackerel ceviche marinated in vinegar, calamansi, ginger, and chili",
    category: "appetizer",
    servingSize: "Serves 15-20 people",
    preparationTime: 25,
    isAvailable: true
  },

  // MAIN COURSES - PORK
  {
    name: "Lechon Kawali",
    description: "Crispy deep-fried pork belly with tender meat inside, served with lechon sauce or liver sauce",
    category: "main_course",
    servingSize: "Serves 15-20 people",
    preparationTime: 90,
    isAvailable: true
  },
  {
    name: "Crispy Pata",
    description: "Deep-fried pork knuckle with ultra-crispy skin and tender meat, served with soy-vinegar dip",
    category: "main_course",
    servingSize: "2-3 pieces per tray",
    preparationTime: 120,
    isAvailable: true
  },
  {
    name: "Pork Adobo",
    description: "Classic Filipino braised pork in soy sauce, vinegar, garlic, and bay leaves",
    category: "main_course",
    servingSize: "Serves 15-20 people",
    preparationTime: 60,
    isAvailable: true
  },
  {
    name: "Pork Menudo",
    description: "Savory pork stew with liver, potatoes, carrots, and bell peppers in tomato sauce",
    category: "main_course",
    servingSize: "Serves 15-20 people",
    preparationTime: 50,
    isAvailable: true
  },
  {
    name: "Pork Hamonado",
    description: "Sweet and savory pork in pineapple sauce with a hint of soy and brown sugar",
    category: "main_course",
    servingSize: "Serves 15-20 people",
    preparationTime: 55,
    isAvailable: true
  },
  {
    name: "Lechon Belly Roll",
    description: "Boneless pork belly stuffed with lemongrass and spices, roasted until crispy",
    category: "main_course",
    servingSize: "Serves 15-20 people",
    preparationTime: 180,
    isAvailable: true
  },
  {
    name: "Pork Sisig",
    description: "Sizzling chopped pork face and ears with onions, chili, and calamansi on a hot plate",
    category: "main_course",
    servingSize: "Serves 15-20 people",
    preparationTime: 45,
    isAvailable: true
  },
  {
    name: "Pork Barbecue",
    description: "Grilled marinated pork skewers with sweet and savory glaze",
    category: "main_course",
    servingSize: "50 sticks per order",
    preparationTime: 40,
    isAvailable: true
  },

  // MAIN COURSES - CHICKEN
  {
    name: "Chicken Adobo",
    description: "Tender chicken braised in soy sauce, vinegar, garlic, and spices",
    category: "main_course",
    servingSize: "Serves 15-20 people",
    preparationTime: 50,
    isAvailable: true
  },
  {
    name: "Chicken Inasal",
    description: "Grilled chicken marinated in calamansi, lemongrass, and annatto oil",
    category: "main_course",
    servingSize: "15-20 pieces per order",
    preparationTime: 60,
    isAvailable: true
  },
  {
    name: "Chicken Afritada",
    description: "Chicken stewed in tomato sauce with potatoes, carrots, and bell peppers",
    category: "main_course",
    servingSize: "Serves 15-20 people",
    preparationTime: 45,
    isAvailable: true
  },
  {
    name: "Chicken Curry",
    description: "Filipino-style chicken curry with coconut milk, potatoes, and vegetables",
    category: "main_course",
    servingSize: "Serves 15-20 people",
    preparationTime: 50,
    isAvailable: true
  },
  {
    name: "Chicken Pastel",
    description: "Creamy chicken pie with vegetables in white sauce, topped with puff pastry",
    category: "main_course",
    servingSize: "Serves 15-20 people",
    preparationTime: 70,
    isAvailable: true
  },
  {
    name: "Chicken Relleno",
    description: "Deboned whole chicken stuffed with ground pork, chorizo, eggs, and vegetables",
    category: "main_course",
    servingSize: "1 whole chicken (serves 8-10)",
    preparationTime: 120,
    isAvailable: true
  },
  {
    name: "Fried Chicken",
    description: "Filipino-style crispy fried chicken marinated in garlic, calamansi, and spices",
    category: "main_course",
    servingSize: "15-20 pieces per order",
    preparationTime: 45,
    isAvailable: true
  },

  // MAIN COURSES - BEEF
  {
    name: "Beef Caldereta",
    description: "Rich beef stew in tomato sauce with liver paste, potatoes, carrots, and bell peppers",
    category: "main_course",
    servingSize: "Serves 15-20 people",
    preparationTime: 90,
    isAvailable: true
  },
  {
    name: "Beef Mechado",
    description: "Tender beef chunks in tomato sauce with potatoes and soy sauce",
    category: "main_course",
    servingSize: "Serves 15-20 people",
    preparationTime: 85,
    isAvailable: true
  },
  {
    name: "Beef Morcon",
    description: "Stuffed beef roll with eggs, sausage, pickles, and cheese in rich gravy",
    category: "main_course",
    servingSize: "Serves 15-20 people",
    preparationTime: 120,
    isAvailable: true
  },
  {
    name: "Beef Tapa",
    description: "Sweet and savory cured beef, pan-fried and served with garlic rice",
    category: "main_course",
    servingSize: "Serves 15-20 people",
    preparationTime: 30,
    isAvailable: true
  },
  {
    name: "Kare-Kare",
    description: "Oxtail and vegetables in rich peanut sauce, served with bagoong (shrimp paste)",
    category: "main_course",
    servingSize: "Serves 15-20 people",
    preparationTime: 150,
    isAvailable: true
  },
  {
    name: "Bulalo",
    description: "Beef shank soup with bone marrow, corn, and vegetables in clear broth",
    category: "main_course",
    servingSize: "Serves 15-20 people",
    preparationTime: 180,
    isAvailable: true
  },

  // MAIN COURSES - SEAFOOD
  {
    name: "Rellenong Bangus",
    description: "Deboned milkfish stuffed with sautéed vegetables and the fish meat, then fried",
    category: "main_course",
    servingSize: "3-4 whole fish per order",
    preparationTime: 90,
    isAvailable: true
  },
  {
    name: "Sweet and Sour Fish Fillet",
    description: "Crispy fried fish fillet topped with sweet and sour sauce with pineapple and vegetables",
    category: "main_course",
    servingSize: "Serves 15-20 people",
    preparationTime: 35,
    isAvailable: true
  },
  {
    name: "Grilled Bangus (Milkfish)",
    description: "Marinated milkfish grilled to perfection, served with toyomansi",
    category: "main_course",
    servingSize: "4-5 whole fish per order",
    preparationTime: 40,
    isAvailable: true
  },
  {
    name: "Sinigang na Hipon",
    description: "Shrimp in sour tamarind soup with vegetables",
    category: "main_course",
    servingSize: "Serves 15-20 people",
    preparationTime: 35,
    isAvailable: true
  },
  {
    name: "Gambas al Ajillo",
    description: "Sizzling shrimp in spicy garlic butter sauce",
    category: "main_course",
    servingSize: "Serves 15-20 people",
    preparationTime: 25,
    isAvailable: true
  },
  {
    name: "Calamares (Fried Squid)",
    description: "Crispy breaded squid rings served with spicy mayo or vinegar dip",
    category: "main_course",
    servingSize: "Serves 15-20 people",
    preparationTime: 30,
    isAvailable: true
  },
  {
    name: "Seafood Paella",
    description: "Spanish-Filipino rice dish with mixed seafood, chorizo, and saffron",
    category: "main_course",
    servingSize: "Serves 15-20 people",
    preparationTime: 60,
    isAvailable: true
  },

  // SIDE DISHES
  {
    name: "Pancit Canton",
    description: "Stir-fried egg noodles with vegetables, meat, and seafood",
    category: "side_dish",
    servingSize: "Serves 15-20 people",
    preparationTime: 30,
    isAvailable: true
  },
  {
    name: "Pancit Bihon",
    description: "Stir-fried rice noodles with vegetables and meat",
    category: "side_dish",
    servingSize: "Serves 15-20 people",
    preparationTime: 30,
    isAvailable: true
  },
  {
    name: "Pancit Palabok",
    description: "Rice noodles with shrimp sauce, topped with eggs, chicharon, and seafood",
    category: "side_dish",
    servingSize: "Serves 15-20 people",
    preparationTime: 45,
    isAvailable: true
  },
  {
    name: "Garlic Rice",
    description: "Fragrant fried rice with lots of garlic",
    category: "side_dish",
    servingSize: "Serves 15-20 people",
    preparationTime: 20,
    isAvailable: true
  },
  {
    name: "Java Rice",
    description: "Yellow fried rice with turmeric and annatto",
    category: "side_dish",
    servingSize: "Serves 15-20 people",
    preparationTime: 25,
    isAvailable: true
  },
  {
    name: "Pinakbet",
    description: "Mixed vegetables with shrimp paste (bagoong) and pork",
    category: "side_dish",
    servingSize: "Serves 15-20 people",
    preparationTime: 30,
    isAvailable: true
  },
  {
    name: "Chopsuey",
    description: "Stir-fried mixed vegetables in savory sauce",
    category: "side_dish",
    servingSize: "Serves 15-20 people",
    preparationTime: 25,
    isAvailable: true
  },
  {
    name: "Ensaladang Talong",
    description: "Grilled eggplant salad with tomatoes, onions, and bagoong",
    category: "side_dish",
    servingSize: "Serves 15-20 people",
    preparationTime: 20,
    isAvailable: true
  },
  {
    name: "Atchara (Pickled Papaya)",
    description: "Sweet and tangy pickled green papaya with carrots and bell peppers",
    category: "side_dish",
    servingSize: "Serves 15-20 people",
    preparationTime: 15,
    isAvailable: true
  },
  {
    name: "Ginataang Gulay",
    description: "Mixed vegetables cooked in coconut milk with shrimp paste",
    category: "side_dish",
    servingSize: "Serves 15-20 people",
    preparationTime: 30,
    isAvailable: true
  },

  // DESSERTS
  {
    name: "Leche Flan",
    description: "Creamy caramel custard made with egg yolks and condensed milk",
    category: "dessert",
    servingSize: "20-25 slices per tray",
    preparationTime: 90,
    isAvailable: true
  },
  {
    name: "Ube Halaya",
    description: "Purple yam jam, sweet and creamy dessert",
    category: "dessert",
    servingSize: "Serves 15-20 people",
    preparationTime: 60,
    isAvailable: true
  },
  {
    name: "Buko Pandan",
    description: "Young coconut and pandan-flavored jelly in sweet cream",
    category: "dessert",
    servingSize: "Serves 15-20 people",
    preparationTime: 30,
    isAvailable: true
  },
  {
    name: "Fruit Salad",
    description: "Mixed tropical fruits in sweetened cream with nata de coco",
    category: "dessert",
    servingSize: "Serves 15-20 people",
    preparationTime: 25,
    isAvailable: true
  },
  {
    name: "Maja Blanca",
    description: "Coconut pudding topped with latik (coconut curds)",
    category: "dessert",
    servingSize: "20-25 slices per tray",
    preparationTime: 45,
    isAvailable: true
  },
  {
    name: "Cassava Cake",
    description: "Sweet grated cassava cake with coconut milk and cheese topping",
    category: "dessert",
    servingSize: "20-25 slices per tray",
    preparationTime: 75,
    isAvailable: true
  },
  {
    name: "Bibingka",
    description: "Traditional rice cake with salted egg and cheese, cooked in banana leaves",
    category: "dessert",
    servingSize: "20 pieces per order",
    preparationTime: 40,
    isAvailable: true
  },
  {
    name: "Puto",
    description: "Steamed rice cakes, soft and fluffy with cheese topping",
    category: "dessert",
    servingSize: "50 pieces per order",
    preparationTime: 35,
    isAvailable: true
  },
  {
    name: "Sapin-Sapin",
    description: "Colorful layered glutinous rice cake with coconut milk",
    category: "dessert",
    servingSize: "20-25 slices per tray",
    preparationTime: 60,
    isAvailable: true
  },
  {
    name: "Turon (Banana Spring Rolls)",
    description: "Caramelized banana and jackfruit wrapped in spring roll wrapper",
    category: "dessert",
    servingSize: "40 pieces per order",
    preparationTime: 30,
    isAvailable: true
  },

  // BEVERAGES
  {
    name: "Sago't Gulaman",
    description: "Sweet iced drink with tapioca pearls and gelatin in brown sugar syrup",
    category: "beverage",
    servingSize: "20 liters (100+ cups)",
    preparationTime: 30,
    isAvailable: true
  },
  {
    name: "Buko Juice",
    description: "Fresh young coconut juice served cold",
    category: "beverage",
    servingSize: "20 liters (100+ cups)",
    preparationTime: 20,
    isAvailable: true
  },
  {
    name: "Calamansi Juice",
    description: "Refreshing Filipino lime juice, sweet and tangy",
    category: "beverage",
    servingSize: "20 liters (100+ cups)",
    preparationTime: 25,
    isAvailable: true
  },
  {
    name: "Four Seasons Juice",
    description: "Mixed tropical fruit juice blend",
    category: "beverage",
    servingSize: "20 liters (100+ cups)",
    preparationTime: 30,
    isAvailable: true
  },
  {
    name: "Melon Juice",
    description: "Sweet and refreshing cantaloupe juice",
    category: "beverage",
    servingSize: "20 liters (100+ cups)",
    preparationTime: 25,
    isAvailable: true
  },
  {
    name: "Iced Tea",
    description: "Classic sweetened iced tea with lemon",
    category: "beverage",
    servingSize: "20 liters (100+ cups)",
    preparationTime: 20,
    isAvailable: true
  }
];

async function seedDishes() {
  try {
    await sequelize.authenticate();
    console.log('Database connection established.');

    // Sync models
    await sequelize.sync();
    console.log('Database synced.');

    // Clear existing dishes (optional - comment out if you want to keep existing)
    // await Dish.destroy({ where: {}, truncate: true });
    // console.log('Existing dishes cleared.');

    // Insert dishes
    let successCount = 0;
    let errorCount = 0;

    for (const dish of filipinoDishes) {
      try {
        await Dish.create(dish);
        successCount++;
        console.log(`✓ Created: ${dish.name}`);
      } catch (error) {
        errorCount++;
        console.error(`✗ Failed to create ${dish.name}:`, error.message);
      }
    }

    console.log('\n=== SEEDING COMPLETE ===');
    console.log(`Total dishes: ${filipinoDishes.length}`);
    console.log(`Successfully created: ${successCount}`);
    console.log(`Errors: ${errorCount}`);
    console.log('\nDishes by category:');
    console.log(`- Appetizers: ${filipinoDishes.filter(d => d.category === 'appetizer').length}`);
    console.log(`- Main Courses: ${filipinoDishes.filter(d => d.category === 'main_course').length}`);
    console.log(`- Side Dishes: ${filipinoDishes.filter(d => d.category === 'side_dish').length}`);
    console.log(`- Desserts: ${filipinoDishes.filter(d => d.category === 'dessert').length}`);
    console.log(`- Beverages: ${filipinoDishes.filter(d => d.category === 'beverage').length}`);

    process.exit(0);
  } catch (error) {
    console.error('Error seeding dishes:', error);
    process.exit(1);
  }
}

seedDishes();
