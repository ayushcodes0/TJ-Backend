exports.updateSubscriptionStatus = async (user) => {
  if (
    user.subscription &&
    user.subscription.plan === 'pro' &&
    user.subscription.expiresAt &&
    new Date() > user.subscription.expiresAt
  ) {
    // Expired: downgrade to free
    user.subscription.plan = 'free';
    user.subscription.startedAt = null;
    user.subscription.expiresAt = null;
    await user.save();
  }
  // Optional: for enterprise plan, expand this logic.
  return user;
};
