const { Dish } = require('../Models');

// Get all dishes
exports.getAllDishes = async (req, res) => {
  try {
    const dishes = await Dish.findAll({
      order: [['createdAt', 'DESC']]
    });

    res.json({
      success: true,
      data: dishes
    });
  } catch (error) {
    console.error('Get dishes error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching dishes'
    });
  }
};

// Get single dish
exports.getDishById = async (req, res) => {
  try {
    const { id } = req.params;
    const dish = await Dish.findByPk(id);

    if (!dish) {
      return res.status(404).json({
        success: false,
        message: 'Dish not found'
      });
    }

    res.json({
      success: true,
      data: dish
    });
  } catch (error) {
    console.error('Get dish error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching dish'
    });
  }
};

// Create new dish
exports.createDish = async (req, res) => {
  try {
    const { name, description, category, image, isAvailable, servingSize, preparationTime } = req.body;

    // Validate required fields
    if (!name || !category) {
      return res.status(400).json({
        success: false,
        message: 'Name and category are required'
      });
    }

    const dish = await Dish.create({
      name,
      description,
      category,
      image,
      isAvailable: isAvailable !== undefined ? isAvailable : true,
      servingSize,
      preparationTime
    });

    res.status(201).json({
      success: true,
      message: 'Dish created successfully',
      data: dish
    });
  } catch (error) {
    console.error('Create dish error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while creating dish'
    });
  }
};

// Update dish
exports.updateDish = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, category, image, isAvailable, servingSize, preparationTime } = req.body;

    const dish = await Dish.findByPk(id);

    if (!dish) {
      return res.status(404).json({
        success: false,
        message: 'Dish not found'
      });
    }

    await dish.update({
      name: name || dish.name,
      description: description !== undefined ? description : dish.description,
      category: category || dish.category,
      image: image !== undefined ? image : dish.image,
      isAvailable: isAvailable !== undefined ? isAvailable : dish.isAvailable,
      servingSize: servingSize !== undefined ? servingSize : dish.servingSize,
      preparationTime: preparationTime !== undefined ? preparationTime : dish.preparationTime
    });

    res.json({
      success: true,
      message: 'Dish updated successfully',
      data: dish
    });
  } catch (error) {
    console.error('Update dish error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while updating dish'
    });
  }
};

// Delete dish
exports.deleteDish = async (req, res) => {
  try {
    const { id } = req.params;

    const dish = await Dish.findByPk(id);

    if (!dish) {
      return res.status(404).json({
        success: false,
        message: 'Dish not found'
      });
    }

    await dish.destroy();

    res.json({
      success: true,
      message: 'Dish deleted successfully'
    });
  } catch (error) {
    console.error('Delete dish error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while deleting dish'
    });
  }
};

// Get dishes by category
exports.getDishesByCategory = async (req, res) => {
  try {
    const { category } = req.params;

    const dishes = await Dish.findAll({
      where: { category },
      order: [['name', 'ASC']]
    });

    res.json({
      success: true,
      data: dishes
    });
  } catch (error) {
    console.error('Get dishes by category error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching dishes'
    });
  }
};
