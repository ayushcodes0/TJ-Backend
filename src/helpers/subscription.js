// subscription.js - Update the helper function
exports.updateSubscriptionStatus = async (user) => {
  if (
    user.subscription &&
    user.subscription.plan === 'pro' &&
    user.subscription.expiresAt &&
    new Date() > user.subscription.expiresAt
  ) {
    // Expired: downgrade to free
    user.subscription.plan = 'free';
    user.subscription.type = 'monthly'; // Reset type as well
    user.subscription.startedAt = null;
    user.subscription.expiresAt = null;
    await user.save();
  }
  return user;
};