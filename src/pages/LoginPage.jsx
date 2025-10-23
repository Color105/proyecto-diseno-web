import React, { useState } from 'react';
import { useAuth } from '../auth/AuthContext';
import { useNavigate } from 'react-router-dom';
// 1. Importar el CSS nuevo
import './LoginPage.css'; 

function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false); // <-- NUEVO
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true); // <-- NUEVO

    try {
      // 2. Llamar al login del contexto
      const loggedInUser = await login(email, password);
      
      // 3. Redirigir según el rol
      if (loggedInUser.role === 'admin' || loggedInUser.role === 'recepcionista') {
        navigate('/admin/tramites');
      } else if (loggedInUser.role === 'cliente') {
        navigate('/mis-tramites');
      } else {
        navigate('/');
      }

    } catch (err) {
      setError(err.message || 'Error al iniciar sesión');
    } finally {
      setIsLoading(false); // <-- NUEVO
    }
  };

  return (
    // 4. Usar las nuevas clases CSS del Canvas
    <div className="login-container">
      <div className="login-box">
        <div className="login-header">
          <span className="login-logo-icon">GT</span>
          <h2>Iniciar Sesión</h2>
          <p>Gestión de Trámites</p>
        </div>
        
        <form onSubmit={handleSubmit} className="login-form">
          <div className="login-input-group">
            <label htmlFor="email">Email</label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="admin@demo.com"
              required
              disabled={isLoading} // <-- NUEVO
            />
          </div>
          <div className="login-input-group">
            <label htmlFor="password">Contraseña</label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••" // Placeholder mejorado
              required
              disabled={isLoading} // <-- NUEVO
            />
          </div>
          
          {error && <div className="login-error">{error}</div>}
          
          <button type="submit" className="login-button" disabled={isLoading}>
            {isLoading ? 'Ingresando...' : 'Ingresar'}
          </button>
        </form>
      </div>
    </div>
  );
}

export default LoginPage;

