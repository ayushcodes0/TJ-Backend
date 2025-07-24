const OutcomeSummary = require('../models/OutcomeSummary');

exports.getOutcomeSummaries = async (req, res) => {
  try {
    const outcomeSummaries = await OutcomeSummary.find({
      $or: [
        { is_default: true },
        { user_id: req.user._id }
      ]
    }).sort({ createdAt: 1 });
    res.json({
      data: outcomeSummaries,
      message: 'Outcome summaries fetched successfully',
      success: true,
      error: false
    });
  } catch (error) {
    console.error('[GetOutcomeSummaries] Error:', error.message);
    res.status(500).json({
      message: error.message,
      success: false,
      error: true
    });
  }
};

exports.addOutcomeSummary = async (req, res) => {
  try {
    const { label } = req.body;
    const existing = await OutcomeSummary.findOne({
      label,
      user_id: req.user._id,
      is_default: false
    });
    if (existing) {
      return res.status(409).json({
        message: 'Outcome summary already exists.',
        success: false,
        error: true
      });
    }
    const outcomeSummary = new OutcomeSummary({
      user_id: req.user._id,
      label,
      is_default: false
    });
    await outcomeSummary.save();
    res.status(201).json({
      data: outcomeSummary,
      message: 'Outcome summary added successfully',
      success: true,
      error: false
    });
  } catch (error) {
    console.error('[AddOutcomeSummary] Error:', error.message);
    res.status(400).json({
      message: error.message,
      success: false,
      error: true
    });
  }
};

