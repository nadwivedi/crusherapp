export const getUserFeatureAccess = (user) => ({
  saleReturn: Boolean(user?.featureAccess?.saleReturn),
  stockAdjustment: Boolean(user?.featureAccess?.stockAdjustment)
});

export const hasFeatureAccess = (user, featureKey) => Boolean(getUserFeatureAccess(user)[featureKey]);

export const isFeaturePathVisible = (user, path) => {
  if (path === '/sale-return' || path === '/reports/sale-return-report') {
    return hasFeatureAccess(user, 'saleReturn');
  }

  if (path === '/stock-adjustment' || path === '/stock-adjustments' || path === '/reports/stock-adjustment-report') {
    return hasFeatureAccess(user, 'stockAdjustment');
  }

  return true;
};

export const filterRestrictedItems = (items, user) => (
  (items || []).filter((item) => isFeaturePathVisible(user, item.path))
);
