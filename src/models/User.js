const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true, trim: true, index: true },
  name: {
    type: String,
  },
  email: { type: String, required: true, unique: true, trim: true },
  passwordHash: { type: String, required: true },
  isAdmin: { type: Boolean, default: false },
  avatar: { type: String, maxlength: 500 },
  subscription: {
    plan: { type: String, enum: ['free', 'pro'], default: 'free' },
    type: { type: String, enum: ['monthly', 'annual'], default: 'monthly' },
    startedAt: { type: Date },
    expiresAt: { type: Date }
  },
  profile: {
    displayName: { type: String },
    timezone: { type: String },
    preferences: { type: Object }
  },
  googleId: {
    type: String,
    unique: true,
    sparse: true
  },
  provider: {
    type: String,
    enum: ['google', 'local'],
    default: 'local'
  },
  createdAt: { type: Date, default: Date.now }
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);
