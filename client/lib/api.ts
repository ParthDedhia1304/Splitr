import axios from 'axios';

// 1. Create a centralized Axios instance
const api = axios.create({
  baseURL: 'http://localhost:5000/api', // Matches your backend port
});

// 2. Add an "Interceptor" to automatically add the Auth Header
// This runs before EVERY request
api.interceptors.request.use((config) => {
  if (typeof window !== 'undefined') {
    // We will store the User ID in localStorage after login
    const userId = localStorage.getItem('userId');
    if (userId) {
      config.headers['x-user-id'] = userId;
    }
  }
  return config;
}, (error) => {
  return Promise.reject(error);
});

export default api;