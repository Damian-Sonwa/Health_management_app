// ===== API Configuration =====
// This file tells the app where to send data (local computer or live server)

// Function to get the correct server address
const getApiBaseUrl = () => {
  // Use environment variable if available (set in Netlify dashboard)
  const envApiUrl = import.meta.env.VITE_API_URL;
  if (envApiUrl) {
    return envApiUrl;
  }
  
  // Check if app is running on your computer (localhost)
  if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
    return 'http://localhost:5001/api';  // Use local server
  }
  
  // If running on the internet, use live server on Render
  return 'https://health-management-app-joj5.onrender.com/api';
};

// Save the server address so we can use it everywhere
export const API_BASE_URL = getApiBaseUrl();

// Show which server we're using (helpful for finding problems)
console.log('🌐 API Base URL:', API_BASE_URL);

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
  timeout: 60000, // 60 seconds (for Render cold starts)
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

// Function to check if server response is good or has errors
export const handleApiResponse = async (response: Response) => {
  // If response is not OK (has error)
  if (!response.ok) {
    // If error is 401 = user not logged in
    if (response.status === 401) {
      // Clear login info and send user back to login page
      localStorage.removeItem('authToken');
      localStorage.removeItem('user');
      window.location.href = '/auth';
      throw new Error('Authentication required');
    }
    
    // For other errors, get error message from server
    const errorData = await response.json().catch(() => ({ message: 'Network error' }));
    throw new Error(errorData.message || `HTTP ${response.status}`);
  }
  
  // Response is good - return the data
  return response.json();
};

// ===== Main Function to Talk to Server =====
// This function sends requests to the server and handles errors
export const apiCall = async (endpoint: string, options: RequestInit = {}) => {
  const maxRetries = 2;  // Try up to 3 times (1 original + 2 retries)
  let lastError: any;

  console.log(`📡 API Call: ${options.method || 'GET'} ${API_BASE_URL}${endpoint}`);

  // Try to connect to server (with retries if it fails)
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      // Send request to server
      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        ...options,
        headers: {
          ...getAuthHeaders(),      // Add login token
          ...options.headers,        // Add any extra headers
        },
        signal: AbortSignal.timeout(60000),  // Stop after 60 seconds
      });
      
      console.log(`✅ API Response: ${response.status} ${response.statusText}`);
      return handleApiResponse(response);  // Return the data
      
    } catch (error: any) {
      lastError = error;
      console.error(`❌ API call attempt ${attempt + 1}/${maxRetries + 1} failed for ${endpoint}:`, {
        name: error.name,
        message: error.message,
        url: `${API_BASE_URL}${endpoint}`
      });
      
      // If it's a connection error and we have retries left
      if (attempt < maxRetries && (error.name === 'TypeError' || error.message.includes('fetch') || error.name === 'AbortError')) {
        // Wait a bit longer each time (1 second, then 2 seconds)
        console.log(`⏳ Retrying in ${(attempt + 1) * 1000}ms... (Backend may be waking up)`);
        await new Promise(resolve => setTimeout(resolve, 1000 * (attempt + 1)));
        continue;  // Try again
      }
      
      // All retries failed - give up
      throw error;
    }
  }
  
  throw lastError;
};