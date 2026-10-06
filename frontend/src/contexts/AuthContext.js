import React, { createContext, useState, useEffect, useContext } from 'react';
import api from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initializeAuth = () => {
      if (token) {
        try {
          const base64Url = token.split('.')[1];
          let base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
          const pad = base64.length % 4;
          if (pad) {
            if (pad === 1) {
              throw new Error('InvalidLengthError');
            }
            base64 += new Array(5 - pad).join('=');
          }
          const jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
              return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
          }).join(''));
          setUser(JSON.parse(jsonPayload));
        } catch (error) {
          console.error("Gagal mendecode token:", error);
          localStorage.removeItem('token');
          setToken(null);
          setUser(null);
        }
      } else {
        setUser(null);
      }
      setLoading(false);
    };

    initializeAuth();
  }, [token]);

  const login = async (username, password) => {
    const response = await api.post('/auth/login', { username, password });
    const { token } = response.data.data;
    localStorage.setItem('token', token);
    setToken(token);
    
    // Decode user immediately to avoid race conditions after login
    const base64Url = token.split('.')[1];
    let base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const pad = base64.length % 4;
    if (pad) {
      if (pad === 1) {
        throw new Error('InvalidLengthError: Input base64url string is the wrong length to determine padding');
      }
      base64 += new Array(5 - pad).join('=');
    }
    const jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
        return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
    }).join(''));
    setUser(JSON.parse(jsonPayload));
  };

  const logout = () => {
    localStorage.removeItem('token');
    setToken(null);
    setUser(null);
  };

  const isAuthenticated = !!token;

  return (
    <AuthContext.Provider value={{ user, token, login, logout, isAuthenticated, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
