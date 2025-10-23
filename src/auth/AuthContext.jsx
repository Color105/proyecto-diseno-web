import React, { createContext, useState, useContext, useEffect } from 'react';
import { API_URL } from '../config'; // Ajusta la ruta si es necesario

// 1. Crear el contexto
const AuthContext = createContext();

// 2. Crear el Proveedor (Provider)
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true); // Para saber si ya cargó desde localStorage

  useEffect(() => {
    // Intentar cargar token y usuario desde localStorage al iniciar
    const storedToken = localStorage.getItem('token');
    const storedUser = localStorage.getItem('user');

    if (storedToken && storedUser) {
      setToken(storedToken);
      setUser(JSON.parse(storedUser));
      setIsAuthenticated(true);
    }
    setLoading(false);
  }, []);

  // Función de Login
  const login = async (email, password) => {
    try {
      const response = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      if (!response.ok) {
        throw new Error('Email o contraseña incorrectos');
      }

      const data = await response.json(); // Esperamos { token, user }

      // Guardar en estado y localStorage
      setToken(data.token);
      setUser(data.user);
      setIsAuthenticated(true);
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));

      return data.user; // Devolvemos el usuario para la redirección
    } catch (error) {
      console.error('Error en login:', error);
      throw error; // Propagamos el error al LoginPage
    }
  };

  // Función de Logout
  const logout = () => {
    setToken(null);
    setUser(null);
    setIsAuthenticated(false);
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated,
        loading,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

// 3. Hook personalizado para consumir el contexto
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth debe ser usado dentro de un AuthProvider');
  }
  return context;
};