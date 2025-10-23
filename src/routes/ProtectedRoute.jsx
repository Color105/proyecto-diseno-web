import React from 'react';
import { useAuth } from '../auth/AuthContext';
import { Navigate, useLocation } from 'react-router-dom';

function ProtectedRoute({ children, roles }) {
  const { isAuthenticated, user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    // 1. Esperar a que el contexto termine de cargar desde localStorage
    return <div style={{ padding: 24 }}>Verificando autenticación...</div>;
  }

  if (!isAuthenticated) {
    // 2. Si no está logueado, redirigir a /login
    // Guardamos la ruta original para redirigir allí después del login
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (roles && !roles.includes(user.role)) {
    // 3. Si tiene rol, pero no está en la lista permitida
    // Redirigir a una página de "no autorizado" o al inicio
    return <Navigate to="/" state={{ from: location }} replace />;
  }

  // 4. Si todo está OK (autenticado y con rol permitido)
  return children;
}

export default ProtectedRoute;
