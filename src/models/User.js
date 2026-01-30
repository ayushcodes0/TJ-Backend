const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    username: { type: String, required: true, unique: true, trim: true, index: true },
    name: { type: String },
    email: { type: String, required: true, unique: true, trim: true },
    passwordHash: { type: String, required: true },
    isAdmin: { type: Boolean, default: false },
    avatar: { type: String, maxlength: 500 },

    subscription: {
      plan: { type: String, enum: ["free", "pro"], default: "free" },
      type: { type: String, enum: ["monthly", "annual"], default: "monthly" },
      startedAt: { type: Date },
      expiresAt: { type: Date },
    },

    profile: {
      displayName: { type: String },
      timezone: { type: String },
      preferences: { type: Object },
    },

    googleId: {
      type: String,
      unique: true,
      sparse: true,
    },
    provider: {
      type: String,
      enum: ["google", "local"],
      default: "local",
    },

    // ✅ Referral System
    referral: {
      code: { type: String, unique: true, index: true }, // e.g. AJ8K2Q
      referredBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },

      // applied coupon details (for this user)
      redeemedAt: { type: Date },
      discountUnlocked: { type: Boolean, default: false },
      discountPercent: { type: Number, default: 0 },

      // referrer stats
      stats: {
        totalReferred: { type: Number, default: 0 },
        totalPaidReferrals: { type: Number, default: 0 },
        totalRewardDays: { type: Number, default: 0 },
      },
    },

    createdAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

// Avoid duplicate null referral.code
userSchema.index({ "referral.code": 1 }, { unique: true, sparse: true });


function generateReferralCode(username = "") {
  const base = username
    .toUpperCase()
    .replace(/[^A-Z0-9]/g, "")
    .slice(0, 6);

  const rand = Math.random().toString(36).substring(2, 6).toUpperCase();

  return (base || "TJ") + rand; // ex: AYUSHK9F2
}

userSchema.pre("save", function (next) {
  if (!this.referral) this.referral = {};
  if (!this.referral.code) {
    this.referral.code = generateReferralCode(this.username);
  }
  next();
});


module.exports = mongoose.model("User", userSchema);
