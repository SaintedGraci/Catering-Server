const { Settings } = require('../Models');

// Get settings (public - no auth required)
const getSettings = async (req, res) => {
  try {
    // There should only be one settings record
    let settings = await Settings.findOne();
    
    // If no settings exist, create default
    if (!settings) {
      settings = await Settings.create({});
    }

    res.json({
      success: true,
      data: settings
    });
  } catch (error) {
    console.error('Get settings error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching settings'
    });
  }
};

// Update settings (admin only)
const updateSettings = async (req, res) => {
  try {
    const {
      businessName,
      tagline,
      description,
      logo,
      email,
      phone,
      address,
      facebookUrl,
      instagramUrl,
      twitterUrl,
      businessHours,
      maintenanceMode,
      allowBookings,
      minGuestsDefault,
      maxGuestsDefault,
      metaTitle,
      metaDescription,
      metaKeywords,
      currency,
      currencySymbol,
      timezone
    } = req.body;

    // Get or create settings
    let settings = await Settings.findOne();
    
    if (!settings) {
      settings = await Settings.create(req.body);
    } else {
      await settings.update(req.body);
    }

    res.json({
      success: true,
      message: 'Settings updated successfully',
      data: settings
    });
  } catch (error) {
    console.error('Update settings error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while updating settings'
    });
  }
};

module.exports = {
  getSettings,
  updateSettings
};
