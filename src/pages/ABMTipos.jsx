// src/pages/ABMTipos.jsx
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom'; // <-- 1. IMPORTAR useNavigate
import { listTipos, createTipo, updateTipo, deleteTipo } from '../services/adminApi';
import '../components/TramiteDashboard.css'; // Reutilizamos el CSS general

export default function ABMTipos() {
  const [tipos, setTipos] = useState([]);
  const [editingTipo, setEditingTipo] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    nombre: '',
    plazo_documentacion: ''
  });
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState(null);

  const navigate = useNavigate(); // <-- 2. INICIALIZAR EL HOOK

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
      console.error("Error al cargar tipos:", error);
      setError('Error al cargar tipos: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    try {
      const payload = {
        nombre: formData.nombre,
        plazo_documentacion: parseInt(formData.plazo_documentacion, 10) // Convertir a número
      };

      if (editingTipo) {
        await updateTipo(editingTipo.id, payload);
      } else {
        await createTipo(payload);
      }
      loadTipos();
      resetForm();
    } catch (error) {
      console.error("Error al guardar tipo:", error);
      setError('Error al guardar tipo: ' + error.message);
    }
  };

  const handleEdit = (tipo) => {
    setEditingTipo(tipo);
    setFormData({
      nombre: tipo.nombre,
      plazo_documentacion: tipo.plazo_documentacion.toString()
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
      loadTipos();
    } catch (error) {
      console.error("Error al eliminar tipo:", error);
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
  }

  // <-- 3. AÑADIR LA FUNCIÓN PARA NAVEGAR
  const handleGestionarVersiones = (tipoId) => {
    navigate(`/admin/tipos/${tipoId}/versiones`);
  };

  return (
    // ¡Aquí usamos el .dashboard-container más simple!
    <div className="dashboard-container">
      <div className="dashboard-header">
        <h1>Tipos de Trámite</h1>
        <button onClick={handleOpenForm} className="btn-primary">
          + Nuevo Tipo
        </button>
      </div>

      {loading && <p>Cargando...</p>}
      {error && <div className="error-message" style={{marginBottom: '20px'}}>{error}</div>}

      {showForm && (
        <div className="modal-backdrop" onMouseDown={resetForm}>
          <div className="modal-content" onMouseDown={(e) => e.stopPropagation()}>
            <h3>{editingTipo ? 'Editar Tipo' : 'Nuevo Tipo'}</h3>
            <form onSubmit={handleSubmit} className="tramite-form">
              <label>
                Nombre:
                <input
                  type="text"
                  value={formData.nombre}
                  onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                  required
                />
              </label>
              <label>
                Plazo de Documentación (días):
                <input
                  type="number"
                  value={formData.plazo_documentacion}
                  onChange={(e) => setFormData({ ...formData, plazo_documentacion: e.target.value })}
                  required
                  min="0"
                />
              </label>
              <div className="form-actions">
                <button type="submit" className="btn-primary">
                  {editingTipo ? 'Actualizar' : 'Crear'}
                </button>
                <button type="button" onClick={resetForm} className="btn-secondary">
                  Cancelar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {confirmDeleteId && (
         <div className="modal-backdrop">
           <div className="modal-content" style={{maxWidth: '400px'}}>
             <h3 style={{marginTop: 0}}>Confirmar Eliminación</h3>
             <p>¿Está seguro de eliminar este tipo de trámite? Esta acción no se puede deshacer.</p>
             <div className="form-actions">
                <button type="button" onClick={executeDelete} className="btn-primary" style={{backgroundColor: '#b91c1c'}}>
                  Sí, Eliminar
                </button>
                <button type="button" onClick={() => setConfirmDeleteId(null)} className="btn-secondary">
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
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {!loading && tipos.map((tipo) => (
              <tr key={tipo.id}>
                <td>{tipo.nombre}</td>
                <td>{tipo.plazo_documentacion} días</td>
                <td>
                  <button onClick={() => handleEdit(tipo)} className="btn-secondary" style={{marginRight: '10px'}}>
                    Editar
                  </button>
                  <button onClick={() => handleDelete(tipo.id)} className="btn-secondary" style={{backgroundColor: '#b91c1c', marginRight: '10px'}}>
                    Eliminar
                  </button>
                  
                  {/* // <-- 3. AÑADIR EL BOTÓN DE VERSIONES */}
                  <button onClick={() => handleGestionarVersiones(tipo.id)} className="btn-secondary" title="Gestionar Versiones">
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