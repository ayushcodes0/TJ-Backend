const Trade = require('../models/Trade');

// Create a new trade
exports.createTrade = async (req, res) => {
  try {
    const trade = new Trade({ ...req.body, user_id: req.user._id });
    await trade.save();
    res.status(201).json({
        data: trade,
        message: 'Trade created successfully',
        success: true,
        error: false,
    });
  } catch (error) {
    console.error('[CreateTrade] Error:', error.message);
    res.status(400).json({
        message: error.message,
        success: false,
        error: true,
    });
  }
};

// Get all trades for logged-in user
exports.getTrades = async (req, res) => {
  try {
    const trades = await Trade.find({ user_id: req.user._id }).sort({ date: -1 });
    res.status(200).json({
        data: trades,
        message: 'Trades retrieved successfully',
        success: true,
        error: false,
    })
  } catch (error) {
    console.error('[GetTrades] Error:', error.message);
    res.status(500).json({
        message: error.message,
        success: false,
        error: true,
    });
  }
};

// Get a single trade by ID
exports.getTradeById = async (req, res) => {
  try {
    const trade = await Trade.findOne({ _id: req.params.id, user_id: req.user._id });
    if (!trade) {
      console.warn(`[GetTradeById] Trade not found: ${req.params.id}`);
      return res.status(404).json({
        error: 'Trade not found',
        success: false,
        error: true,
      });
    }
    res.json({
        data: trade,
        message: 'Trade retrieved successfully',
        success: true,
        error: false,
    });
  } catch (error) {
    console.error('[GetTradeById] Error:', error.message);
    res.status(500).json({
        message: error.message,
        success: false,
        error: true,
    });
  }
};

// Update a trade
exports.updateTrade = async (req, res) => {
  try {
    const trade = await Trade.findOneAndUpdate(
      { _id: req.params.id, user_id: req.user._id },
      req.body,
      { new: true }
    );
    if (!trade) {
      console.warn(`[UpdateTrade] Trade not found: ${req.params.id}`);
      return res.status(404).json({
        error: 'Trade not found',
        success: false,
        error: true,
      });
    }
    res.json({
        data: trade,
        message: 'Trade updated successfully',
        success: true,
        error: false,
    });
  } catch (error) {
    console.error('[UpdateTrade] Error:', error.message);
    res.status(400).json({
        message: error.message,
        success: false,
        error: true,
    });
  }
};

// Delete a trade
exports.deleteTrade = async (req, res) => {
  try {
    const result = await Trade.findOneAndDelete({ _id: req.params.id, user_id: req.user._id });
    if (!result) {
      console.warn(`[DeleteTrade] Trade not found: ${req.params.id}`);
      return res.status(404).json({
        error: 'Trade not found',
        success: false,
        error: true,
      });
    }
    res.json({
        message: 'Trade deleted successfully',
        success: true,
        error: false,
    });
  } catch (error) {
    console.error('[DeleteTrade] Error:', error.message);
    res.status(500).json({
        message: error.message,
        success: false,
        error: true,
    });
  }
};
