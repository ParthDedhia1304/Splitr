import axios from 'axios';

// Use the environment variable if available (Production), otherwise fallback to localhost (Development)
export const baseURL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: baseURL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export default api;