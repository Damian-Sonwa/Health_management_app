/**
 * Utility functions for role-based navigation
 */

export type UserRole = 'admin' | 'doctor' | 'pharmacy' | 'patient';

/**
 * Get the dashboard path based on user role
 * @param role - The user's role
 * @returns The dashboard path for the role
 */
export function getDashboardPath(role?: string | null): string {
  switch (role) {
    case 'admin':
      return '/admin-dashboard';
    case 'doctor':
      return '/doctor-dashboard';
    case 'pharmacy':
      return '/pharmacy-dashboard';
    case 'patient':
    default:
      return '/dashboard';
  }
}

/**
 * Get the onboarding path based on user role
 * Some roles may skip onboarding
 * @param role - The user's role
 * @returns The onboarding path or dashboard path
 */
export function getOnboardingPath(role?: string | null): string {
  // Admin, Doctor, and Pharmacy may skip onboarding
  if (role === 'admin' || role === 'doctor' || role === 'pharmacy') {
    return getDashboardPath(role);
  }
  // Patient goes to onboarding
  return '/onboarding';
}

