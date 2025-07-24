const Strategy = require('../models/Strategy');

exports.getStrategies = async (req, res) => {
  try {
    const strategies = await Strategy.find({
      $or: [
        { is_default: true },
        { user_id: req.user._id }
      ]
    }).sort({ createdAt: 1 });
    res.json({
      data: strategies,
      message: 'Strategies fetched successfully',
      success: true,
      error: false
    });
  } catch (error) {
    console.error('[GetStrategies] Error:', error.message);
    res.status(500).json({
      message: error.message,
      success: false,
      error: true
    });
  }
};


exports.addStrategy = async (req, res) => {
  try {
    const { name, description } = req.body;
    // Prevent duplicate names for this user
    const existing = await Strategy.findOne({
      name,
      user_id: req.user._id,
      is_default: false
    });
    if (existing) {
      return res.status(409).json({
        message: 'Strategy already exists.',
        success: false,
        error: true
      });
    }

    const strategy = new Strategy({
      user_id: req.user._id,
      name,
      description,
      is_default: false
    });
    await strategy.save();
    res.status(201).json({
      data: strategy,
      message: 'Strategy added successfully',
      success: true,
      error: false
    });
  } catch (error) {
    console.error('[AddStrategy] Error:', error.message);
    res.status(400).json({
      message: error.message,
      success: false,
      error: true
    });
  }
};

