import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { authAPI } from '@/lib/api';
import { setAuthToken, removeAuthToken, setUserId, removeUserId } from '@/utils/auth';

interface User {
  _id?: string;
  id: string;
  name: string;
  email: string;
  phone?: string;
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
  register: (userData: { name: string; email: string; password: string; phone?: string }) => Promise<void>;
  signIn: (email: string, password: string) => Promise<boolean>;
  signUp: (email: string, password: string, name: string) => Promise<boolean>;
  logout: () => void;
  updateUser: (userData: Partial<User>) => void;
  isAuthenticated: boolean;
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
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const initAuth = async () => {
      try {
        const savedToken = localStorage.getItem('authToken') || localStorage.getItem('token');
        const savedUser = localStorage.getItem('user');

        if (savedToken && savedUser) {
          setToken(savedToken);
          // Ensure both keys are set
          localStorage.setItem('token', savedToken);
          localStorage.setItem('authToken', savedToken);
          const parsedUser = JSON.parse(savedUser);
          // Ensure user has an id field
          if (parsedUser._id && !parsedUser.id) {
            parsedUser.id = parsedUser._id;
          }
          setUser(parsedUser);
          // Ensure userId is set in localStorage
          localStorage.setItem('userId', parsedUser.id || parsedUser._id);
          
          // Verify token is still valid
          try {
            const response = await authAPI.getCurrentUser();
            if (response.success) {
              const userData = response.user;
              // Ensure user has an id field
              if (userData._id && !userData.id) {
                userData.id = userData._id;
              }
              setUser(userData);
              localStorage.setItem('user', JSON.stringify(userData));
            }
          } catch (error) {
            console.error('Token verification failed:', error);
            // Token is invalid, clear auth
            localStorage.removeItem('authToken');
            localStorage.removeItem('user');
            setToken(null);
            setUser(null);
          }
        }
      } catch (error) {
        console.error('Auth initialization error:', error);
      } finally {
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

  const register = async (userData: { name: string; email: string; password: string; phone?: string }) => {
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
    removeAuthToken();
    removeUserId();
    localStorage.removeItem('user');
  };

  const updateUser = (userData: Partial<User>) => {
    if (user) {
      const updatedUser = { ...user, ...userData };
      // Ensure user has an id field
      if (updatedUser._id && !updatedUser.id) {
        updatedUser.id = updatedUser._id;
      }
      setUser(updatedUser);
      localStorage.setItem('user', JSON.stringify(updatedUser));
    }
  };

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