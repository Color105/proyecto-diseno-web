// src/api.js
import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://127.0.0.1:3000",
});

// Agrega el token en cada request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token"); // o from AuthContext
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Maneja expiración 401
api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      window.location.href = "/login";
    }
    return Promise.reject(err);
  }
);

export default api;
