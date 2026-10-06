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
          const savedUser = localStorage.getItem('tokas_user');
          if (savedUser) {
            setUser(JSON.parse(savedUser));
          } else {
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
            const parsedPayload = JSON.parse(jsonPayload);
            const role = parsedPayload['http://schemas.microsoft.com/ws/2008/06/identity/claims/role'] || parsedPayload.role;
            const name = parsedPayload['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/name'] || parsedPayload.unique_name || parsedPayload.name;
            parsedPayload.role = role;
            parsedPayload.name = name;
            setUser(parsedPayload);
          }
        } catch (error) {
          console.error("Gagal mendecode token:", error);
          localStorage.removeItem('token');
          localStorage.removeItem('tokas_user');
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
    const { token, user: userData } = response.data.data;
    localStorage.setItem('token', token);
    setToken(token);
    
    if (userData) {
      localStorage.setItem('tokas_user', JSON.stringify(userData));
      setUser(userData);
    } else {
      // Decode user fallback
      const base64Url = token.split('.')[1];
      let base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const pad = base64.length % 4;
      if (pad && pad !== 1) {
        base64 += new Array(5 - pad).join('=');
      }
      const jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
          return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
      }).join(''));
      const parsedPayload = JSON.parse(jsonPayload);
      const role = parsedPayload['http://schemas.microsoft.com/ws/2008/06/identity/claims/role'] || parsedPayload.role;
      const name = parsedPayload['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/name'] || parsedPayload.unique_name || parsedPayload.name;
      parsedPayload.role = role;
      parsedPayload.name = name;
      setUser(parsedPayload);
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('tokas_user');
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
