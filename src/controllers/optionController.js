const Option = require('../models/Option');

// @desc    Get all options for a specific type (e.g., 'Strategy') for the current user
// @route   GET /api/options?type=Strategy
// @access  Private
const getOptions = async (req, res) => {
  const { type } = req.query;

  if (!type) {
    return res.status(400).json({ message: 'Option type is required' });
  }

  try {
    // Find all options that are either default OR belong to the current user
    const options = await Option.find({
      type,
      $or: [{ user_id: null }, { user_id: req.user._id }]
    });

    res.status(200).json(options);
  } catch (error) {
    res.status(500).json({ message: 'Server Error' });
  }
};

// @desc    Create a new custom option for the current user
// @route   POST /api/options
// @access  Private
const createOption = async (req, res) => {
  const { name, type } = req.body;

  if (!name || !type) {
    return res.status(400).json({ message: 'Name and type are required' });
  }

  try {
    const newOption = new Option({
      name,
      type,
      user_id: req.user._id, // Attach the current user's ID
    });

    const savedOption = await newOption.save();
    res.status(201).json(savedOption);
  } catch (error) {
    // Handle potential duplicate key error
    if (error.code === 11000) {
      return res.status(409).json({ message: 'This option already exists for your profile.' });
    }
    res.status(500).json({ message: 'Server Error' });
  }
};

module.exports = { getOptions, createOption };
