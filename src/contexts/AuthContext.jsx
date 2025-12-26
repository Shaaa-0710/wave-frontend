// src/contexts/AuthContext.jsx
import React, { createContext, useState, useEffect, useContext } from 'react';
import api, { setAuthToken } from '../services/api';

export const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('wave_token');
    if (token) {
      setAuthToken(token);
      try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        const userId = payload.user_id;

        // ✅ Use /me (secure) — or /users if you prefer
        api.get('/me')
          .then((res) => {
            setCurrentUser(res.data);
            setLoading(false);
          })
          .catch(() => {
            logout();
            setLoading(false);
          });
      } catch (e) {
        logout();
        setLoading(false);
      }
    } else {
      setLoading(false);
    }
  }, []);

  const login = async (email, password) => {
    const res = await api.post('/api/auth/login', { email, password });
    const { token, user } = res.data;
    setAuthToken(token);
    setCurrentUser(user);
    return user;
  };

  const register = async (username, email, password, role, workPlatform = null) => {
  await api.post('/api/auth/register', { 
    username, 
    email, 
    password, 
    role,
    work_platform: workPlatform  // Match backend field
  });
  const user = await login(email, password);
  return user;
};

  const logout = () => {
    setAuthToken(null);
    setCurrentUser(null);
  };

  const updateLocation = async (latitude, longitude) => {
    try {
      const response = await api.put('/profile/location', { latitude, longitude });
      const updatedUser = response.data.user;
      setCurrentUser(updatedUser);
      return updatedUser;
    } catch (err) {
      if (err.response?.status === 401) {
        logout();
        window.location.href = '/login';
      }
      throw err;
    }
  };

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        login,
        register,
        logout,
        updateLocation,
        loading,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};