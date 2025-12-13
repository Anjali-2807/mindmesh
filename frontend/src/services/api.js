import axios from 'axios';

// Use port 5001 as specified
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://127.0.0.1:5001/api';

// Create axios instance with default config
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Request interceptor
api.interceptors.request.use(
  (config) => {
    // Add any auth tokens here if needed
    console.log(`[API] ${config.method?.toUpperCase()} ${config.url}`);
    return config;
  },
  (error) => {
    console.error('[API] Request error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor
api.interceptors.response.use(
  (response) => {
    console.log(`[API] Response from ${response.config.url}:`, response.status);
    return response;
  },
  (error) => {
    console.error('[API] Response error:', {
      url: error.config?.url,
      method: error.config?.method,
      status: error.response?.status,
      data: error.response?.data,
      message: error.message
    });
    return Promise.reject(error);
  }
);

// API Methods
export const apiService = {
  // Health Check
  healthCheck: () => api.get('/health'),

  // Daily Logs
  analyzeJournal: (text) => api.post('/analyze-journal', { text }),
  createDailyLog: (data) => api.post('/daily-log', data),
  updateDailyLog: (id, data) => api.patch(`/daily-log/${id}`, data),
  getHistory: (days = 30, limit = 100) => api.get('/history', { params: { days, limit } }),

  // Decisions - Updated endpoint
  analyzeDecision: (data) => api.post('/decision/analyze', data),
  getDecisionsHistory: (limit = 50) => api.get('/decisions/history', { params: { limit } }),

  // Analytics
  getAnalytics: (days = 30) => api.get('/analytics', { params: { days } }),

  // Insights
  getInsights: (unreadOnly = false) => api.get('/insights', { params: { unread: unreadOnly } })
};

export default api;