// src/components/TramiteDashboard.jsx
import React, { useState, useEffect } from 'react';
import { useAuth } from '../auth/AuthContext';
import { API_URL } from '../config';
import { deleteTramite } from '../services/adminApi';
import TramiteEditModal from './TramiteEditModal';
import TramiteForm from './TramiteForm';
import './TramiteDashboard.css';

function TramiteDashboard() {
  const [tramites, setTramites] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState(null);

  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [selectedTramite, setSelectedTramite] = useState(null);
  const [deletingId, setDeletingId] = useState(null);

  // 👇 nuevo: filtro de vista
  const [filtro, setFiltro] = useState('activos'); // 'activos' | 'eliminados' | 'todos'

  const { token, logout } = useAuth();

  const fetchTramites = async (f = filtro) => {
    if (!token) return;
    setIsLoading(true);
    setErrorMessage(null);
    try {
      const response = await fetch(`${API_URL}/tramites?filtro=${f}`, {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.status === 401) {
        logout();
        throw new Error('Tu sesión ha expirado. Por favor, inicia sesión de nuevo.');
      }
      if (!response.ok) {
        throw new Error(`Error ${response.status}: No se pudieron cargar los trámites.`);
      }

      const data = await response.json();
      setTramites(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error al cargar trámites:', error);
      setErrorMessage(error.message);
      setTramites([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchTramites(filtro);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token, filtro]);

  // =============== BAJA LÓGICA ===============
  const handleDeleteClick = (id) => {
    setDeletingId(id);
  };

  const executeDelete = async () => {
    if (!deletingId) return;
    try {
      // 👇 ahora el DELETE en el back hace dar_de_baja!
      await deleteTramite(deletingId);
      setDeletingId(null);
      fetchTramites(filtro);
    } catch (err) {
      setErrorMessage(
        'Error al dar de baja el trámite: ' +
          (err.response?.data?.error || err.message)
      );
      setDeletingId(null);
    }
  };

  // =============== CREAR / EDITAR ===============
  const handleTramiteUpdated = (updatedTramite) => {
    setTramites((prevTramites) =>
      prevTramites.map((t) => (t.id === updatedTramite.id ? updatedTramite : t))
    );
    closeEditModal();
  };

  const handleTramiteCreated = (newTramite) => {
    setTramites((prevTramites) => [newTramite, ...prevTramites]);
    setIsFormModalOpen(false);
  };

  const openEditModal = (tramite) => {
    setSelectedTramite(tramite);
    setIsEditModalOpen(true);
  };

  const closeEditModal = () => {
    setIsEditModalOpen(false);
    setSelectedTramite(null);
  };

  return (
    <div className="dashboard-container">
      <header className="dashboard-header">
        <h1>Gestión de Trámites</h1>

        <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
          {/* Filtros de vista */}
          <div style={{ display: 'flex', gap: 8 }}>
            <button
              type="button"
              className="btn-secondary"
              onClick={() => setFiltro('activos')}
              style={
                filtro === 'activos'
                  ? { backgroundColor: '#4f46e5', color: '#fff' }
                  : {}
              }
            >
              Activos
            </button>
            <button
              type="button"
              className="btn-secondary"
              onClick={() => setFiltro('eliminados')}
              style={
                filtro === 'eliminados'
                  ? { backgroundColor: '#4f46e5', color: '#fff' }
                  : {}
              }
            >
              Eliminados
            </button>
            <button
              type="button"
              className="btn-secondary"
              onClick={() => setFiltro('todos')}
              style={
                filtro === 'todos'
                  ? { backgroundColor: '#4f46e5', color: '#fff' }
                  : {}
              }
            >
              Todos
            </button>
          </div>

          <button
            className="btn-primary"
            onClick={() => setIsFormModalOpen(true)}
          >
            + Nuevo Trámite
          </button>
        </div>
      </header>

      {isLoading && (
        <p style={{ textAlign: 'center', fontSize: '1.2em' }}>
          Cargando trámites...
        </p>
      )}
      {errorMessage && <div className="error-message">{errorMessage}</div>}

      {!isLoading && !errorMessage && (
        <div className="table-wrapper">
          {tramites.length === 0 ? (
            <p style={{ textAlign: 'center', padding: '2rem' }}>
              No se encontraron trámites.
            </p>
          ) : (
            <table className="tramites-table">
              <thead>
                <tr>
                  <th>CÓDIGO</th>
                  <th>TIPO</th>
                  <th>CLIENTE</th>
                  <th>ESTADO</th>
                  <th>CONSULTOR</th>
                  <th>PRECIO TIPO</th>
                  <th>ACCIONES</th>
                </tr>
              </thead>
              <tbody>
                {tramites.map((tramite) => {
                  const esEliminado = !!tramite.dado_de_baja;
                  let estadoNombre =
                    tramite.estado_tramite?.nombreEstadoTramite || 'desconocido';
                  let estadoCodigo =
                    tramite.estado_tramite?.codEstadoTramite || 'desconocido';

                  // Si está dado de baja, pisamos el estado para mostrar "Eliminado"
                  if (esEliminado) {
                    estadoNombre = 'Eliminado';
                    estadoCodigo = 'ELIMINADO';
                  }

                  const consultorNombre =
                    tramite.consultor?.nombre || 'Sin asignar';
                  const clienteNombre =
                    tramite.cliente?.nombre_apellido_cliente || 'N/A';

                  const precioTipo = tramite.tipo_tramite?.precio_actual;

                  return (
                    <tr
                      key={tramite.id}
                      className={esEliminado ? 'tramite-eliminado' : ''}
                    >
                      <td>{tramite.codigo || `TR-${tramite.id}`}</td>
                      <td>{tramite.tipo_tramite?.nombre || 'N/A'}</td>
                      <td>{clienteNombre}</td>
                      <td>
                        <span
                          className={`status-${estadoCodigo.toLowerCase()}`}
                        >
                          {estadoNombre}
                        </span>
                      </td>
                      <td>{consultorNombre}</td>
                      <td>
                        {precioTipo != null ? (
                          `$${parseFloat(precioTipo).toFixed(2)}`
                        ) : (
                          <span style={{ color: '#6b7280' }}>Sin precio</span>
                        )}
                      </td>
                      <td className="acciones-tramites">
                        <button
                          className="btn-primary"
                          onClick={() => openEditModal(tramite)}
                          disabled={esEliminado}
                          style={
                            esEliminado
                              ? { opacity: 0.5, cursor: 'not-allowed' }
                              : {}
                          }
                        >
                          Editar
                        </button>
                        <button
                          className="btn-danger-outline"
                          onClick={() => handleDeleteClick(tramite.id)}
                        >
                          {esEliminado ? 'Volver a dar de baja' : 'Dar de baja'}
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      )}

      {isEditModalOpen && selectedTramite && (
        <TramiteEditModal
          tramite={selectedTramite}
          onClose={closeEditModal}
          onTramiteUpdated={handleTramiteUpdated}
          token={token}
          apiUrl={API_URL}
        />
      )}

      {isFormModalOpen && (
        <TramiteForm
          onClose={() => setIsFormModalOpen(false)}
          onTramiteCreated={handleTramiteCreated}
          token={token}
          apiUrl={API_URL}
        />
      )}

      {deletingId && (
        <div className="modal-backdrop">
          <div className="modal-content" style={{ maxWidth: '400px' }}>
            <h3 style={{ marginTop: 0 }}>Confirmar baja</h3>
            <p>
              ¿Está seguro de dar de baja el trámite{' '}
              {tramites.find((t) => t.id === deletingId)?.codigo}? Podrás verlo
              luego usando el filtro <strong>“Eliminados”</strong>, pero ya no se
              considerará activo.
            </p>
            <div className="form-actions">
              <button
                type="button"
                onClick={executeDelete}
                className="btn-primary"
                style={{ backgroundColor: '#b91c1c' }}
              >
                Sí, dar de baja
              </button>
              <button
                type="button"
                onClick={() => setDeletingId(null)}
                className="btn-secondary"
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default TramiteDashboard;
