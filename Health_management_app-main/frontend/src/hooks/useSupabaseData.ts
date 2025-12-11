// Stub for removed useSupabaseData - app now uses MongoDB instead
// This file exists to prevent import errors

export function useSupabaseData() {
  return {
    subscription: null,
    shouldShowAds: false,
    updateSubscription: () => Promise.resolve(),
  };
}

