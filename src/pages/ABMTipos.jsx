// src/pages/ABMTipos.jsx
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  listTipos,
  createTipo,
  updateTipo,
  deleteTipo,
} from '../services/adminApi';
import '../components/TramiteDashboard.css';

export default function ABMTipos() {
  const [tipos, setTipos] = useState([]);
  const [editingTipo, setEditingTipo] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    nombre: '',
    plazo_documentacion: '',
  });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState(null);

  const navigate = useNavigate();

  useEffect(() => {
    loadTipos();
  }, []);

  const loadTipos = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await listTipos();
      setTipos(data);
    } catch (error) {
      console.error('Error al cargar tipos:', error);
      setError('Error al cargar tipos: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    try {
      let payload;

      if (editingTipo) {
        // En edición solo permitimos cambiar el nombre
        payload = { nombre: formData.nombre };
        await updateTipo(editingTipo.id, payload);
      } else {
        // En alta se define también el plazo de documentación
        payload = {
          nombre: formData.nombre,
          plazo_documentacion: parseInt(formData.plazo_documentacion, 10),
        };
        await createTipo(payload);
      }

      await loadTipos();
      resetForm();
    } catch (error) {
      console.error('Error al guardar tipo:', error);
      setError('Error al guardar tipo: ' + error.message);
    }
  };

  const handleEdit = (tipo) => {
    setEditingTipo(tipo);
    setFormData({
      nombre: tipo.nombre,
      plazo_documentacion: tipo.plazo_documentacion.toString(),
    });
    setShowForm(true);
    setError(null);
  };

  const handleDelete = (id) => {
    setConfirmDeleteId(id);
  };

  const executeDelete = async () => {
    if (!confirmDeleteId) return;
    setError(null);
    try {
      await deleteTipo(confirmDeleteId);
      setConfirmDeleteId(null);
      await loadTipos();
    } catch (error) {
      console.error('Error al eliminar tipo:', error);
      setError('Error al eliminar tipo: ' + error.message);
    }
  };

  const resetForm = () => {
    setFormData({ nombre: '', plazo_documentacion: '' });
    setEditingTipo(null);
    setShowForm(false);
    setError(null);
  };

  const handleOpenForm = () => {
    resetForm();
    setShowForm(true);
  };

  const handleGestionarVersiones = (tipoId) => {
    navigate(`/admin/tipos/${tipoId}/versiones`);
  };

  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <h1>Tipos de Trámite</h1>
        <button onClick={handleOpenForm} className="btn-primary">
          + Nuevo Tipo
        </button>
      </div>

      {loading && <p>Cargando...</p>}
      {error && (
        <div className="error-message" style={{ marginBottom: '20px' }}>
          {error}
        </div>
      )}

      {/* Modal alta/edición tipo */}
      {showForm && (
        <div className="modal-backdrop" onMouseDown={resetForm}>
          <div
            className="modal-content"
            onMouseDown={(e) => e.stopPropagation()}
          >
            <h3>{editingTipo ? 'Editar Tipo' : 'Nuevo Tipo'}</h3>
            <form onSubmit={handleSubmit} className="tramite-form">
              <label>
                Nombre:
                <input
                  type="text"
                  value={formData.nombre}
                  onChange={(e) =>
                    setFormData({ ...formData, nombre: e.target.value })
                  }
                  required
                />
              </label>

              <label>
                Plazo de Documentación (días):
                <input
                  type="number"
                  value={formData.plazo_documentacion}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      plazo_documentacion: e.target.value,
                    })
                  }
                  required={!editingTipo} // solo requerido en alta
                  min="0"
                  disabled={!!editingTipo} // deshabilitado en edición
                  readOnly={!!editingTipo}
                />
              </label>
              {editingTipo && (
                <p
                  style={{
                    fontSize: '0.8rem',
                    color: '#9ca3af',
                    marginTop: 4,
                  }}
                >
                  El plazo de documentación no se puede modificar una vez creado
                  el tipo.
                </p>
              )}

              <div className="form-actions">
                <button type="submit" className="btn-primary">
                  {editingTipo ? 'Actualizar' : 'Crear'}
                </button>
                <button
                  type="button"
                  onClick={resetForm}
                  className="btn-secondary"
                >
                  Cancelar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal confirmación eliminación */}
      {confirmDeleteId && (
        <div className="modal-backdrop">
          <div className="modal-content" style={{ maxWidth: '400px' }}>
            <h3 style={{ marginTop: 0 }}>Confirmar Eliminación</h3>
            <p>
              ¿Está seguro de eliminar este tipo de trámite? Esta acción no se
              puede deshacer.
            </p>
            <div className="form-actions">
              <button
                type="button"
                onClick={executeDelete}
                className="btn-primary"
                style={{ backgroundColor: '#b91c1c' }}
              >
                Sí, Eliminar
              </button>
              <button
                type="button"
                onClick={() => setConfirmDeleteId(null)}
                className="btn-secondary"
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="table-wrapper">
        <table className="tramites-table">
          <thead>
            <tr>
              <th>Nombre</th>
              <th>Plazo de Documentación</th>
              <th>Precio actual</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {!loading &&
              tipos.map((tipo) => (
                <tr key={tipo.id}>
                  <td>{tipo.nombre}</td>
                  <td>{tipo.plazo_documentacion} días</td>
                  <td>
                    {tipo.precio_actual != null ? (
                      `AR$ ${tipo.precio_actual}`
                    ) : (
                      <span style={{ color: '#6b7280' }}>Sin precio</span>
                    )}
                  </td>
                  <td>
                    <button
                      onClick={() => handleEdit(tipo)}
                      className="btn-secondary"
                      style={{ marginRight: '10px' }}
                    >
                      Editar
                    </button>
                    <button
                      onClick={() => handleDelete(tipo.id)}
                      className="btn-secondary"
                      style={{
                        backgroundColor: '#b91c1c',
                        marginRight: '10px',
                      }}
                    >
                      Eliminar
                    </button>
                    <button
                      onClick={() => handleGestionarVersiones(tipo.id)}
                      className="btn-secondary"
                      title="Gestionar Versiones"
                    >
                      Versiones 📜
                    </button>
                  </td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
