const mongoose = require('mongoose');

const MISTAKE_OPTIONS = [
  "Overtrading", "Risk too much", "Exited too late", "Ignored signals",
  "Ignored stop loss", "Revenge trading", "Exited too early", "Fomo entry",
  "No clear plan", "No mistakes"
];

const psychologySchema = new mongoose.Schema({
  entry_confidence_level: { type: Number, min: 1, max: 10 },
  satisfaction_rating: { type: Number, min: 1, max: 10 },
  emotional_state: { type: mongoose.Schema.Types.ObjectId, ref: 'Option' },
  mistakes_made: [{ type: String, enum: MISTAKE_OPTIONS }],
  lessons_learned: { type: String }
}, { _id: false });

const tradeSchema = new mongoose.Schema({
  user_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  symbol: { type: String, required: true, index: true },
  date: { type: Date, required: true, index: true },
  quantity: { type: Number, required: true },
  total_amount: { type: Number },
  entry_price: { type: Number },
  exit_price: { type: Number },
  direction: { type: String, enum: ['Long', 'Short'], required: true },
  stop_loss: { type: Number },
  target: { type: Number },
  strategy: { type: mongoose.Schema.Types.ObjectId, ref: 'Option', required: true },
  trade_analysis: { type: String },
  outcome_summary: { type: mongoose.Schema.Types.ObjectId, ref: 'Option', required: true },
  rules_followed: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Option' }],
  pnl_amount: { type: Number },
  pnl_percentage: { type: Number },
  holding_period_minutes: { type: Number },
  tags: [{ type: String }],
  psychology: psychologySchema,
}, { timestamps: true });

tradeSchema.index({ user_id: 1, date: -1 });

module.exports = mongoose.model('Trade', tradeSchema);
