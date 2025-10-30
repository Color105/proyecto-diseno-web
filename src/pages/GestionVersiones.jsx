// src/pages/GestionVersiones.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { 
  getVersionesPorTipo, 
  clonarVersion, 
  activarVersion, 
  deleteVersionBorrador,
  createPrimeraVersion
} from '../services/adminApi';
// Importamos los íconos minimalistas
import { FiFilePlus, FiEdit, FiCheck, FiTrash2, FiEye, FiCopy, FiChevronLeft } from 'react-icons/fi';
// Importamos el CSS nuevo
import './GestionVersiones.css'; 

const GestionVersiones = () => {
  const { tipoTramiteId } = useParams();
  const navigate = useNavigate();
  
  const [versiones, setVersiones] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchVersiones = useCallback(async () => {
    try {
      setLoading(true);
      const response = await getVersionesPorTipo(tipoTramiteId);
      setVersiones(response.data);
      setError('');
    } catch (err) {
      setError('Error al cargar las versiones.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [tipoTramiteId]);

  useEffect(() => {
    fetchVersiones();
  }, [fetchVersiones]);

  const handleCrearPrimeraVersion = async () => {
    if (window.confirm('Se creará la Versión 1 en estado Borrador.')) {
      try {
        await createPrimeraVersion(tipoTramiteId);
        fetchVersiones();
      } catch (err) {
        alert('Error al crear: ' + (err.response?.data?.error || err.message));
      }
    }
  };

  const handleClonar = async (versionId) => {
    if (window.confirm('¿Seguro que quieres crear una nueva versión borrador basada en esta?')) {
      try {
        await clonarVersion(versionId);
        fetchVersiones();
      } catch (err) {
        alert('Error al clonar: ' + (err.response?.data?.error || err.message));
      }
    }
  };
  
  const handleActivar = async (versionId) => {
     if (window.confirm('¿Seguro que quieres activar esta versión? La versión activa actual será archivada.')) {
      try {
        await activarVersion(versionId);
        fetchVersiones();
      } catch (err) {
        alert('Error al activar: ' + (err.response?.data?.error || err.message));
      }
    }
  };

  const handleEliminar = async (versionId) => {
    if (window.confirm('¿Seguro que quieres eliminar esta versión borrador? Esta acción no se puede deshacer.')) {
      try {
        await deleteVersionBorrador(versionId);
        fetchVersiones();
      } catch (err) {
        alert('Error al eliminar: ' + (err.response?.data?.error || err.message));
      }
    }
  };

  const handleEditarFlujo = (versionId) => {
    navigate(`/admin/versiones/${versionId}/editar`);
  };

  if (loading) return <p>Cargando historial...</p>;
  if (error) return <p style={{ color: 'red' }}>{error}</p>;

  return (
    <div className="versiones-container">
      <Link to="/admin/tipos">
        <FiChevronLeft /> Volver a Tipos de Trámite
      </Link>
      <h1>Historial de Versiones</h1>
      
      {versiones.length === 0 && !loading && (
        <div style={{ margin: '2rem 0', padding: '1rem', border: '1px dashed #333', background: 'var(--surface-dark)', borderRadius: '1rem' }}>
          <p style={{marginTop: 0, color: 'var(--text-secondary)'}}>Este tipo de trámite aún no tiene versiones.</p>
          <button onClick={handleCrearPrimeraVersion} className="btn-primary">
            <FiFilePlus /> Crear Versión 1 (Borrador)
          </button>
        </div>
      )}

      {versiones.length > 0 && (
        <div className="table-wrapper">
          <table className="tramites-table">
            <thead>
              <tr>
                <th>Nro. Versión</th>
                <th>Estado</th>
                <th>Vigencia Desde</th>
                <th>Vigencia Hasta</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {versiones.map(v => (
                <tr key={v.id}>
                  <td>{v.nroVersion}</td>
                  <td>
                    <span className={`estado-${v.estado?.toLowerCase()}`}>{v.estado}</span>
                  </td>
                  <td>{v.fechaHoraInicioVigencia ? new Date(v.fechaHoraInicioVigencia).toLocaleString() : 'N/A'}</td>
                  <td>{v.fechaHoraFinVigencia ? new Date(v.fechaHoraFinVigencia).toLocaleString() : 'N/A'}</td>
                  <td className="acciones-versiones">
                    {v.estado === 'Borrador' && (
                      <>
                        <button onClick={() => handleEditarFlujo(v.id)} className="btn-secondary"><FiEdit /> Editar Flujo</button>
                        <button onClick={() => handleActivar(v.id)} className="btn-primary"><FiCheck /> Activar</button>
                        <button onClick={() => handleEliminar(v.id)} className="btn-danger-outline"><FiTrash2 /> Eliminar</button>
                      </>
                    )}
                    {v.estado === 'Activo' && (
                      <>
                        <button onClick={() => handleEditarFlujo(v.id)} className="btn-secondary"><FiEye /> Ver Flujo</button>
                        <button onClick={() => handleClonar(v.id)} className="btn-primary"><FiCopy /> Clonar y Editar</button>
                      </>
                    )}
                    {(v.estado === 'Archivado' || v.estado === 'Programado') && (
                      <>
                        <button onClick={() => handleEditarFlujo(v.id)} className="btn-secondary"><FiEye /> Ver Flujo</button>
                        <button onClick={() => handleClonar(v.id)} className="btn-secondary"><FiCopy /> Clonar</button>
                      </>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default GestionVersiones;