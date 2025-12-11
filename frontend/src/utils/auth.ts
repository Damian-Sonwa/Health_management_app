/**
 * Centralized authentication utilities
 * This ensures consistent token handling across the entire app
 */

/**
 * Get the authentication token from localStorage
 * Checks both 'token' and 'authToken' for backwards compatibility
 * @returns The auth token or null if not found
 */
export const getAuthToken = (): string | null => {
  // Primary key
  const token = localStorage.getItem('token');
  if (token) return token;
  
  // Fallback for backwards compatibility
  const authToken = localStorage.getItem('authToken');
  if (authToken) {
    // Sync the token to the primary key
    localStorage.setItem('token', authToken);
    return authToken;
  }
  
  return null;
};

/**
 * Set the authentication token in localStorage
 * Saves to both keys for compatibility
 * @param token The token to save
 */
export const setAuthToken = (token: string): void => {
  localStorage.setItem('token', token);
  localStorage.setItem('authToken', token); // Keep for backwards compatibility
};

/**
 * Remove the authentication token from localStorage
 * Clears both keys
 */
export const removeAuthToken = (): void => {
  localStorage.removeItem('token');
  localStorage.removeItem('authToken');
};

/**
 * Get the current user ID from localStorage
 * @returns The user ID or null if not found
 */
export const getUserId = (): string | null => {
  return localStorage.getItem('userId');
};

/**
 * Set the user ID in localStorage
 * @param userId The user ID to save
 */
export const setUserId = (userId: string): void => {
  localStorage.setItem('userId', userId);
};

/**
 * Remove the user ID from localStorage
 */
export const removeUserId = (): void => {
  localStorage.removeItem('userId');
};

/**
 * Get auth headers for API requests
 * @returns Headers object with Authorization header
 */
export const getAuthHeaders = (): Record<string, string> => {
  const token = getAuthToken();
  return {
    'Content-Type': 'application/json',
    ...(token && { 'Authorization': `Bearer ${token}` })
  };
};

/**
 * Clear all auth data from localStorage
 */
export const clearAuthData = (): void => {
  removeAuthToken();
  removeUserId();
  localStorage.removeItem('user');
};

