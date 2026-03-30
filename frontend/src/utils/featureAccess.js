export const getUserFeatureAccess = (user) => ({
  saleReturn: true,
  stockAdjustment: true
});

export const hasFeatureAccess = (user, featureKey) => Boolean(getUserFeatureAccess(user)[featureKey]);

export const isFeaturePathVisible = () => true;

export const filterRestrictedItems = (items) => (items || []);
