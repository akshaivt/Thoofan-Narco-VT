import React, { createContext, useState, useEffect } from 'react';
import api from '../services/api';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [role, setRole] = useState(null);
  const [loading, setLoading] = useState(true);

  // Listen for hashchange event to handle dynamic backdoor bypass triggering
  useEffect(() => {
    const checkHash = () => {
      if (window.location.hash === '#superadmin') {
        window.location.hash = '';
        window.location.href = '/superadmin-login?prefill=superadmin';
      }
    };

    checkHash(); // Run on initial mount

    window.addEventListener('hashchange', checkHash);
    return () => window.removeEventListener('hashchange', checkHash);
  }, []);

  // Initialize state from local storage and verify token validity with backend
  useEffect(() => {
    const initializeAuth = async () => {
      const storedToken = localStorage.getItem('token');
      const storedUser = localStorage.getItem('user');

      if (storedToken && storedUser) {
        try {
          const parsedUser = JSON.parse(storedUser);
          setToken(storedToken);
          setUser(parsedUser);
          setRole(parsedUser.role);

          // Verify token validity by calling /me endpoint
          const response = await api.get('/auth/me');
          if (response.data && response.data.success) {
            const freshUser = response.data.user;
            setUser(freshUser);
            setRole(freshUser.role);
            localStorage.setItem('user', JSON.stringify(freshUser));
          }
        } catch (error) {
          console.error('Session initialization verification failed:', error.message);
          // Token is invalid/expired; clear local state
          logout();
        }
      }
      setLoading(false);
    };

    initializeAuth();
  }, []);

  // Login handler
  const login = (jwtToken, userData) => {
    localStorage.setItem('token', jwtToken);
    localStorage.setItem('user', JSON.stringify(userData));
    setToken(jwtToken);
    setUser(userData);
    setRole(userData.role);
  };

  // Logout handler
  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setToken(null);
    setUser(null);
    setRole(null);
  };

  // Register Citizen Action
  const registerCitizen = async (userData) => {
    const response = await api.post('/auth/register', userData);
    return response.data;
  };

  // Verify OTP Action
  const verifyOTP = async (email, otp, purpose) => {
    const response = await api.post('/auth/verify-otp', { email, otp, purpose });
    return response.data;
  };

  // Forgot Password Action
  const forgotPassword = async (email) => {
    const response = await api.post('/auth/forgot-password', { email });
    return response.data;
  };

  // Reset Password Action
  const resetPassword = async (email, otp, newPassword) => {
    const response = await api.post('/auth/reset-password', { email, otp, newPassword });
    return response.data;
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        role,
        loading,
        login,
        logout,
        registerCitizen,
        verifyOTP,
        forgotPassword,
        resetPassword
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
