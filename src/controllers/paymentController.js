const razorpay = require("../services/razorpayService");
const crypto = require("crypto");

const User = require("../models/User");
const ReferralRedemption = require("../models/ReferralRedemption");

// helper
const addDays = (date, days) => new Date(date.getTime() + days * 86400000);

const PLAN_PRICING = {
  monthly: 99,   // 👈 change based on your pricing
  annual: 799    // 👈 change based on your pricing
};

// ✅ Create Razorpay Order (secure)
const createOrder = async (req, res) => {
  try {
    const { userId, planType = "monthly" } = req.body;

    if (!userId) {
      return res.status(400).json({ success: false, message: "userId is required" });
    }

    if (!["monthly", "annual"].includes(planType)) {
      return res.status(400).json({ success: false, message: "Invalid planType" });
    }

    const user = await User.findById(userId).select("subscription referral");
    if (!user) return res.status(404).json({ success: false, message: "User not found" });

    const originalAmount = PLAN_PRICING[planType];

    let discountApplied = false;
    let discountPercent = 0;
    let finalAmount = originalAmount;

    // ✅ Apply referral discount only if unlocked
    if (user?.referral?.discountUnlocked === true && user?.referral?.discountPercent > 0) {
      discountApplied = true;
      discountPercent = user.referral.discountPercent; // usually 10
      finalAmount = Math.round(originalAmount * (1 - discountPercent / 100));
    }

    const options = {
      amount: finalAmount * 100, // paise
      currency: "INR",
      receipt: `receipt_${Date.now()}_${userId}`,
      notes: {
        userId: String(userId),
        plan: "Pro Subscription",
        planType,
        service: "TradeJournalAI",

        // ✅ store amounts for verification
        originalAmount: String(originalAmount),
        finalAmount: String(finalAmount),
        discountApplied: discountApplied ? "yes" : "no",
        discountPercent: String(discountPercent),
      },
    };

    const order = await razorpay.orders.create(options);

    res.json({
      success: true,
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
      keyId: process.env.RAZORPAY_KEY_ID,
      planType,
      discountApplied,
      discountPercent,
      payableAmount: finalAmount,
      originalAmount,
    });
  } catch (error) {
    console.error("Create Order Error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to create order",
      error: error.message,
    });
  }
};

// ✅ Verify Payment + Activate Subscription + Referral Reward
const verifyPayment = async (req, res) => {
  try {
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      userId,
      planType = "monthly"
    } = req.body;

    if (!userId) return res.status(400).json({ success: false, message: "userId required" });

    const body = razorpay_order_id + "|" + razorpay_payment_id;

    const expectedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(body.toString())
      .digest("hex");

    if (expectedSignature !== razorpay_signature) {
      return res.status(400).json({
        success: false,
        message: "Payment verification failed",
      });
    }

    // ✅ Payment verified
    const user = await User.findById(userId).select("subscription referral");
    if (!user) return res.status(404).json({ success: false, message: "User not found" });

    // ✅ Update subscription
    const now = new Date();
    const durationDays = planType === "annual" ? 365 : 30;

    // if already has subscription and not expired, extend from expiresAt
    let baseDate = now;
    if (user.subscription?.expiresAt && user.subscription.expiresAt > now) {
      baseDate = user.subscription.expiresAt;
    }

    user.subscription.plan = "pro";
    user.subscription.type = planType;
    user.subscription.startedAt = user.subscription.startedAt || now;
    user.subscription.expiresAt = addDays(baseDate, durationDays);

    // ✅ Consume referral discount after successful payment
    // (so coupon cannot be reused)
    let referralDiscountUsed = false;
    if (user?.referral?.discountUnlocked === true) {
      referralDiscountUsed = true;
      user.referral.discountUnlocked = false;
      user.referral.discountPercent = 0;
    }

    await user.save();

    // ✅ Reward referrer (only once)
    const redemption = await ReferralRedemption.findOne({
      referredUserId: user._id,
      rewardProcessed: false,
    });

    if (redemption) {
      const referrer = await User.findById(redemption.referrerUserId).select("subscription referral");
      if (referrer) {
        const refPlanType = referrer.subscription?.type || "monthly";
        const rewardDays = refPlanType === "annual" ? 30 : 7; // 🎁 choose reward (7 days per paid referral)

        // extend referrer subscription
        let refBase = new Date();
        if (referrer.subscription?.expiresAt && referrer.subscription.expiresAt > new Date()) {
          refBase = referrer.subscription.expiresAt;
        }

        // If referrer is still free but got reward, you can:
        // Option A: just extend expiresAt
        // Option B: also upgrade plan to pro
        referrer.subscription.plan = "pro";
        referrer.subscription.startedAt = referrer.subscription.startedAt || new Date();
        referrer.subscription.expiresAt = addDays(refBase, rewardDays);

        // update stats
        referrer.referral.stats.totalReferred += 1;
        referrer.referral.stats.totalRewardDays += rewardDays;

        await referrer.save();

        redemption.rewardProcessed = true;
        await redemption.save();
      }
    }

    return res.json({
      success: true,
      message: "Payment verified successfully",
      paymentId: razorpay_payment_id,
      subscription: user.subscription,
      referralDiscountUsed,
    });
  } catch (error) {
    console.error("Payment Verification Error:", error);
    res.status(500).json({
      success: false,
      message: "Payment verification failed",
      error: error.message,
    });
  }
};

// Get Payment Details
const getPaymentDetails = async (req, res) => {
  try {
    const { paymentId } = req.params;
    const payment = await razorpay.payments.fetch(paymentId);

    res.json({
      success: true,
      payment: payment,
    });
  } catch (error) {
    console.error("Get Payment Error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch payment details",
      error: error.message,
    });
  }
};

module.exports = {
  createOrder,
  verifyPayment,
  getPaymentDetails,
};
