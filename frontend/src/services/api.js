import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:5000/api',
});

// Helper to ensure token exists in development / active session
export const ensureAuthToken = async () => {
  let token = localStorage.getItem('token');
  if (!token) {
    try {
      const res = await axios.post('http://localhost:5000/api/auth/login', {
        username: 'admin',
        password: 'admin123',
      });
      if (res.data?.data?.token) {
        token = res.data.data.token;
        localStorage.setItem('token', token);
        if (res.data.data.user) {
          localStorage.setItem('tokas_user', JSON.stringify(res.data.data.user));
        }
      }
    } catch (e) {
      // Ignore login error
    }
  }
  return token;
};

api.interceptors.request.use(
  async (config) => {
    let token = localStorage.getItem('token');
    if (!token && !config.url?.includes('/auth/login')) {
      token = await ensureAuthToken();
    }
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

api.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error) => {
    const originalRequest = error.config;
    if (error.response && error.response.status === 401 && originalRequest && !originalRequest._retry && !originalRequest.url?.includes('/auth/login')) {
      originalRequest._retry = true;
      localStorage.removeItem('token');
      const newToken = await ensureAuthToken();
      if (newToken) {
        originalRequest.headers.Authorization = `Bearer ${newToken}`;
        return api(originalRequest);
      }
    }
    return Promise.reject(error);
  }
);

export default api;
