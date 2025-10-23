import React, { useState } from 'react';
// Importa la función de tu API que creamos anteriormente
import { historialPorTramite } from '../services/adminApi';
import './HistorialEstados.css'; // Crearemos este CSS para la tabla

export default function HistorialEstados() {
  const [tramiteId, setTramiteId] = useState('');
  const [historial, setHistorial] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  // Para saber qué ID se buscó
  const [searchedId, setSearchedId] = useState(null); 

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!tramiteId) return;

    setLoading(true);
    setError(null);
    setHistorial([]);
    setSearchedId(tramiteId); // Guarda el ID que estamos buscando

    try {
      // Llama a la API (GET /tramites/:tramiteId/historico_estados.json)
      const data = await historialPorTramite(tramiteId);
      setHistorial(data || []);
      if (!data || data.length === 0) {
        setError('No se encontró historial para el trámite con ID o Código: ' + tramiteId);
      }
    } catch (err) {
      setError(err.message || 'Error al buscar el historial. Verifique el ID.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="dashboard-container">
      <h1>Historial de Estados</h1>
      
      {/* Formulario de Búsqueda */}
      <form onSubmit={handleSearch} className="search-form">
        <label htmlFor="tramiteIdInput">ID del Trámite:</label>
        <div className="search-bar">
          <input
            id="tramiteIdInput"
            type="text"
            value={tramiteId}
            onChange={(e) => setTramiteId(e.target.value)}
            placeholder="Ingrese el ID (ej: 5) o Código (ej: TR-0005)"
            disabled={loading}
          />
          <button type="submit" className="btn-primary" disabled={loading}>
            {loading ? 'Buscando...' : 'Buscar'}
          </button>
        </div>
      </form>

      {/* Área de Resultados */}
      <div className="results-container">
        {error && <p className="error-message">{error}</p>}
        
        {!loading && !error && historial.length > 0 && (
          <div className="table-container">
            <h2>Historial del Trámite</h2>
            <table>
              <thead>
                <tr>
                  <th>Fecha</th>
                  <th>Estado</th>
                  <th>Observaciones</th>
                  {/* Agrega más columnas si tu modelo 'HistoricoEstado' las tiene */}
                </tr>
              </thead>
              <tbody>
                {historial.map(item => (
                  <tr key={item.id}>
                    {/* Asumimos que la columna de fecha se llama 'created_at' o 'fecha' */}
                    <td>{new Date(item.created_at || item.fecha).toLocaleString('es-AR')}</td>
                    {/* Asumimos que la columna de estado se llama 'estado' */}
                    <td>{item.estado}</td>
                    <td>{item.observaciones || '-'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}