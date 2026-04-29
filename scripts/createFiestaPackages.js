const { Package, Dish, PackageDish } = require('../src/Models');
const { sequelize } = require('../config/database');

const fiestaPackages = [
  {
    name: "Barangay Fiesta Package",
    description: "Large-scale catering for community fiestas and barangay celebrations. Authentic Filipino dishes in generous quantities.",
    menuType: "custom",
    priceRange: "₱280 – ₱400 / person",
    minPrice: 280,
    maxPrice: 400,
    includes: [
      "Traditional Filipino appetizers",
      "Multiple main course options",
      "Unlimited rice",
      "Desserts",
      "Beverages",
      "Buffet setup with chafing dishes",
      "Service crew",
      "Disposable plates and utensils"
    ],
    dishSelectionCount: 8,
    isFeatured: true,
    isActive: true
  },
  {
    name: "Town Celebration Package",
    description: "Extra large-scale catering for town fiestas and major community events. Can serve 500+ guests.",
    menuType: "custom",
    priceRange: "₱320 – ₱480 / person",
    minPrice: 320,
    maxPrice: 480,
    includes: [
      "Multiple appetizer stations",
      "Variety of main courses (pork, chicken, seafood)",
      "Pancit and rice dishes",
      "Dessert table",
      "Beverage stations",
      "Complete buffet setup",
      "Full service team",
      "Tents and tables (if needed)"
    ],
    dishSelectionCount: 10,
    isFeatured: false,
    isActive: true
  },
  {
    name: "Lechon Festival Package",
    description: "Special package featuring whole roasted pig (lechon) as the centerpiece, perfect for grand celebrations.",
    menuType: "custom",
    priceRange: "₱400 – ₱600 / person",
    minPrice: 400,
    maxPrice: 600,
    includes: [
      "Whole roasted lechon (1 per 50 guests)",
      "Lechon carving and serving",
      "Complementary side dishes",
      "Appetizers",
      "Rice and pancit",
      "Desserts",
      "Beverages",
      "Full buffet setup and service"
    ],
    dishSelectionCount: 7,
    isFeatured: false,
    isActive: true
  }
];

async function createFiestaPackages() {
  try {
    await sequelize.authenticate();
    
    const allDishes = await Dish.findAll();
    console.log(`Found ${allDishes.length} dishes in database.\n`);

    const getDishesByCategory = (category, count) => {
      const categoryDishes = allDishes.filter(d => d.category === category);
      const shuffled = categoryDishes.sort(() => 0.5 - Math.random());
      return shuffled.slice(0, Math.min(count, categoryDishes.length));
    };

    console.log('=== CREATING FIESTA PACKAGES ===');
    
    for (const pkgData of fiestaPackages) {
      try {
        const pkg = await Package.create({
          name: pkgData.name,
          description: pkgData.description,
          menuType: pkgData.menuType,
          priceRange: pkgData.priceRange,
          minPrice: pkgData.minPrice,
          maxPrice: pkgData.maxPrice,
          includes: pkgData.includes,
          dishSelectionCount: pkgData.dishSelectionCount,
          isFeatured: pkgData.isFeatured,
          isActive: pkgData.isActive
        });

        const dishCount = pkgData.dishSelectionCount;
        let selectedDishes = [];

        if (dishCount <= 8) {
          selectedDishes = [
            ...getDishesByCategory('appetizer', 2),
            ...getDishesByCategory('main_course', 4),
            ...getDishesByCategory('side_dish', 1),
            ...getDishesByCategory('dessert', 1)
          ];
        } else {
          selectedDishes = [
            ...getDishesByCategory('appetizer', 2),
            ...getDishesByCategory('main_course', dishCount - 6),
            ...getDishesByCategory('side_dish', 2),
            ...getDishesByCategory('dessert', 1),
            ...getDishesByCategory('beverage', 1)
          ];
        }

        for (let i = 0; i < selectedDishes.length; i++) {
          await PackageDish.create({
            packageId: pkg.id,
            dishId: selectedDishes[i].id,
            sortOrder: i
          });
        }

        console.log(`✓ Created package: ${pkg.name} (${selectedDishes.length} dishes assigned)`);
      } catch (error) {
        console.error(`✗ Failed to create package ${pkgData.name}:`, error.message);
      }
    }

    console.log('\n=== COMPLETE ===');
    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

createFiestaPackages();
