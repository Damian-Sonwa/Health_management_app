import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { authAPI } from '@/lib/api';
import { setAuthToken, removeAuthToken, setUserId, removeUserId } from '@/utils/auth';

const FEATURE_PREVIEW_STORAGE_KEY = 'nuvia-feature-preview';

interface User {
  _id?: string;
  id: string;
  name: string;
  email: string;
  phone?: string;
  role?: 'patient' | 'pharmacy' | 'doctor' | 'admin' | string;
  profile?: {
    dateOfBirth?: string;
    gender?: string;
    bloodType?: string;
    allergies?: string[];
    emergencyContact?: {
      name: string;
      phone: string;
      relationship: string;
    };
    profilePicture?: string;
  };
  subscription?: {
    plan: string;
    status: string;
    trialEndDate?: string;
  };
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (email: string, password: string) => Promise<void>;
  register: (userData: { name: string; email: string; password: string; phone?: string; role?: string }) => Promise<void>;
  signIn: (email: string, password: string) => Promise<boolean>;
  signUp: (email: string, password: string, name: string) => Promise<boolean>;
  logout: () => void;
  updateUser: (userData: Partial<User>) => void;
  isAuthenticated: boolean;
  isAdmin: boolean;
  isPatient: boolean;
  isPharmacy: boolean;
  isDoctor: boolean;
  hasRole: (...roles: string[]) => boolean;
  featurePreviewEnabled: boolean;
  setFeaturePreviewEnabled: (enabled: boolean) => void;
  toggleFeaturePreview: () => void;
  loading: boolean;
  error: string | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  // Initialize loading based on whether we have cached auth (synchronous check)
  const [loading, setLoading] = useState(() => {
    // Check synchronously if we have auth data - if not, don't load
    const hasToken = !!localStorage.getItem('authToken') || !!localStorage.getItem('token');
    const hasUser = !!localStorage.getItem('user');
    return hasToken && hasUser; // Only load if we have both
  });
  const [error, setError] = useState<string | null>(null);
  const [featurePreviewEnabled, setFeaturePreviewEnabledState] = useState<boolean>(() => {
    return localStorage.getItem(FEATURE_PREVIEW_STORAGE_KEY) === 'true';
  });

  const isAdmin = user?.role === 'admin';
  const isPatient = user?.role === 'patient' || !user?.role; // Default to patient if no role
  const isPharmacy = user?.role === 'pharmacy';
  const isDoctor = user?.role === 'doctor';
  
  // Role checking utility
  const hasRole = (...roles: string[]): boolean => {
    if (!user?.role) return false;
    if (isAdmin) return true; // Admin has access to everything
    return roles.includes(user.role);
  };

  const applyFeaturePreviewState = (enabled: boolean) => {
    if (!isAdmin) {
      setFeaturePreviewEnabledState(false);
      localStorage.removeItem(FEATURE_PREVIEW_STORAGE_KEY);
      return;
    }
    setFeaturePreviewEnabledState(enabled);
    if (enabled) {
      localStorage.setItem(FEATURE_PREVIEW_STORAGE_KEY, 'true');
    } else {
      localStorage.removeItem(FEATURE_PREVIEW_STORAGE_KEY);
    }
  };

  useEffect(() => {
    // Set a maximum timeout to ensure loading never hangs indefinitely
    const maxTimeout = setTimeout(() => {
      console.warn('Auth initialization timeout - forcing loading to false');
      setLoading(false);
    }, 5000); // 5 second maximum

    const initAuth = async () => {
      try {
        const savedToken = localStorage.getItem('authToken') || localStorage.getItem('token');
        const savedUser = localStorage.getItem('user');

        // For new users (no token), immediately stop loading to show auth page
        if (!savedToken || !savedUser) {
          clearTimeout(maxTimeout);
          setToken(null);
          setUser(null);
          setLoading(false);
          return;
        }

        // Only verify token if user has existing session
        setToken(savedToken);
        // Ensure both keys are set
        localStorage.setItem('token', savedToken);
        localStorage.setItem('authToken', savedToken);
        
        // Safely parse user data
        let parsedUser = null;
        try {
          if (savedUser) {
            parsedUser = JSON.parse(savedUser);
            // Ensure user has an id field
            if (parsedUser && parsedUser._id && !parsedUser.id) {
              parsedUser.id = parsedUser._id;
            }
            if (parsedUser) {
              parsedUser.role = parsedUser.role || 'patient';
              setUser(parsedUser);
              // Ensure userId is set in localStorage
              const userId = parsedUser.id || parsedUser._id;
              if (userId) {
                localStorage.setItem('userId', userId);
              }
              localStorage.setItem('user', JSON.stringify(parsedUser));
            }
          }
        } catch (parseError) {
          console.error('Error parsing user data from localStorage:', parseError);
          clearTimeout(maxTimeout);
          // Clear corrupted user data
          localStorage.removeItem('user');
          setUser(null);
          setToken(null);
          setLoading(false);
          return;
        }
        
        // Stop loading immediately after setting user from localStorage (don't wait for API)
        clearTimeout(maxTimeout);
        setLoading(false);
        
        // Verify token is still valid (non-blocking, happens in background)
        // Use longer timeout for Render cold starts (30 seconds)
        const verificationController = new AbortController();
        const verificationTimeout = setTimeout(() => {
          verificationController.abort();
          console.warn('Token verification timeout - using cached user data');
        }, 30000);

        // Make API call in background - don't block UI
        authAPI.getCurrentUser()
          .then((response) => {
            clearTimeout(verificationTimeout);
            if (response.success) {
              const userData = response.user;
              // Ensure user has an id field
              if (userData._id && !userData.id) {
                userData.id = userData._id;
              }
              userData.role = userData.role || 'patient';
              setUser(userData);
              localStorage.setItem('user', JSON.stringify(userData));
            }
          })
          .catch((error) => {
            clearTimeout(verificationTimeout);
            console.error('Token verification failed:', error);
            
            // Only clear auth if it's an authentication error, not a network error
            if (error.message?.includes('401') || 
                error.message?.includes('Unauthorized') || 
                error.message?.includes('Invalid token') ||
                error.message?.includes('Authentication required')) {
              // Token is invalid, clear auth
              console.log('Token is invalid, clearing auth');
              localStorage.removeItem('authToken');
              localStorage.removeItem('token');
              localStorage.removeItem('user');
              setToken(null);
              setUser(null);
            } else {
              // Network error - keep cached data, user can still use app
              console.log('Network error during verification, keeping cached auth');
            }
          });
      } catch (error) {
        clearTimeout(maxTimeout);
        console.error('Auth initialization error:', error);
        setLoading(false);
      }
    };

    initAuth();
  }, []);

  const login = async (email: string, password: string) => {
    try {
      setLoading(true);
      setError(null);
      console.log('Attempting login for:', email);
      
      const response = await authAPI.login({ email, password });
      console.log('Login response:', response);
      
      if (response.success) {
        const { token: authToken, user: userData } = response;
        
        // Ensure user has an id field
        if (userData._id && !userData.id) {
          userData.id = userData._id;
        }
        userData.role = userData.role || 'patient';
        
        setToken(authToken);
        setUser(userData);
        
        setAuthToken(authToken);
        setUserId(userData.id || userData._id);
        localStorage.setItem('user', JSON.stringify(userData));
        
        console.log('Login successful, user:', userData);
      } else {
        throw new Error(response.message || 'Login failed');
      }
    } catch (error: any) {
      console.error('Login error:', error);
      const errorMessage = error.response?.data?.message || error.message || 'Login failed';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const register = async (userData: { name: string; email: string; password: string; phone?: string; role?: string }) => {
    try {
      setLoading(true);
      setError(null);
      console.log('Attempting registration for:', userData.email);
      
      const response = await authAPI.register(userData);
      console.log('Registration response:', response);
      
      if (response.success) {
        const { token: authToken, user: newUser } = response;
        
        // Ensure user has an id field
        if (newUser._id && !newUser.id) {
          newUser.id = newUser._id;
        }
        newUser.role = newUser.role || 'patient';
        
        setToken(authToken);
        setUser(newUser);
        
        setAuthToken(authToken);
        setUserId(newUser.id || newUser._id);
        localStorage.setItem('user', JSON.stringify(newUser));
        
        console.log('Registration successful, user:', newUser);
      } else {
        throw new Error(response.message || 'Registration failed');
      }
    } catch (error: any) {
      console.error('Registration error:', error);
      const errorMessage = error.response?.data?.message || error.message || 'Registration failed';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // Legacy methods for compatibility with AuthPage
  const signIn = async (email: string, password: string): Promise<boolean> => {
    try {
      await login(email, password);
      return true;
    } catch (error) {
      return false;
    }
  };

  const signUp = async (email: string, password: string, name: string): Promise<boolean> => {
    try {
      await register({ name, email, password });
      return true;
    } catch (error) {
      return false;
    }
  };

  const logout = () => {
    console.log('Logging out user');
    setUser(null);
    setToken(null);
    setError(null);
    setFeaturePreviewEnabledState(false);
    removeAuthToken();
    removeUserId();
    localStorage.removeItem('user');
    localStorage.removeItem(FEATURE_PREVIEW_STORAGE_KEY);
  };

  const updateUser = (userData: Partial<User>) => {
    if (user) {
      const updatedUser = { ...user, ...userData };
      // Ensure user has an id field
      if (updatedUser._id && !updatedUser.id) {
        updatedUser.id = updatedUser._id;
      }
      updatedUser.role = updatedUser.role || 'patient';
      setUser(updatedUser);
      localStorage.setItem('user', JSON.stringify(updatedUser));
    }
  };

  useEffect(() => {
    if (isAdmin) {
      const stored = localStorage.getItem(FEATURE_PREVIEW_STORAGE_KEY);
      if (stored === null) {
        localStorage.setItem(FEATURE_PREVIEW_STORAGE_KEY, 'true');
        setFeaturePreviewEnabledState(true);
      } else {
        setFeaturePreviewEnabledState(stored === 'true');
      }
    } else {
      setFeaturePreviewEnabledState(false);
      localStorage.removeItem(FEATURE_PREVIEW_STORAGE_KEY);
    }
  }, [isAdmin]);

  const value: AuthContextType = {
    user,
    token,
    login,
    register,
    signIn,
    signUp,
    logout,
    updateUser,
    isAuthenticated: !!token && !!user,
    isAdmin,
    isPatient,
    isPharmacy,
    isDoctor,
    hasRole,
    featurePreviewEnabled,
    setFeaturePreviewEnabled: applyFeaturePreviewState,
    toggleFeaturePreview: () => applyFeaturePreviewState(!featurePreviewEnabled),
    loading,
    error
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}