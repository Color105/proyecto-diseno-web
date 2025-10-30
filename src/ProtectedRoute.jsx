import React from 'react';
import { Navigate } from 'react-router-dom';
// Asegúrate de que esta sea la ruta correcta a tu hook de auth
import { useAuth } from '../services/AuthContext'; 

const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();
  
  // 1. Si está cargando, muestra un spinner o mensaje
  if (loading) {
    return (
      <div style={{ padding: '40vh', textAlign: 'center' }}>
        Verificando autenticación...
      </div>
    );
  }
  
  // 2. Si NO está autenticado, redirige al login
  if (!isAuthenticated) {
    // 🔑 Redirigir al login si no hay token
    return <Navigate to="/login" replace />;
  }
  
  // 3. Si SÍ está autenticado, renderiza la ruta hija
  return children;
};

export default ProtectedRoute;
