import axios from 'axios';

const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL,
});

// ✅ attach token automatically
export const setAuthToken = (token) => {
  if (token) {
    api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    localStorage.setItem('wave_token', token);
  } else {
    delete api.defaults.headers.common['Authorization'];
    localStorage.removeItem('wave_token');
  }
};

export default api;
