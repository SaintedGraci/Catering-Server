const { Menu } = require('../Models');

// Get all menus (event types)
exports.getAllMenus = async (req, res) => {
  try {
    const menus = await Menu.findAll({
      order: [['type', 'ASC'], ['name', 'ASC']]
    });

    res.json({
      success: true,
      data: menus
    });
  } catch (error) {
    console.error('Get menus error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching menus'
    });
  }
};

// Get single menu
exports.getMenuById = async (req, res) => {
  try {
    const { id } = req.params;
    const menu = await Menu.findByPk(id);

    if (!menu) {
      return res.status(404).json({
        success: false,
        message: 'Menu not found'
      });
    }

    res.json({
      success: true,
      data: menu
    });
  } catch (error) {
    console.error('Get menu error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching menu'
    });
  }
};

// Create new menu (event type)
exports.createMenu = async (req, res) => {
  try {
    const { name, description, type, isActive, image } = req.body;

    // Validate required fields
    if (!name || !type) {
      return res.status(400).json({
        success: false,
        message: 'Name and type are required'
      });
    }

    // Create menu
    const menu = await Menu.create({
      name,
      description,
      type,
      isActive: isActive !== undefined ? isActive : true,
      image
    });

    res.status(201).json({
      success: true,
      message: 'Event type created successfully',
      data: menu
    });
  } catch (error) {
    console.error('Create menu error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while creating menu'
    });
  }
};

// Update menu
exports.updateMenu = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, type, isActive, image } = req.body;

    const menu = await Menu.findByPk(id);

    if (!menu) {
      return res.status(404).json({
        success: false,
        message: 'Menu not found'
      });
    }

    // Update menu details
    await menu.update({
      name: name || menu.name,
      description: description !== undefined ? description : menu.description,
      type: type || menu.type,
      isActive: isActive !== undefined ? isActive : menu.isActive,
      image: image !== undefined ? image : menu.image
    });

    res.json({
      success: true,
      message: 'Event type updated successfully',
      data: menu
    });
  } catch (error) {
    console.error('Update menu error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while updating menu'
    });
  }
};

// Delete menu
exports.deleteMenu = async (req, res) => {
  try {
    const { id } = req.params;

    const menu = await Menu.findByPk(id);

    if (!menu) {
      return res.status(404).json({
        success: false,
        message: 'Menu not found'
      });
    }

    // Delete menu
    await menu.destroy();

    res.json({
      success: true,
      message: 'Event type deleted successfully'
    });
  } catch (error) {
    console.error('Delete menu error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while deleting menu'
    });
  }
};
