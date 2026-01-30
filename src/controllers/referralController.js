const User = require("../models/User");
const ReferralRedemption = require("../models/ReferralRedemption");

// POST /api/referral/apply
exports.applyReferralCode = async (req, res) => {
  try {
    const userId = req.user._id; // from auth middleware
    const { code } = req.body;

    if (!code) return res.status(400).json({ message: "Referral code is required" });

    const currentUser = await User.findById(userId);
    if (!currentUser) return res.status(404).json({ message: "User not found" });

    if (currentUser.referral?.discountUnlocked)
      return res.status(400).json({ message: "Referral already applied" });

    const referrer = await User.findOne({ "referral.code": code.trim().toUpperCase() });

    if (!referrer) return res.status(400).json({ message: "Invalid referral code" });

    if (referrer._id.toString() === currentUser._id.toString())
      return res.status(400).json({ message: "You cannot use your own referral code" });

    // prevent multiple redemptions
    const already = await ReferralRedemption.findOne({ referredUserId: currentUser._id });
    if (already) return res.status(400).json({ message: "Referral already applied" });

    await ReferralRedemption.create({
      referredUserId: currentUser._id,
      referrerUserId: referrer._id,
      couponCode: code.trim().toUpperCase(),
      discountPercent: 10,
    });

    currentUser.referral.referredBy = referrer._id;
    currentUser.referral.discountUnlocked = true;
    currentUser.referral.discountPercent = 10;
    currentUser.referral.redeemedAt = new Date();

    await currentUser.save();

    res.json({
      message: "🎉 Coupon applied! You unlocked 10% discount.",
      discountPercent: 10,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Something went wrong" });
  }
};


exports.generateReferralCode = async (req, res) => {
  try {
    const userId = req.user._id;

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    // Already has code
    if (user.referral?.code) {
      return res.json({
        message: "Referral code already exists",
        code: user.referral.code
      });
    }

    // Trigger pre-save hook to generate code
    user.markModified("referral");
    await user.save();

    return res.json({
      message: "Referral code generated successfully",
      code: user.referral.code
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to generate referral code" });
  }
};


// GET /api/referral/me
exports.getMyReferral = async (req, res) => {
  const userId = req.user._id;
  const user = await User.findById(userId).select("referral username subscription");
  res.json({ referral: user.referral, subscription: user.subscription, username: user.username });
};
