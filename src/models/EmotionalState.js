const mongoose = require('mongoose');

const emotionalStateSchema = new mongoose.Schema({
  user_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null }, // null if system default
  label: { type: String, required: true },
  is_default: { type: Boolean, default: false }
}, { timestamps: true });

module.exports = mongoose.model('EmotionalState', emotionalStateSchema);
