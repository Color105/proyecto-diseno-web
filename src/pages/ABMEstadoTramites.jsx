import React, { useState, useEffect } from 'react';
// Debes crear estas funciones en tu archivo services/adminApi.js
// usando la estructura del backend (ej: /estado_tramites.json)
import { 
  listEstados, 
  createEstado, 
  updateEstado, 
  deleteEstado 
} from '../services/adminApi'; // <-- CORRECCIÓN 1: Coincide mayúsculas 'AdminApi'

import './ABMEstadoTramites.css'; // <-- CORRECCIÓN 2: Se agregó la 's'

// Componente principal para la gestión de Estados de Trámite
export default function ABMEstadoTramites() {
  const [estados, setEstados] = useState([]);
  const [editingEstado, setEditingEstado] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    codEstadoTramite: '',
    nombreEstadoTramite: ''
  });

  useEffect(() => {
    loadEstados();
  }, []);

  const loadEstados = async () => {
    setLoading(true);
    try {
      // La API debe devolver un array de objetos EstadoTramite
      const data = await listEstados();
      setEstados(data || []);
    } catch (error) {
      console.error('Error al cargar estados de trámite:', error);
      // Usar modal o mensaje de error, no alert()
      alert('Error al cargar estados de trámite: ' + (error.message || 'Error desconocido'));
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingEstado) {
        // Llama a PUT/PATCH
        await updateEstado(editingEstado.id, formData);
      } else {
        // Llama a POST
        await createEstado(formData);
      }
      loadEstados();
      resetForm();
    } catch (error) {
      console.error('Error al guardar estado de trámite:', error);
      alert('Error al guardar estado de trámite: ' + (error.message || 'Verifique la conexión y los campos.'));
    }
  };

  const handleEdit = (estado) => {
    setEditingEstado(estado);
    setFormData({
      codEstadoTramite: estado.codEstadoTramite,
      nombreEstadoTramite: estado.nombreEstadoTramite
    });
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('¿Está seguro de eliminar este estado de trámite?')) return;
    try {
      // Llama a DELETE
      await deleteEstado(id);
      loadEstados();
    } catch (error) {
      console.error('Error al eliminar estado de trámite:', error);
      alert('Error al eliminar: ' + (error.message || 'Asegúrese de que no tenga trámites o historiales asociados.'));
    }
  };

  const resetForm = () => {
    setFormData({ codEstadoTramite: '', nombreEstadoTramite: '' });
    setEditingEstado(null);
    setShowForm(false);
  };

  if (loading) {
    return (
      <div className="dashboard-container">
        <h1 className="text-xl font-semibold mb-4">Cargando Estados de Trámite...</h1>
        <p>Por favor, espere.</p>
      </div>
    );
  }

  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <h1>Gestión de Estados de Trámite</h1>
        <button onClick={() => setShowForm(true)} className="btn-primary">
          Nuevo Estado
        </button>
      </div>

      {showForm && (
        <div className="form-container">
          <h2>{editingEstado ? 'Editar Estado de Trámite' : 'Nuevo Estado de Trámite'}</h2>
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="codEstado">Código:</label>
              <input
                id="codEstado"
                type="text"
                value={formData.codEstadoTramite}
                onChange={(e) => setFormData({ ...formData, codEstadoTramite: e.target.value })}
                required
                maxLength={50}
              />
            </div>
            <div className="form-group">
              <label htmlFor="nombreEstado">Nombre:</label>
              <input
                id="nombreEstado"
                type="text"
                value={formData.nombreEstadoTramite}
                onChange={(e) => setFormData({ ...formData, nombreEstadoTramite: e.target.value })}
                required
                maxLength={100}
              />
            </div>
            <div className="form-buttons">
              <button type="submit" className="btn-primary">
                {editingEstado ? 'Actualizar' : 'Crear'}
              </button>
              <button type="button" onClick={resetForm} className="btn-secondary">
                Cancelar
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="table-container">
        <table>
          <thead>
            <tr>
              <th>Código</th>
              <th>Nombre</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {estados.length > 0 ? (
              estados.map((estado) => (
                <tr key={estado.id}>
                  <td>{estado.codEstadoTramite}</td>
                  <td>{estado.nombreEstadoTramite}</td>
                  <td>
                    <button onClick={() => handleEdit(estado)} className="btn-edit">
                      Editar
                    </button>
                    <button onClick={() => handleDelete(estado.id)} className="btn-delete">
                      Eliminar
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="3" className="text-center p-4 text-gray-500">
                  No hay estados de trámite registrados.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}