import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from './auth/AuthContext';

// Importamos el CSS que define "dashboard-container"
// (Ajusta la ruta si 'App.jsx' no está en 'src/')
import './components/TramiteDashboard.css'; 

function App() {
  const { user, isAuthenticated } = useAuth();

  // Estilos para los botones (los mismos que tenías)
  const cta = {
    background:"#7c3aed", color:"#fff", padding:"10px 14px", borderRadius:10,
    textDecoration:"none", border:"1px solid #6d28d9", fontSize: '0.9rem'
  };
  const ctaSecondary = {
    background:"#242b3b", color:"#e6e9ef", padding:"10px 14px", borderRadius:10,
    textDecoration:"none", border:"1px solid #2a3348", fontSize: '0.9rem'
  };

  return (
    // 1. Usamos la clase "dashboard-container" de tu CSS
    // 2. Agregamos un style en línea para que ESTA PÁGINA (y no el dashboard)
    //    tenga un ancho máximo y se centre.
    <div 
      className="dashboard-container"
      style={{ maxWidth: '960px', margin: '40px auto' }}
    >
      {isAuthenticated && user ? (
        // --- Vista Logueado ---
        <>
          <h2 style={{ fontSize: 22, marginBottom: 8 }}>
            Bienvenido/a, {user.email}
          </h2>
          <p style={{ color: "#9aa3b2", marginBottom: 16 }}>
            Estás logueado como: <strong>{user.role}</strong>.
          </p>
          <div style={{ display:"flex", gap:12, flexWrap:"wrap" }}>
            <Link to="/admin/tramites" style={ctaSecondary}>
              Ver Trámites (Admin/Recep)
            </Link>
          </div>
        </>
      ) : (
        // --- Vista Deslogueado ---
        <>
          <h2 style={{ fontSize: 22, marginBottom: 8 }}>Bienvenido/a</h2>
          <p style={{ color: "#9aa3b2", marginBottom: 16 }}>
            Usa el menú lateral para navegar o inicia sesión.
          </p>
          <Link to="/login" style={cta}>Iniciar sesión</Link>
        </>
      )}
    </div>
  );
}

export default App;

