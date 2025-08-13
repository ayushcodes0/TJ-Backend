// controllers/optionController.js

const Option = require('../models/Option');

// @desc    Get all options for a specific type (e.g., 'Strategy') for the current user
// @route   GET /api/options?type=Strategy
// @access  Private
const getOptions = async (req, res) => {
  // --- FIX 1: Add a safety check to ensure req.user exists before proceeding ---
  // This is the primary fix for the 500 Internal Server Error.
  if (!req.user || !req.user._id) {
    return res.status(401).json({ message: 'Not authorized, user not found or token invalid.' });
  }

  const { type } = req.query;

  // --- FIX 2: Add validation for the 'type' query parameter ---
  const allowedTypes = ['Strategy', 'OutcomeSummary', 'RulesFollowed', 'EmotionalState'];
  if (!type || !allowedTypes.includes(type)) {
    return res.status(400).json({ message: 'A valid option type is required in the query.' });
  }

  try {
    // This query is now safe because we've confirmed req.user._id exists.
    const options = await Option.find({
      type,
      $or: [{ user_id: null }, { user_id: req.user._id }]
    });

    res.status(200).json(options);
  } catch (error) {
    console.error('Server Error in getOptions:', error); // Log the error for debugging
    res.status(500).json({ message: 'Server Error' });
  }
};

// @desc    Create a new custom option for the current user
// @route   POST /api/options
// @access  Private
const createOption = async (req, res) => {
  // --- FIX 3: Also add the safety check here for security and consistency ---
  if (!req.user || !req.user._id) {
    return res.status(401).json({ message: 'Not authorized' });
  }

  const { name, type } = req.body;

// controllers/optionController.js
const allowedCreationTypes = ['Strategy', 'RulesFollowed', 'EmotionalState'];
  if (!name || !type || !allowedCreationTypes.includes(type)) {
    return res.status(400).json({ message: 'A valid name and type (Strategy or RulesFollowed) are required.' });
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
    console.error('Server Error in createOption:', error);
    // Handle potential duplicate key error from the index in your model
    if (error.code === 11000) {
      return res.status(409).json({ message: 'This option already exists.' });
    }
    res.status(500).json({ message: 'Server Error' });
  }
};

module.exports = { getOptions, createOption };
