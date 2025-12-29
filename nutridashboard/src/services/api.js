import axios from 'axios';

const API_URL = 'http://localhost:5001/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Add token to all requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth
export const authAPI = {
  register: (data) => api.post('/auth/register', data),
  login: (data) => api.post('/auth/login', data),
  getMe: () => api.get('/auth/me')
};

// Health Log
export const healthAPI = {
  getDashboard: () => api.get('/health-log/dashboard'),
  getToday: () => api.get('/health-log/today'),
  updateToday: (data) => api.put('/health-log/today', data),
  addWater: (amount = 1) => api.post('/health-log/water', { amount }),
  setWater: (waterIntake) => api.put('/health-log/water', { waterIntake }),
  logWeight: (weight, notes) => api.post('/health-log/weight', { weight, notes }),
  getWeightHistory: (days = 30) => api.get(`/health-log/weight/history?days=${days}`),
  updateProfile: (data) => api.put('/health-log/profile', data)
};

// Meals
export const mealsAPI = {
  getToday: () => api.get('/meals/today'),
  getByDate: (date) => api.get(`/meals/date/${date}`),
  add: (data) => api.post('/meals', data),
  update: (id, data) => api.put(`/meals/${id}`, data),
  delete: (id) => api.delete(`/meals/${id}`),
  getWeeklySummary: () => api.get('/meals/summary/week'),
  getCommonFoods: () => api.get('/meals/foods/common')
};

// Lab Tests
export const labTestAPI = {
  create: (data) => api.post('/lab-tests', data),
  getAll: () => api.get('/lab-tests'),
  getOne: (id) => api.get(`/lab-tests/${id}`),
  analyze: (id) => api.post(`/lab-tests/${id}/analyze`)
};

// Chat
export const chatAPI = {
  start: (topic) => api.post('/chat/start', { topic }),
  sendMessage: (sessionId, message) => api.post('/chat/message', { sessionId, message }),
  getSessions: () => api.get('/chat/sessions'),
  getHistory: (sessionId) => api.get(`/chat/history/${sessionId}`),
  analyzeLabTest: (testData, testType) => api.post('/chat/analyze-lab', { testData, testType })
};

export default api;
