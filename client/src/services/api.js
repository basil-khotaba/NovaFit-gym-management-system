import axios from 'axios';

/**
 * Central Axios instance for all API calls.
 *
 * Every request the frontend makes to the backend goes through this.
 * Two interceptors handle authentication automatically:
 *  - request:  attaches the JWT token to every outgoing request
 *  - response: if the server says 401 (token invalid/expired),
 *              clears the token and sends the user to login
 */
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
  timeout: 10000,
});

// Request interceptor — attach the JWT token if we have one.
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor — handle expired/invalid tokens globally.
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      // Only redirect if we are not already on the login page.
      if (window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export default api;