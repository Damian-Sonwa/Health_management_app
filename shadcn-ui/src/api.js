// 🌐 Smart API base file with automatic environment switching

const BASE_URL =
  window.location.hostname === "localhost"
    ? "http://localhost:5001/api" // local backend
    : "https://noncondescendingly-phonometric-ken.ngrok-free.dev/api"; // production/ngrok URL

async function apiRequest(endpoint, method = "GET", data = null, token = null) {
  const headers = {
    "Content-Type": "application/json",
    "ngrok-skip-browser-warning": "true", // skip ngrok browser warning
  };

  if (token) headers["Authorization"] = `Bearer ${token}`;

  const config = { method, headers };
  if (data) config.body = JSON.stringify(data);

  try {
    const res = await fetch(`${BASE_URL}${endpoint}`, config);

    if (!res.ok) {
      if (res.status === 401) {
        localStorage.removeItem("authToken");
        localStorage.removeItem("user");
        window.location.href = "/auth";
        throw new Error("Authentication required");
      }

      const errData = await res.json().catch(() => ({ message: "Network error" }));
      throw new Error(errData.message || `HTTP ${res.status}`);
    }

    return await res.json();
  } catch (err) {
    console.error("API Error:", err.message);
    throw err;
  }
}

// 🧩 Helper: get stored token
function getToken() {
  return localStorage.getItem("authToken");
}

// 🔐 Authentication
export const auth = {
  login: async (email, password) => apiRequest("/auth/login", "POST", { email, password }),
  register: async (userData) => apiRequest("/auth/register", "POST", userData),
  profile: async () => apiRequest("/auth/profile", "GET", null, getToken()),
};

// 👥 Users
export const users = {
  getAll: async () => apiRequest("/users", "GET", null, getToken()),
  getProfile: async () => apiRequest("/users/profile", "GET", null, getToken()),
  updateProfile: async (data) => apiRequest("/users/profile", "PUT", data, getToken()),
};

// ❤️ Vitals
export const vitals = {
  getAll: async () => apiRequest("/vitals", "GET", null, getToken()),
  create: async (data) => apiRequest("/vitals", "POST", data, getToken()),
  update: async (id, data) => apiRequest(`/vitals/${id}`, "PUT", data, getToken()),
  delete: async (id) => apiRequest(`/vitals/${id}`, "DELETE", null, getToken()),
};

// 💊 Medications
export const medications = {
  getAll: async () => apiRequest("/medications", "GET", null, getToken()),
  create: async (data) => apiRequest("/medications", "POST", data, getToken()),
  update: async (id, data) => apiRequest(`/medications/${id}`, "PUT", data, getToken()),
  delete: async (id) => apiRequest(`/medications/${id}`, "DELETE", null, getToken()),
  submitRequest: async (data) => apiRequest("/medications/request", "POST", data, getToken()),
};

// 🩺 Care Plans
export const carePlans = {
  getAll: async () => apiRequest("/careplan", "GET", null, getToken()),
  create: async (data) => apiRequest("/careplan", "POST", data, getToken()),
  update: async (id, data) => apiRequest(`/careplan/${id}`, "PUT", data, getToken()),
};

// 📞 Telehealth
export const telehealth = {
  getAll: async () => apiRequest("/telehealth", "GET", null, getToken()),
  scheduleAppointment: async (data) => apiRequest("/telehealth/appointments", "POST", data, getToken()),
  updateAppointment: async (id, data) => apiRequest(`/telehealth/appointments/${id}`, "PUT", data, getToken()),
};

// 🌿 Wellness
export const wellness = {
  getAll: async () => apiRequest("/wellness", "GET", null, getToken()),
  updateGoals: async (data) => apiRequest("/wellness/goals", "PUT", data, getToken()),
  getRecommendations: async () => apiRequest("/wellness/recommendations", "GET", null, getToken()),
};

// ⚙️ Settings
export const settings = {
  getAll: async () => apiRequest("/settings", "GET", null, getToken()),
  update: async (data) => apiRequest("/settings", "PUT", data, getToken()),
  updatePrivacy: async (data) => apiRequest("/settings/privacy", "PUT", data, getToken()),
};

// 📊 Dashboard
export const dashboard = {
  getStats: async () => apiRequest("/dashboard/stats", "GET", null, getToken()),
  getRecentActivity: async () => apiRequest("/dashboard/activity", "GET", null, getToken()),
};

// 🔌 Devices
export const devices = {
  getAll: async () => apiRequest("/devices", "GET", null, getToken()),
  connect: async (data) => apiRequest("/devices/connect", "POST", data, getToken()),
  sync: async (id) => apiRequest(`/devices/${id}/sync`, "POST", null, getToken()),
};

// 💳 Subscription
export const subscription = {
  getCurrent: async () => apiRequest("/subscription", "GET", null, getToken()),
  upgrade: async (data) => apiRequest("/subscription/upgrade", "POST", data, getToken()),
  cancel: async () => apiRequest("/subscription/cancel", "POST", null, getToken()),
};

export default apiRequest;
