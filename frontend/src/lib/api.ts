import { API_BASE_URL, getAuthHeaders, handleApiResponse } from '@/config/api';

// Auth API calls
export const authAPI = {
  login: async (credentials: { email: string; password: string }) => {
    try {
      console.log('🔐 LOGIN ATTEMPT:', {
        url: `${API_BASE_URL}/auth/login`,
        email: credentials.email
      });
      
      // Add timeout for mobile networks (15 seconds for login)
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 15000);
      
      try {
        // Don't send old auth tokens when logging in - use fresh headers
        const response = await fetch(`${API_BASE_URL}/auth/login`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(credentials),
          signal: controller.signal,
        });
        
        clearTimeout(timeoutId);
        console.log('📡 Response status:', response.status, response.statusText);
        
        const result = await handleApiResponse(response);
        console.log('✅ Login API result:', result);
        
        return result;
      } catch (fetchError: any) {
        clearTimeout(timeoutId);
        if (fetchError.name === 'AbortError') {
          throw new Error('Login request timed out. Please check your connection and try again.');
        }
        throw fetchError;
      }
    } catch (error: any) {
      console.error('❌ Login error details:', {
        message: error.message,
        error: error,
        stack: error.stack
      });
      throw new Error(error.message || 'Login failed. Please check your connection.');
    }
  },

  signup: async (userData: {
    name: string;
    email: string;
    password: string;
    phone?: string;
  }) => {
    try {
      // Don't send old auth tokens when signing up - use fresh headers
      const response = await fetch(`${API_BASE_URL}/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(userData),
      });
      return handleApiResponse(response);
    } catch (error: any) {
      console.error('Signup error:', error);
      throw new Error(error.message || 'Signup failed. Please try again.');
    }
  },

  register: async (userData: {
    name: string;
    email: string;
    password: string;
    phone?: string;
  }) => {
    try {
      // Don't send old auth tokens when registering - use fresh headers
      const response = await fetch(`${API_BASE_URL}/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(userData),
      });
      return handleApiResponse(response);
    } catch (error: any) {
      console.error('Register error:', error);
      throw new Error(error.message || 'Registration failed. Please try again.');
    }
  },

  getCurrentUser: async () => {
    try {
      // Add timeout for mobile networks (5 seconds - shorter for faster failure)
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000);
      
      try {
        const response = await fetch(`${API_BASE_URL}/auth/me`, {
          method: 'GET',
          headers: getAuthHeaders(),
          signal: controller.signal,
        });
        clearTimeout(timeoutId);
        return handleApiResponse(response);
      } catch (fetchError: any) {
        clearTimeout(timeoutId);
        if (fetchError.name === 'AbortError') {
          throw new Error('Request timeout - please check your connection');
        }
        throw fetchError;
      }
    } catch (error: any) {
      console.error('Get current user error:', error);
      throw error;
    }
  },

  logout: async () => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('user');
    window.location.href = '/auth';
  }
};

// Users API calls
export const usersAPI = {
  getAll: async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/users`, {
        method: 'GET',
        headers: getAuthHeaders(),
      });
      return handleApiResponse(response);
    } catch (error: any) {
      console.error('Failed to fetch users:', error);
      throw error;
    }
  },

  getProfile: async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/users/profile`, {
        method: 'GET',
        headers: getAuthHeaders(),
      });
      return handleApiResponse(response);
    } catch (error: any) {
      console.error('Failed to fetch profile:', error);
      throw error;
    }
  },

  updateProfile: async (profileData: any) => {
    try {
      const response = await fetch(`${API_BASE_URL}/users/profile`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify(profileData),
      });
      return handleApiResponse(response);
    } catch (error: any) {
      console.error('Failed to update profile:', error);
      throw error;
    }
  },
};

// Vitals API calls
export const vitalsAPI = {
  getAll: async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/vitals`, {
        method: 'GET',
        headers: getAuthHeaders(),
      });
      return handleApiResponse(response);
    } catch (error: any) {
      console.error('Failed to fetch vitals:', error);
      throw error;
    }
  },

  create: async (vitalData: {
    bloodPressure: string;
    pulse: string;
    temperature: string;
    notes?: string;
  }) => {
    try {
      const response = await fetch(`${API_BASE_URL}/vitals`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(vitalData),
      });
      return handleApiResponse(response);
    } catch (error: any) {
      console.error('Failed to create vital:', error);
      throw error;
    }
  },

  update: async (id: string, vitalData: any) => {
    try {
      const response = await fetch(`${API_BASE_URL}/vitals/${id}`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify(vitalData),
      });
      return handleApiResponse(response);
    } catch (error: any) {
      console.error('Failed to update vital:', error);
      throw error;
    }
  },

  delete: async (id: string) => {
    try {
      const response = await fetch(`${API_BASE_URL}/vitals/${id}`, {
        method: 'DELETE',
        headers: getAuthHeaders(),
      });
      return handleApiResponse(response);
    } catch (error: any) {
      console.error('Failed to delete vital:', error);
      throw error;
    }
  },
};

// Medications API calls
export const medicationsAPI = {
  getAll: async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/medications`, {
        method: 'GET',
        headers: getAuthHeaders(),
      });
      return handleApiResponse(response);
    } catch (error: any) {
      console.error('Failed to fetch medications:', error);
      throw error;
    }
  },

  create: async (medicationData: any) => {
    try {
      const response = await fetch(`${API_BASE_URL}/medications`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(medicationData),
      });
      return handleApiResponse(response);
    } catch (error: any) {
      console.error('Failed to create medication:', error);
      throw error;
    }
  },

  update: async (id: string, medicationData: any) => {
    try {
      const response = await fetch(`${API_BASE_URL}/medications/${id}`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify(medicationData),
      });
      return handleApiResponse(response);
    } catch (error: any) {
      console.error('Failed to update medication:', error);
      throw error;
    }
  },

  delete: async (id: string) => {
    try {
      const response = await fetch(`${API_BASE_URL}/medications/${id}`, {
        method: 'DELETE',
        headers: getAuthHeaders(),
      });
      return handleApiResponse(response);
    } catch (error: any) {
      console.error('Failed to delete medication:', error);
      throw error;
    }
  },

  submitRequest: async (requestData: any) => {
    try {
      const response = await fetch(`${API_BASE_URL}/medications/request`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(requestData),
      });
      return handleApiResponse(response);
    } catch (error: any) {
      console.error('Failed to submit medication request:', error);
      throw error;
    }
  },
};

// Care Plans API calls
export const carePlansAPI = {
  getAll: async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/careplan`, {
        method: 'GET',
        headers: getAuthHeaders(),
      });
      return handleApiResponse(response);
    } catch (error: any) {
      console.error('Failed to fetch care plans:', error);
      throw error;
    }
  },

  create: async (carePlanData: any) => {
    try {
      const response = await fetch(`${API_BASE_URL}/careplan`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(carePlanData),
      });
      return handleApiResponse(response);
    } catch (error: any) {
      console.error('Failed to create care plan:', error);
      throw error;
    }
  },

  update: async (id: string, carePlanData: any) => {
    try {
      const response = await fetch(`${API_BASE_URL}/careplan/${id}`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify(carePlanData),
      });
      return handleApiResponse(response);
    } catch (error: any) {
      console.error('Failed to update care plan:', error);
      throw error;
    }
  },
};

// Telehealth API calls
export const telehealthAPI = {
  getAll: async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/telehealth`, {
        method: 'GET',
        headers: getAuthHeaders(),
      });
      return handleApiResponse(response);
    } catch (error: any) {
      console.error('Failed to fetch telehealth data:', error);
      throw error;
    }
  },

  scheduleAppointment: async (appointmentData: any) => {
    try {
      const response = await fetch(`${API_BASE_URL}/telehealth/appointments`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(appointmentData),
      });
      return handleApiResponse(response);
    } catch (error: any) {
      console.error('Failed to schedule appointment:', error);
      throw error;
    }
  },

  updateAppointment: async (id: string, appointmentData: any) => {
    try {
      const response = await fetch(`${API_BASE_URL}/telehealth/appointments/${id}`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify(appointmentData),
      });
      return handleApiResponse(response);
    } catch (error: any) {
      console.error('Failed to update appointment:', error);
      throw error;
    }
  },
};

// Wellness API calls
export const wellnessAPI = {
  getAll: async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/wellness`, {
        method: 'GET',
        headers: getAuthHeaders(),
      });
      return handleApiResponse(response);
    } catch (error: any) {
      console.error('Failed to fetch wellness data:', error);
      throw error;
    }
  },

  updateGoals: async (goalsData: any) => {
    try {
      const response = await fetch(`${API_BASE_URL}/wellness/goals`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify(goalsData),
      });
      return handleApiResponse(response);
    } catch (error: any) {
      console.error('Failed to update wellness goals:', error);
      throw error;
    }
  },

  getRecommendations: async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/wellness/recommendations`, {
        method: 'GET',
        headers: getAuthHeaders(),
      });
      return handleApiResponse(response);
    } catch (error: any) {
      console.error('Failed to fetch recommendations:', error);
      throw error;
    }
  },
};

// Settings API calls
export const settingsAPI = {
  getAll: async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/settings`, {
        method: 'GET',
        headers: getAuthHeaders(),
      });
      return handleApiResponse(response);
    } catch (error: any) {
      console.error('Failed to fetch settings:', error);
      throw error;
    }
  },

  update: async (settingsData: any) => {
    try {
      const response = await fetch(`${API_BASE_URL}/settings`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify(settingsData),
      });
      return handleApiResponse(response);
    } catch (error: any) {
      console.error('Failed to update settings:', error);
      throw error;
    }
  },

  updatePrivacy: async (privacyData: any) => {
    try {
      const response = await fetch(`${API_BASE_URL}/settings/privacy`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify(privacyData),
      });
      return handleApiResponse(response);
    } catch (error: any) {
      console.error('Failed to update privacy settings:', error);
      throw error;
    }
  },
};

// Dashboard API calls
export const dashboardAPI = {
  getStats: async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/dashboard/stats`, {
        method: 'GET',
        headers: getAuthHeaders(),
      });
      return handleApiResponse(response);
    } catch (error: any) {
      console.error('Failed to fetch dashboard stats:', error);
      throw error;
    }
  },

  getRecentActivity: async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/dashboard/activity`, {
        method: 'GET',
        headers: getAuthHeaders(),
      });
      return handleApiResponse(response);
    } catch (error: any) {
      console.error('Failed to fetch recent activity:', error);
      throw error;
    }
  },
};

// Devices API calls
export const devicesAPI = {
  getAll: async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/devices`, {
        method: 'GET',
        headers: getAuthHeaders(),
      });
      return handleApiResponse(response);
    } catch (error: any) {
      console.error('Failed to fetch devices:', error);
      throw error;
    }
  },

  connect: async (deviceData: any) => {
    try {
      const response = await fetch(`${API_BASE_URL}/devices/connect`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(deviceData),
      });
      return handleApiResponse(response);
    } catch (error: any) {
      console.error('Failed to connect device:', error);
      throw error;
    }
  },

  sync: async (deviceId: string) => {
    try {
      const response = await fetch(`${API_BASE_URL}/devices/${deviceId}/sync`, {
        method: 'POST',
        headers: getAuthHeaders(),
      });
      return handleApiResponse(response);
    } catch (error: any) {
      console.error('Failed to sync device:', error);
      throw error;
    }
  },
};

// Subscription API calls
export const subscriptionAPI = {
  getCurrent: async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/subscription`, {
        method: 'GET',
        headers: getAuthHeaders(),
      });
      return handleApiResponse(response);
    } catch (error: any) {
      console.error('Failed to fetch subscription:', error);
      throw error;
    }
  },

  upgrade: async (planData: any) => {
    try {
      const response = await fetch(`${API_BASE_URL}/subscription/upgrade`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(planData),
      });
      return handleApiResponse(response);
    } catch (error: any) {
      console.error('Failed to upgrade subscription:', error);
      throw error;
    }
  },

  cancel: async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/subscription/cancel`, {
        method: 'POST',
        headers: getAuthHeaders(),
      });
      return handleApiResponse(response);
    } catch (error: any) {
      console.error('Failed to cancel subscription:', error);
      throw error;
    }
  },
};

export default {
  authAPI,
  usersAPI,
  vitalsAPI,
  medicationsAPI,
  carePlansAPI,
  telehealthAPI,
  wellnessAPI,
  settingsAPI,
  dashboardAPI,
  devicesAPI,
  subscriptionAPI,
};