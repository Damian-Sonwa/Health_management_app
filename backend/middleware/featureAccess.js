const User = require('../models/User');

const parseAllowlist = (value) => {
  if (!value) return [];
  return value
    .split(',')
    .map((entry) => entry.trim().toLowerCase())
    .filter(Boolean);
};

const hasActivePremiumSubscription = (subscription) => {
  if (!subscription) return false;
  const isActive = subscription.status === 'active';
  const tier = (subscription.tier || subscription.plan || '').toLowerCase();
  return isActive && (tier === 'premium' || tier === 'family');
};

const ensurePremiumFeatureAccess = (featureKey = 'premium') => {
  const betaAllowList = parseAllowlist(
    featureKey === 'telehealth'
      ? process.env.TELEHEALTH_BETA_USERS || process.env.TELEHEALTH_FEATURE_ALLOWLIST
      : process.env.FEATURE_PREVIEW_ALLOWLIST
  );

  return async (req, res, next) => {
    try {
      const user = await User.findById(req.user.userId).select('role email subscription');

      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'User not found',
        });
      }

      const isAdmin = user.role === 'admin';
      const hasPremium = hasActivePremiumSubscription(user.subscription);
      const identifierMatches =
        betaAllowList.includes((user.email || '').toLowerCase()) ||
        betaAllowList.includes(String(user._id));

      if (!isAdmin && !hasPremium && !identifierMatches) {
        return res.status(403).json({
          success: false,
          message: 'Premium subscription required for this feature',
        });
      }

      req.user.role = user.role;
      req.user.isAdmin = isAdmin;
      req.user.subscription = user.subscription;

      next();
    } catch (error) {
      console.error('Premium access middleware error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to verify feature access',
      });
    }
  };
};

module.exports = {
  ensurePremiumFeatureAccess,
  hasActivePremiumSubscription,
};

