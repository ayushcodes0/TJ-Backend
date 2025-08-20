const Trade = require('../models/Trade');
const mongoose = require('mongoose');


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


exports.getTrades = async (req, res) => {
  try {
    const { filter, year, month, day, week, limit, page } = req.query;
    let dateFilter = {};

    // Date filter logic
    switch (filter) {
      case 'day':
        if (year && month && day) {
          const start = new Date(Date.UTC(year, month - 1, day));
          const end = new Date(Date.UTC(year, month - 1, day, 23, 59, 59, 999));
          dateFilter = { date: { $gte: start, $lte: end } };
        }
        break;
      case 'week':
        if (year && week) {
          // Calculate start of the week (ISO week number)
          const startOfYear = new Date(Date.UTC(year, 0, 1));
          const startOfWeek = new Date(startOfYear);
          startOfWeek.setUTCDate(startOfYear.getUTCDate() + (week - 1) * 7);
          
          const endOfWeek = new Date(startOfWeek);
          endOfWeek.setUTCDate(startOfWeek.getUTCDate() + 6);
          endOfWeek.setUTCHours(23, 59, 59, 999);
          
          dateFilter = { date: { $gte: startOfWeek, $lte: endOfWeek } };
        }
        break;
      case 'month':
        if (year && month) {
          const start = new Date(Date.UTC(year, month - 1, 1));
          const end = new Date(Date.UTC(year, month, 1));
          dateFilter = { date: { $gte: start, $lt: end } };
        }
        break;
      case 'year':
        if (year) {
          const start = new Date(Date.UTC(year, 0, 1));
          const end = new Date(Date.UTC(parseInt(year) + 1, 0, 1));
          dateFilter = { date: { $gte: start, $lt: end } };
        }
        break;
      default:
        // 'lifetime' or any other value
        dateFilter = {};
    }

    const query = { user_id: req.user._id, ...dateFilter };

    const safeLimit = Math.min(100, parseInt(limit) || 20);
    const safePage = parseInt(page) || 1;
    const skip = (safePage - 1) * safeLimit;

    // Execute queries in parallel
    const [trades, total] = await Promise.all([
      Trade.find(query)
        .populate('strategy', 'name type')
        .populate('outcome_summary', 'name type')
        .populate('rules_followed', 'name type')
        .populate('psychology.emotional_state', 'name type')
        .sort({ date: -1 })
        .skip(skip)
        .limit(safeLimit)
        .lean(),
      Trade.countDocuments(query)
    ]);

    res.json({
      data: trades,
      meta: {
        page: safePage,
        limit: safeLimit,
        total,
        totalPages: Math.ceil(total / safeLimit),
      },
      message: 'Trades retrieved successfully',
      success: true,
      error: false,
    });
  } catch (error) {
    console.error('[getTrades] Error:', error.message);
    res.status(500).json({
      message: 'An internal server error occurred.',
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


exports.getTradeStats = async (req, res) => {
  try {
    const { filter, year, month, day } = req.query;
    const userId = req.user._id;

    const userIdObj = new mongoose.Types.ObjectId(userId);
    let dateFilter = {};

    if (filter === 'day' && year && month && day) {
      const start = new Date(Date.UTC(year, month - 1, day, 0, 0, 0));
      const end = new Date(Date.UTC(year, month - 1, day, 23, 59, 59, 999));
      dateFilter.date = { $gte: start, $lte: end };
    } else if (filter === 'month' && year && month) {
      const start = new Date(Date.UTC(year, month - 1, 1, 0, 0, 0));
      const end = new Date(Date.UTC(year, month, 1, 0, 0, 0));
      dateFilter.date = { $gte: start, $lt: end };
    } else if (filter === 'year' && year) {
      const start = new Date(Date.UTC(year, 0, 1, 0, 0, 0));
      const end = new Date(Date.UTC(parseInt(year) + 1, 0, 1, 0, 0, 0));
      dateFilter.date = { $gte: start, $lt: end };
    }

    const finalFilter = { 
      user_id: userIdObj,
      ...dateFilter 
    };

    // Aggregation Pipeline
    const pipeline = [
      { $match: finalFilter },
      {
        $facet: {
          totalTrades: [{ $count: "count" }],
          winCount: [{ $match: { pnl_amount: { $gt: 0 } } }, { $count: "count" }],
          lossCount: [{ $match: { pnl_amount: { $lt: 0 } } }, { $count: "count" }],
          totalPnl: [{ $group: { _id: null, total: { $sum: "$pnl_amount" } }}],
          avgPnl: [{ $group: { _id: null, avg: { $avg: "$pnl_amount" } } }],
          mistakeFreq: [
            { $unwind: "$psychology.mistakes_made" }, // Updated path to psychology
            { $group: { _id: "$psychology.mistakes_made", count: { $sum: 1 } } },
            { $sort: { count: -1 } }
          ],
          strategyFreq: [
            { $group: { 
              _id: "$strategy", 
              count: { $sum: 1 },
              avgPnl: { $avg: "$pnl_amount" }
            }},
            { $sort: { count: -1 } }
          ],
          emotionalStates: [
            { $group: {
              _id: "$psychology.emotional_state",
              count: { $sum: 1 },
              avgPnl: { $avg: "$pnl_amount" }
            }}
          ]
        }
      }
    ];

    // Execute aggregation
    const [stats] = await Trade.aggregate(pipeline);

    // Format response
    const response = {
      data: {
        totalTrades: stats.totalTrades[0]?.count || 0,
        winCount: stats.winCount[0]?.count || 0,
        lossCount: stats.lossCount[0]?.count || 0,
        winRate: stats.totalTrades[0]?.count 
          ? (stats.winCount[0]?.count / stats.totalTrades[0].count * 100).toFixed(2) 
          : 0,
        totalPnl: stats.totalPnl[0]?.total || 0,
        avgPnl: stats.avgPnl[0]?.avg ? Number(stats.avgPnl[0].avg.toFixed(2)) : 0,
        mistakeFreq: stats.mistakeFreq || [],
        strategyFreq: stats.strategyFreq || [],
        emotionalStates: stats.emotionalStates || []
      },
      meta: {
        filter,
        dateRange: dateFilter.date || 'all time',
        userId: userId
      },
      success: true,
      error: false
    };

    res.json(response);

  } catch (error) {
    console.error('[getTradeStats] Error:', error);
    res.status(500).json({
      message: error.message,
      success: false,
      error: true
    });
  }
};

