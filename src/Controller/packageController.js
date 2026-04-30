const { Package, Dish, PackageDish } = require('../Models');

// Get all packages (public - only active ones)
exports.getAllPackages = async (req, res) => {
  try {
    const packages = await Package.findAll({
      where: { isActive: true },
      order: [
        ['menuType', 'ASC'],
        ['isFeatured', 'DESC'],
        ['name', 'ASC']
      ]
    });

    res.json({
      success: true,
      data: packages
    });
  } catch (error) {
    console.error('Get packages error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching packages'
    });
  }
};

// Get packages by menu type (public)
exports.getPackagesByMenuType = async (req, res) => {
  try {
    const { menuType } = req.params;
    
    const packages = await Package.findAll({
      where: { 
        menuType,
        isActive: true 
      },
      include: [{
        model: Dish,
        as: 'dishes',
        through: { attributes: ['category', 'sortOrder'] },
        attributes: ['id', 'name', 'description', 'category', 'image']
      }],
      order: [
        ['isFeatured', 'DESC'],
        ['name', 'ASC']
      ]
    });

    res.json({
      success: true,
      data: packages
    });
  } catch (error) {
    console.error('Get packages by menu type error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching packages'
    });
  }
};

// Get all packages (admin - including inactive)
exports.getAllPackagesAdmin = async (req, res) => {
  try {
    const packages = await Package.findAll({
      include: [{
        model: Dish,
        as: 'dishes',
        through: { attributes: ['category', 'sortOrder'] },
        attributes: ['id', 'name', 'description', 'category', 'image']
      }],
      order: [
        ['menuType', 'ASC'],
        ['isFeatured', 'DESC'],
        ['name', 'ASC']
      ]
    });

    res.json({
      success: true,
      data: packages
    });
  } catch (error) {
    console.error('Get packages error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching packages'
    });
  }
};

// Get single package
exports.getPackageById = async (req, res) => {
  try {
    const { id } = req.params;
    const pkg = await Package.findByPk(id);

    if (!pkg) {
      return res.status(404).json({
        success: false,
        message: 'Package not found'
      });
    }

    res.json({
      success: true,
      data: pkg
    });
  } catch (error) {
    console.error('Get package error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching package'
    });
  }
};

// Create new package
exports.createPackage = async (req, res) => {
  try {
    const {
      name,
      description,
      menuType,
      priceRange,
      minPrice,
      maxPrice,
      includes,
      dishSelectionCount,
      dishSelectionRules,
      dishes,
      isFeatured,
      isActive,
      sortOrder
    } = req.body;

    // Validate required fields
    console.log('Create package - received data:', { name, menuType, priceRange, includes, includesType: typeof includes, includesIsArray: Array.isArray(includes), dishSelectionRules });
    
    if (!name || !menuType || !priceRange || !includes || !Array.isArray(includes) || includes.length === 0) {
      console.log('Validation failed:', { name: !!name, menuType: !!menuType, priceRange: !!priceRange, includes: !!includes, isArray: Array.isArray(includes), length: includes?.length });
      return res.status(400).json({
        success: false,
        message: 'Name, menu type, price range, and includes are required'
      });
    }

    const pkg = await Package.create({
      name,
      description,
      menuType,
      priceRange,
      minPrice,
      maxPrice,
      includes: Array.isArray(includes) ? includes : [],
      dishSelectionCount,
      dishSelectionRules: dishSelectionRules || null,
      isFeatured: isFeatured || false,
      isActive: isActive !== undefined ? isActive : true
    });

    // Add dishes if provided
    if (dishes && Array.isArray(dishes) && dishes.length > 0) {
      const packageDishes = dishes.map((dish, index) => ({
        packageId: pkg.id,
        dishId: typeof dish === 'number' ? dish : dish.dishId,
        category: dish.category || null,
        sortOrder: dish.sortOrder !== undefined ? dish.sortOrder : index
      }));
      await PackageDish.bulkCreate(packageDishes);
    }

    // Fetch the package with dishes
    const packageWithDishes = await Package.findByPk(pkg.id, {
      include: [{
        model: Dish,
        as: 'dishes',
        through: { attributes: ['category', 'sortOrder'] }
      }]
    });

    res.status(201).json({
      success: true,
      message: 'Package created successfully',
      data: packageWithDishes
    });
  } catch (error) {
    console.error('Create package error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while creating package'
    });
  }
};

// Update package
exports.updatePackage = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      name,
      description,
      menuType,
      priceRange,
      minPrice,
      maxPrice,
      includes,
      dishSelectionCount,
      dishSelectionRules,
      dishes,
      isFeatured,
      isActive,
      sortOrder
    } = req.body;

    console.log('Update package - received dishSelectionRules:', dishSelectionRules);

    const pkg = await Package.findByPk(id);

    if (!pkg) {
      return res.status(404).json({
        success: false,
        message: 'Package not found'
      });
    }

    await pkg.update({
      name: name || pkg.name,
      description: description !== undefined ? description : pkg.description,
      menuType: menuType || pkg.menuType,
      priceRange: priceRange || pkg.priceRange,
      minPrice: minPrice !== undefined ? minPrice : pkg.minPrice,
      maxPrice: maxPrice !== undefined ? maxPrice : pkg.maxPrice,
      includes: includes !== undefined ? includes : pkg.includes,
      dishSelectionCount: dishSelectionCount !== undefined ? dishSelectionCount : pkg.dishSelectionCount,
      dishSelectionRules: dishSelectionRules !== undefined ? dishSelectionRules : pkg.dishSelectionRules,
      isFeatured: isFeatured !== undefined ? isFeatured : pkg.isFeatured,
      isActive: isActive !== undefined ? isActive : pkg.isActive
    });

    // Update dishes if provided
    if (dishes !== undefined && Array.isArray(dishes)) {
      // Remove existing dishes
      await PackageDish.destroy({ where: { packageId: id } });
      
      // Add new dishes
      if (dishes.length > 0) {
        const packageDishes = dishes.map((dishId, index) => ({
          packageId: id,
          dishId: typeof dishId === 'number' ? dishId : dishId.dishId,
          category: dishId.category || null,
          sortOrder: dishId.sortOrder !== undefined ? dishId.sortOrder : index
        }));
        await PackageDish.bulkCreate(packageDishes);
      }
    }

    // Fetch the package with dishes
    const packageWithDishes = await Package.findByPk(id, {
      include: [{
        model: Dish,
        as: 'dishes',
        through: { attributes: ['category', 'sortOrder'] }
      }]
    });

    res.json({
      success: true,
      message: 'Package updated successfully',
      data: packageWithDishes
    });
  } catch (error) {
    console.error('Update package error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while updating package'
    });
  }
};

// Delete package
exports.deletePackage = async (req, res) => {
  try {
    const { id } = req.params;

    const pkg = await Package.findByPk(id);

    if (!pkg) {
      return res.status(404).json({
        success: false,
        message: 'Package not found'
      });
    }

    await pkg.destroy();

    res.json({
      success: true,
      message: 'Package deleted successfully'
    });
  } catch (error) {
    console.error('Delete package error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while deleting package'
    });
  }
};
