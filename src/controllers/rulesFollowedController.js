const RulesFollowed = require('../models/RulesFollowed');

exports.getRules = async (req, res) => {
  try {
    const rules = await RulesFollowed.find({
      $or: [
        { is_default: true },
        { user_id: req.user._id }
      ]
    }).sort({ createdAt: 1 });
    res.json({
      data: rules,
      message: 'Rules fetched successfully',
      success: true,
      error: false
    });
  } catch (error) {
    console.error('[GetRules] Error:', error.message);
    res.status(500).json({
      message: error.message,
      success: false,
      error: true
    });
  }
};

exports.addRule = async (req, res) => {
  try {
    const { label } = req.body;
    const existing = await RulesFollowed.findOne({
      label,
      user_id: req.user._id,
      is_default: false
    });
    if (existing) {
      return res.status(409).json({
        message: 'Rule already exists.',
        success: false,
        error: true
      });
    }
    const rule = new RulesFollowed({
      user_id: req.user._id,
      label,
      is_default: false
    });
    await rule.save();
    res.status(201).json({
      data: rule,
      message: 'Rule added successfully',
      success: true,
      error: false
    });
  } catch (error) {
    console.error('[AddRule] Error:', error.message);
    res.status(400).json({
      message: error.message,
      success: false,
      error: true
    });
  }
};

