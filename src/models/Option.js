const mongoose = require('mongoose');

const optionSchema = new mongoose.Schema({
  // A null user_id means it's a default option available to everyone.
  user_id: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User',
    index: true, 
  },
  // This field tells us what kind of option this is.
  type: {
    type: String,
    required: true,
    enum: ['Strategy', 'OutcomeSummary', 'RulesFollowed', 'EmotionalState'],
    index: true,
  },
  name: {
    type: String,
    required: true,
  }
}, { timestamps: true });

// This compound index ensures a user cannot have two options 
// of the same type with the exact same name (e.g., two 'Breakout Strategy' entries).
optionSchema.index({ user_id: 1, type: 1, name: 1 }, { unique: true });

module.exports = mongoose.model('Option', optionSchema);
