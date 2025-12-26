// src/services/api.js
import axios from 'axios';

const API_BASE_URL = 'http://localhost:5000';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: { 'Content-Type': 'application/json' },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('wave_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const setAuthToken = (token) => {
  if (token) {
    localStorage.setItem('wave_token', token);
    api.defaults.headers.Authorization = `Bearer ${token}`;
  } else {
    localStorage.removeItem('wave_token');
    delete api.defaults.headers.Authorization;
  }
};

export default api;