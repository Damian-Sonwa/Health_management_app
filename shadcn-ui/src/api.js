// Single API base file for all backend requests
const BASE_URL = "https://noncondescendingly-phonometric-ken.ngrok-free.dev/api";

async function apiRequest(endpoint, method = "GET", data = null, token = null) {
  const headers = {
    "Content-Type": "application/json",
    "ngrok-skip-browser-warning": "true", // Skip ngrok browser warning
  };

  if (token) headers["Authorization"] = `Bearer ${token}`;

  const config = {
    method,
    headers,
  };

  if (data) config.body = JSON.stringify(data);

  try {
    const res = await fetch(`${BASE_URL}${endpoint}`, config);

    if (!res.ok) {
      if (res.status === 401) {
        // Handle authentication errors
        localStorage.removeItem('authToken');
        localStorage.removeItem('user');
        window.location.href = '/auth';
        throw new Error('Authentication required');
      }
      
      const errData = await res.json().catch(() => ({ message: 'Network error' }));
      throw new Error(errData.message || `HTTP ${res.status}`);
    }

    return await res.json();
  } catch (err) {
    console.error("API Error:", err.message);
    throw err;
  }
}

// Helper function to get stored token
function getToken() {
  return localStorage.getItem('authToken');
}

// Authentication API calls
// frontend/src/api/auth.js

const API_URL = "https://<your-project>.app.mgx.dev/api"; // <-- replace with your deployed MGX backend URL

export const loginUser = async (email, password) => {
  try {
    const response = await fetch(`${API_URL}/auth/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include", // important if you use cookies later
      body: JSON.stringify({ email, password }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || "Login failed");
    }

    // Save token in localStorage (or state management)
    localStorage.setItem("token", data.token);

    return data; // contains user info + token
  } catch (error) {
    console.error("Login error:", error);
    return { success: false, message: error.message };
  }
};

// Users API calls
export const users = {
  getAll: async () => {
    const token = getToken();
    return await apiRequest("/users", "GET", null, token);
  },

  getProfile: async () => {
    const token = getToken();
    return await apiRequest("/users/profile", "GET", null, token);
  },

  updateProfile: async (profileData) => {
    const token = getToken();
    return await apiRequest("/users/profile", "PUT", profileData, token);
  }
};

// Vitals API calls
export const vitals = {
  getAll: async () => {
    const token = getToken();
    return await apiRequest("/vitals", "GET", null, token);
  },

  create: async (vitalData) => {
    const token = getToken();
    return await apiRequest("/vitals", "POST", vitalData, token);
  },

  update: async (id, vitalData) => {
    const token = getToken();
    return await apiRequest(`/vitals/${id}`, "PUT", vitalData, token);
  },

  delete: async (id) => {
    const token = getToken();
    return await apiRequest(`/vitals/${id}`, "DELETE", null, token);
  }
};

// Medications API calls
export const medications = {
  getAll: async () => {
    const token = getToken();
    return await apiRequest("/medications", "GET", null, token);
  },

  create: async (medicationData) => {
    const token = getToken();
    return await apiRequest("/medications", "POST", medicationData, token);
  },

  update: async (id, medicationData) => {
    const token = getToken();
    return await apiRequest(`/medications/${id}`, "PUT", medicationData, token);
  },

  delete: async (id) => {
    const token = getToken();
    return await apiRequest(`/medications/${id}`, "DELETE", null, token);
  },

  submitRequest: async (requestData) => {
    const token = getToken();
    return await apiRequest("/medications/request", "POST", requestData, token);
  }
};

// Care Plans API calls
export const carePlans = {
  getAll: async () => {
    const token = getToken();
    return await apiRequest("/careplan", "GET", null, token);
  },

  create: async (carePlanData) => {
    const token = getToken();
    return await apiRequest("/careplan", "POST", carePlanData, token);
  },

  update: async (id, carePlanData) => {
    const token = getToken();
    return await apiRequest(`/careplan/${id}`, "PUT", carePlanData, token);
  }
};

// Telehealth API calls
export const telehealth = {
  getAll: async () => {
    const token = getToken();
    return await apiRequest("/telehealth", "GET", null, token);
  },

  scheduleAppointment: async (appointmentData) => {
    const token = getToken();
    return await apiRequest("/telehealth/appointments", "POST", appointmentData, token);
  },

  updateAppointment: async (id, appointmentData) => {
    const token = getToken();
    return await apiRequest(`/telehealth/appointments/${id}`, "PUT", appointmentData, token);
  }
};

// Wellness API calls
export const wellness = {
  getAll: async () => {
    const token = getToken();
    return await apiRequest("/wellness", "GET", null, token);
  },

  updateGoals: async (goalsData) => {
    const token = getToken();
    return await apiRequest("/wellness/goals", "PUT", goalsData, token);
  },

  getRecommendations: async () => {
    const token = getToken();
    return await apiRequest("/wellness/recommendations", "GET", null, token);
  }
};

// Settings API calls
export const settings = {
  getAll: async () => {
    const token = getToken();
    return await apiRequest("/settings", "GET", null, token);
  },

  update: async (settingsData) => {
    const token = getToken();
    return await apiRequest("/settings", "PUT", settingsData, token);
  },

  updatePrivacy: async (privacyData) => {
    const token = getToken();
    return await apiRequest("/settings/privacy", "PUT", privacyData, token);
  }
};

// Dashboard API calls
export const dashboard = {
  getStats: async () => {
    const token = getToken();
    return await apiRequest("/dashboard/stats", "GET", null, token);
  },

  getRecentActivity: async () => {
    const token = getToken();
    return await apiRequest("/dashboard/activity", "GET", null, token);
  }
};

// Devices API calls
export const devices = {
  getAll: async () => {
    const token = getToken();
    return await apiRequest("/devices", "GET", null, token);
  },

  connect: async (deviceData) => {
    const token = getToken();
    return await apiRequest("/devices/connect", "POST", deviceData, token);
  },

  sync: async (deviceId) => {
    const token = getToken();
    return await apiRequest(`/devices/${deviceId}/sync`, "POST", null, token);
  }
};

// Subscription API calls
export const subscription = {
  getCurrent: async () => {
    const token = getToken();
    return await apiRequest("/subscription", "GET", null, token);
  },

  upgrade: async (planData) => {
    const token = getToken();
    return await apiRequest("/subscription/upgrade", "POST", planData, token);
  },

  cancel: async () => {
    const token = getToken();
    return await apiRequest("/subscription/cancel", "POST", null, token);
  }
};

export default apiRequest;