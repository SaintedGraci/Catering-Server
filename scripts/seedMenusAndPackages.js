const { Menu, Package, Dish, PackageDish } = require('../src/Models');
const { sequelize } = require('../config/database');

// Event Types (Menus)
const menus = [
  {
    name: "Wedding Catering",
    description: "Elegant and memorable dining experience for your special day. From intimate gatherings to grand celebrations, we create the perfect feast for your wedding.",
    type: "wedding",
    isActive: true
  },
  {
    name: "Corporate Events",
    description: "Professional catering services for business meetings, conferences, seminars, and company celebrations. Impress your clients and colleagues with quality Filipino cuisine.",
    type: "corporate",
    isActive: true
  },
  {
    name: "Birthday Parties",
    description: "Make your birthday celebration extra special with our delicious Filipino dishes. Perfect for all ages, from kids' parties to milestone celebrations.",
    type: "birthday",
    isActive: true
  },
  {
    name: "Private Events",
    description: "Intimate gatherings, family reunions, anniversaries, and special occasions. Customizable menus to suit your preferences and guest count.",
    type: "private",
    isActive: true
  },
  {
    name: "Fiesta & Community Events",
    description: "Large-scale catering for barangay fiestas, town celebrations, and community gatherings. Authentic Filipino flavors for the whole community.",
    type: "custom",
    isActive: true
  }
];

// Packages for each menu type
const packages = [
  // WEDDING PACKAGES
  {
    name: "Romantic Garden Package",
    description: "Perfect for intimate garden weddings with 50-100 guests. Features elegant Filipino dishes with a modern twist.",
    menuType: "wedding",
    priceRange: "₱1,200 – ₱1,800 / guest",
    minPrice: 1200,
    maxPrice: 1800,
    includes: [
      "Welcome drinks and appetizers",
      "5-course meal service",
      "Dessert station",
      "Professional waitstaff",
      "Table setup and linens",
      "Complimentary tasting for 2"
    ],
    dishSelectionCount: 8,
    isFeatured: true,
    isActive: true
  },
  {
    name: "Grand Ballroom Package",
    description: "Luxurious package for grand wedding receptions with 200+ guests. Premium selection of Filipino and international dishes.",
    menuType: "wedding",
    priceRange: "₱1,800 – ₱2,500 / guest",
    minPrice: 1800,
    maxPrice: 2500,
    includes: [
      "Cocktail hour with premium appetizers",
      "7-course gourmet meal",
      "Live carving station",
      "Dessert buffet with wedding cake",
      "Professional service team",
      "Premium table setup and decor",
      "Complimentary tasting for 4",
      "Free wedding coordinator consultation"
    ],
    dishSelectionCount: 12,
    isFeatured: false,
    isActive: true
  },
  {
    name: "Classic Filipino Wedding",
    description: "Traditional Filipino wedding feast featuring beloved classics. Perfect for couples who want authentic Pinoy flavors.",
    menuType: "wedding",
    priceRange: "₱950 – ₱1,400 / guest",
    minPrice: 950,
    maxPrice: 1400,
    includes: [
      "Traditional appetizer selection",
      "4-course Filipino meal",
      "Classic desserts",
      "Service staff",
      "Basic table setup",
      "Complimentary tasting for 2"
    ],
    dishSelectionCount: 6,
    isFeatured: false,
    isActive: true
  },

  // CORPORATE PACKAGES
  {
    name: "Executive Lunch Package",
    description: "Professional lunch service for corporate meetings and conferences. Efficient service with quality dishes.",
    menuType: "corporate",
    priceRange: "₱450 – ₱650 / person",
    minPrice: 450,
    maxPrice: 650,
    includes: [
      "Appetizer or soup",
      "Main course selection",
      "Rice or pasta",
      "Dessert",
      "Beverages (coffee, tea, juice)",
      "Disposable or reusable dinnerware",
      "Setup and cleanup"
    ],
    dishSelectionCount: 4,
    isFeatured: true,
    isActive: true
  },
  {
    name: "Team Building Package",
    description: "Hearty meals for team building activities and company outings. Casual dining with generous portions.",
    menuType: "corporate",
    priceRange: "₱550 – ₱800 / person",
    minPrice: 550,
    maxPrice: 800,
    includes: [
      "Welcome snacks",
      "Buffet-style lunch or dinner",
      "Unlimited rice",
      "Dessert and fruits",
      "Beverages throughout the day",
      "Buffet setup and service staff",
      "Coolers with ice"
    ],
    dishSelectionCount: 6,
    isFeatured: false,
    isActive: true
  },
  {
    name: "Corporate Gala Package",
    description: "Elegant sit-down dinner for corporate anniversaries, awards nights, and formal company events.",
    menuType: "corporate",
    priceRange: "₱850 – ₱1,200 / person",
    minPrice: 850,
    maxPrice: 1200,
    includes: [
      "Cocktail reception with canapés",
      "5-course plated dinner",
      "Premium dessert selection",
      "Coffee and tea service",
      "Professional waitstaff in formal attire",
      "Elegant table setup",
      "Menu cards"
    ],
    dishSelectionCount: 7,
    isFeatured: false,
    isActive: true
  },

  // BIRTHDAY PACKAGES
  {
    name: "Kids Party Package",
    description: "Fun and delicious food for children's birthday parties. Kid-friendly Filipino favorites that adults will love too!",
    menuType: "birthday",
    priceRange: "₱350 – ₱500 / person",
    minPrice: 350,
    maxPrice: 500,
    includes: [
      "Kid-friendly appetizers",
      "Main dishes (chicken, pasta, rice)",
      "Birthday cake coordination",
      "Juice and soft drinks",
      "Colorful table setup",
      "Party host assistance",
      "Loot bag coordination (optional)"
    ],
    dishSelectionCount: 4,
    isFeatured: false,
    isActive: true
  },
  {
    name: "Milestone Celebration Package",
    description: "Special package for 18th birthday, 50th birthday, and other milestone celebrations. Elegant yet festive.",
    menuType: "birthday",
    priceRange: "₱750 – ₱1,100 / person",
    minPrice: 750,
    maxPrice: 1100,
    includes: [
      "Welcome drinks and appetizers",
      "Buffet or plated dinner",
      "Birthday cake and dessert table",
      "Beverage station",
      "Professional service team",
      "Themed table decorations",
      "Photo-worthy food presentation"
    ],
    dishSelectionCount: 6,
    isFeatured: true,
    isActive: true
  },
  {
    name: "Adult Birthday Bash",
    description: "Casual and fun package for adult birthday parties. Great food, generous portions, perfect for celebrations with friends.",
    menuType: "birthday",
    priceRange: "₱550 – ₱750 / person",
    minPrice: 550,
    maxPrice: 750,
    includes: [
      "Appetizer platters",
      "Buffet-style main courses",
      "Birthday cake",
      "Unlimited iced tea or juice",
      "Buffet setup",
      "Service staff",
      "Basic decorations"
    ],
    dishSelectionCount: 5,
    isFeatured: false,
    isActive: true
  },

  // PRIVATE EVENT PACKAGES
  {
    name: "Intimate Gathering Package",
    description: "Perfect for small family gatherings, anniversaries, and intimate celebrations with 20-50 guests.",
    menuType: "private",
    priceRange: "₱500 – ₱750 / person",
    minPrice: 500,
    maxPrice: 750,
    includes: [
      "Appetizer selection",
      "Family-style main courses",
      "Dessert",
      "Beverages",
      "Service staff",
      "Table setup",
      "Personalized menu consultation"
    ],
    dishSelectionCount: 5,
    isFeatured: true,
    isActive: true
  },
  {
    name: "Family Reunion Package",
    description: "Generous portions for family reunions and large family gatherings. Home-style Filipino cooking at its best.",
    menuType: "private",
    priceRange: "₱450 – ₱650 / person",
    minPrice: 450,
    maxPrice: 650,
    includes: [
      "Appetizers and finger foods",
      "Buffet-style Filipino favorites",
      "Unlimited rice",
      "Dessert and fruits",
      "Beverages (juice, iced tea)",
      "Buffet setup and service",
      "Takeout containers for leftovers"
    ],
    dishSelectionCount: 6,
    isFeatured: false,
    isActive: true
  },
  {
    name: "Anniversary Celebration",
    description: "Romantic and elegant package for wedding anniversaries and special couple celebrations.",
    menuType: "private",
    priceRange: "₱800 – ₱1,200 / person",
    minPrice: 800,
    maxPrice: 1200,
    includes: [
      "Welcome champagne or sparkling juice",
      "Gourmet appetizers",
      "5-course plated dinner",
      "Anniversary cake",
      "Premium desserts",
      "Professional waitstaff",
      "Elegant table setup with flowers",
      "Personalized menu cards"
    ],
    dishSelectionCount: 7,
    isFeatured: false,
    isActive: true
  },

  // FIESTA PACKAGES
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

async function seedMenusAndPackages() {
  try {
    await sequelize.authenticate();
    console.log('Database connection established.');

    await sequelize.sync();
    console.log('Database synced.');

    // Get all available dishes for package assignment
    const allDishes = await Dish.findAll();
    console.log(`Found ${allDishes.length} dishes in database.\n`);

    // Create Menus
    console.log('=== CREATING MENUS ===');
    const createdMenus = {};
    for (const menuData of menus) {
      try {
        const menu = await Menu.create(menuData);
        createdMenus[menu.type] = menu;
        console.log(`✓ Created menu: ${menu.name}`);
      } catch (error) {
        console.error(`✗ Failed to create menu ${menuData.name}:`, error.message);
      }
    }

    // Helper function to get random dishes by category
    const getDishesByCategory = (category, count) => {
      const categoryDishes = allDishes.filter(d => d.category === category);
      const shuffled = categoryDishes.sort(() => 0.5 - Math.random());
      return shuffled.slice(0, Math.min(count, categoryDishes.length));
    };

    // Create Packages with dish assignments
    console.log('\n=== CREATING PACKAGES ===');
    let packageCount = 0;
    
    for (const pkgData of packages) {
      try {
        // Create the package
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

        // Assign dishes to package based on the package type and dish selection count
        const dishCount = pkgData.dishSelectionCount;
        let selectedDishes = [];

        // Distribution logic based on package size
        if (dishCount <= 4) {
          // Small package: 1 appetizer, 2 mains, 1 dessert
          selectedDishes = [
            ...getDishesByCategory('appetizer', 1),
            ...getDishesByCategory('main_course', 2),
            ...getDishesByCategory('dessert', 1)
          ];
        } else if (dishCount <= 6) {
          // Medium package: 1 appetizer, 3-4 mains, 1 side, 1 dessert
          selectedDishes = [
            ...getDishesByCategory('appetizer', 1),
            ...getDishesByCategory('main_course', dishCount - 3),
            ...getDishesByCategory('side_dish', 1),
            ...getDishesByCategory('dessert', 1)
          ];
        } else if (dishCount <= 8) {
          // Large package: 2 appetizers, 4 mains, 1 side, 1 dessert
          selectedDishes = [
            ...getDishesByCategory('appetizer', 2),
            ...getDishesByCategory('main_course', 4),
            ...getDishesByCategory('side_dish', 1),
            ...getDishesByCategory('dessert', 1)
          ];
        } else {
          // Extra large package: 2 appetizers, 5-6 mains, 2 sides, 1 dessert, 1 beverage
          selectedDishes = [
            ...getDishesByCategory('appetizer', 2),
            ...getDishesByCategory('main_course', dishCount - 6),
            ...getDishesByCategory('side_dish', 2),
            ...getDishesByCategory('dessert', 1),
            ...getDishesByCategory('beverage', 1)
          ];
        }

        // Create PackageDish associations
        for (let i = 0; i < selectedDishes.length; i++) {
          await PackageDish.create({
            packageId: pkg.id,
            dishId: selectedDishes[i].id,
            sortOrder: i
          });
        }

        packageCount++;
        console.log(`✓ Created package: ${pkg.name} (${selectedDishes.length} dishes assigned)`);
      } catch (error) {
        console.error(`✗ Failed to create package ${pkgData.name}:`, error.message);
      }
    }

    console.log('\n=== SEEDING COMPLETE ===');
    console.log(`Menus created: ${Object.keys(createdMenus).length}`);
    console.log(`Packages created: ${packageCount}`);
    console.log('\nMenus by type:');
    Object.values(createdMenus).forEach(menu => {
      const pkgCount = packages.filter(p => p.menuType === menu.type).length;
      console.log(`  - ${menu.name}: ${pkgCount} packages`);
    });

    process.exit(0);
  } catch (error) {
    console.error('Error seeding menus and packages:', error);
    process.exit(1);
  }
}

seedMenusAndPackages();
