const mongoose = require("mongoose");

const referralRedemptionSchema = new mongoose.Schema(
  {
    referredUserId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, unique: true },
    referrerUserId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },

    couponCode: { type: String, required: true },

    discountPercent: { type: Number, default: 10 },

    rewardProcessed: { type: Boolean, default: false }, // reward after payment success
    createdAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

module.exports = mongoose.model("ReferralRedemption", referralRedemptionSchema);
