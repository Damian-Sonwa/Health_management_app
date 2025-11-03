// Stub for removed useMongoData - no longer used
// Components should use specific hooks instead (useVitals, useMedications, etc.)

export function useMongoData() {
  return {
    userProfile: null,
    vitals: [],
    medications: [],
    loading: false,
    error: null,
  };
}

