import axios from "axios";

const API_BASE_URL =
  import.meta.env.VITE_API_URL || "http://127.0.0.1:5001/api";

// Create axios instance with default config
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
  headers: {
    "Content-Type": "application/json",
  },
});

// Request interceptor
api.interceptors.request.use(
  (config) => {
    // Add any auth tokens here if needed
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor
api.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error("API Error:", error);
    return Promise.reject(error);
  }
);

// API Methods
export const apiService = {
  // Health Check
  healthCheck: () => api.get("/health"),

  // Daily Logs
  analyzeJournal: (text) => api.post("/analyze-journal", { text }),
  createDailyLog: (data) => api.post("/daily-log", data),
  updateDailyLog: (id, data) => api.patch(`/daily-log/${id}`, data),
  getHistory: (days = 30, limit = 100) =>
    api.get("/history", { params: { days, limit } }),

  // Decisions
  analyzeDecision: (data) => api.post("/analyze-decision", data),
  getDecisionsHistory: (limit = 50) =>
    api.get("/decisions/history", { params: { limit } }),

  // Analytics
  getAnalytics: (days = 30) => api.get("/analytics", { params: { days } }),

  // Insights
  getInsights: (unreadOnly = false) =>
    api.get("/insights", { params: { unread: unreadOnly } }),
};

export default api;
