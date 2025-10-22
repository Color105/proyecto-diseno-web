import { useState, useEffect } from 'react';
import { historialPorTramite } from '../services/adminApi';
import './HistorialEstados.css';

export default function HistorialEstados() {
  const [historial, setHistorial] = useState([]);
  const [tramiteId, setTramiteId] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Verificar la configuración de la API
  useEffect(() => {
    const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000';
    console.log('API URL:', apiUrl);
  }, []);

  const cargarHistorial = async (id) => {
    if (!id) return;
    
    setLoading(true);
    setError(null);
    try {
      console.log('Cargando historial para trámite:', id);
      const data = await historialPorTramite(id);
      console.log('Respuesta del servidor:', data);
      setHistorial(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error al cargar historial:', error);
      setError('Error al cargar el historial: ' + (error.message || 'No se pudo conectar con el servidor'));
      setHistorial([]);
    }
    setLoading(false);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    cargarHistorial(tramiteId);
  };

  const formatearFecha = (fecha) => {
    return new Date(fecha).toLocaleString('es-AR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <h1>Historial de Estados</h1>
      </div>

      <div className="search-container">
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>ID del Trámite:</label>
            <div className="search-input-group">
              <input
                type="text"
                value={tramiteId}
                onChange={(e) => setTramiteId(e.target.value)}
                placeholder="Ingrese el ID del trámite"
                required
              />
              <button type="submit" className="btn-primary">
                Buscar
              </button>
            </div>
          </div>
        </form>
      </div>

      {loading && <div className="loading">Cargando historial...</div>}
      
      {error && <div className="error-message">{error}</div>}

      {!loading && !error && historial.length > 0 && (
        <div className="table-container">
          <h2>Historial del Trámite #{tramiteId}</h2>
          <table>
            <thead>
              <tr>
                <th>Fecha y Hora</th>
                <th>Estado Anterior</th>
                <th>Nuevo Estado</th>
                <th>Observaciones</th>
              </tr>
            </thead>
            <tbody>
              {historial.map((cambio, index) => (
                <tr key={index}>
                  <td>{formatearFecha(cambio.fecha_cambio)}</td>
                  <td>{cambio.estado_anterior || '-'}</td>
                  <td>{cambio.estado_nuevo}</td>
                  <td>{cambio.observaciones || '-'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {!loading && !error && historial.length === 0 && tramiteId && (
        <div className="no-results">
          No se encontró historial para el trámite #{tramiteId}
        </div>
      )}
    </div>
  );
}
