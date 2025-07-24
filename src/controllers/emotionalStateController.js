const EmotionalState = require('../models/EmotionalState');

exports.getEmotionalStates = async (req, res) => {
  try {
    const emotionalStates = await EmotionalState.find({
      $or: [
        { is_default: true },
        { user_id: req.user._id }
      ]
    }).sort({ createdAt: 1 });
    res.json({
      data: emotionalStates,
      message: 'Emotional states fetched successfully',
      success: true,
      error: false
    });
  } catch (error) {
    console.error('[GetEmotionalStates] Error:', error.message);
    res.status(500).json({
      message: error.message,
      success: false,
      error: true
    });
  }
};

exports.addEmotionalState = async (req, res) => {
  try {
    const { label } = req.body;
    const existing = await EmotionalState.findOne({
      label,
      user_id: req.user._id,
      is_default: false
    });
    if (existing) {
      return res.status(409).json({
        message: 'Emotion already exists.',
        success: false,
        error: true
      });
    }
    const emotionalState = new EmotionalState({
      user_id: req.user._id,
      label,
      is_default: false
    });
    await emotionalState.save();
    res.status(201).json({
      data: emotionalState,
      message: 'Emotional state added successfully',
      success: true,
      error: false
    });
  } catch (error) {
    console.error('[AddEmotionalState] Error:', error.message);
    res.status(400).json({
      message: error.message,
      success: false,
      error: true
    });
  }
};

