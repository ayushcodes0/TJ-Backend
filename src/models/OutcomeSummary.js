const mongoose = require('mongoose');

const outcomeSummarySchema = new mongoose.Schema({
  user_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
  name: { type: String, required: true },
  is_default: { type: Boolean, default: false }
}, { timestamps: true });

module.exports = mongoose.model('OutcomeSummary', outcomeSummarySchema);
