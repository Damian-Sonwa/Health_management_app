// Central API configuration with MongoDB integration
const getApiBaseUrl = () => {
  // Check if we're in development
  if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
    return 'http://localhost:5001/api';
  }
  
  // Production backend on Render
  return 'https://health-management-app-joj5.onrender.com/api';
};

export const API_BASE_URL = getApiBaseUrl();

// MongoDB configuration
export const MONGODB_CONFIG = {
  uri: 'mongodb+srv://madudamian25_db_user:<db_password>@cluster0.c2havli.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0',
  dbName: 'healthcare_dashboard',
  options: {
    maxPoolSize: 10,
    serverSelectionTimeoutMS: 5000,
    socketTimeoutMS: 45000,
  }
};

// API configuration settings
export const API_CONFIG = {
  baseURL: API_BASE_URL,
  timeout: 10000, // 10 seconds
  headers: {
    'Content-Type': 'application/json',
  }
};

// Helper function to get auth headers
export const getAuthHeaders = () => {
  const token = localStorage.getItem('authToken');
  return {
    ...API_CONFIG.headers,
    ...(token && { Authorization: `Bearer ${token}` })
  };
};

// Helper function to handle API responses
export const handleApiResponse = async (response: Response) => {
  if (!response.ok) {
    if (response.status === 401) {
      localStorage.removeItem('authToken');
      localStorage.removeItem('user');
      window.location.href = '/auth';
      throw new Error('Authentication required');
    }
    const errorData = await response.json().catch(() => ({ message: 'Network error' }));
    throw new Error(errorData.message || `HTTP ${response.status}`);
  }
  return response.json();
};

// Generic API call function with retry logic
export const apiCall = async (endpoint: string, options: RequestInit = {}) => {
  const maxRetries = 2;
  let lastError: any;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        ...options,
        headers: {
          ...getAuthHeaders(),
          ...options.headers,
        },
        // Add timeout
        signal: AbortSignal.timeout(10000), // 10 second timeout
      });
      return handleApiResponse(response);
    } catch (error: any) {
      lastError = error;
      console.warn(`API call attempt ${attempt + 1} failed for ${endpoint}:`, error.message);
      
      // If it's a network error and we have retries left, wait and retry
      if (attempt < maxRetries && (error.name === 'TypeError' || error.message.includes('fetch'))) {
        await new Promise(resolve => setTimeout(resolve, 1000 * (attempt + 1))); // Exponential backoff
        continue;
      }
      
      // If all retries failed, throw the error
      throw error;
    }
  }
  
  throw lastError;
};