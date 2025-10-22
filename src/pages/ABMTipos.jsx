import { useState, useEffect } from 'react';
import { listTipos, createTipo, updateTipo, deleteTipo } from '../services/adminApi';
import './ABMTipos.css';

export default function ABMTipos() {
  const [tipos, setTipos] = useState([]);
  const [editingTipo, setEditingTipo] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    nombre: '',
    plazo_documentacion: 0
  });

  useEffect(() => {
    loadTipos();
  }, []);

  const loadTipos = async () => {
    try {
      const data = await listTipos();
      setTipos(data);
    } catch (error) {
      alert('Error al cargar tipos de trámite: ' + error.message);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingTipo) {
        await updateTipo(editingTipo.id, formData);
      } else {
        await createTipo(formData);
      }
      loadTipos();
      resetForm();
    } catch (error) {
      alert('Error al guardar tipo de trámite: ' + error.message);
    }
  };

  const handleEdit = (tipo) => {
    setEditingTipo(tipo);
    setFormData({
      nombre: tipo.nombre,
      plazo_documentacion: tipo.plazo_documentacion
    });
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (!confirm('¿Está seguro de eliminar este tipo de trámite?')) return;
    try {
      await deleteTipo(id);
      loadTipos();
    } catch (error) {
      alert('Error al eliminar tipo de trámite: ' + error.message);
    }
  };

  const resetForm = () => {
    setFormData({ nombre: '', plazo_documentacion: 0 });
    setEditingTipo(null);
    setShowForm(false);
  };

  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <h1>Tipos de Trámite</h1>
        <button onClick={() => setShowForm(true)} className="btn-primary">
          Nuevo Tipo
        </button>
      </div>

      {showForm && (
        <div className="form-container">
          <h2>{editingTipo ? 'Editar Tipo de Trámite' : 'Nuevo Tipo de Trámite'}</h2>
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label>Nombre:</label>
              <input
                type="text"
                value={formData.nombre}
                onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                required
              />
            </div>
            <div className="form-group">
              <label>Plazo de Documentación:</label>
              <input
                type="number"
                value={formData.plazo_documentacion}
                onChange={(e) => setFormData({ ...formData, plazo_documentacion: parseInt(e.target.value, 10) || 0 })}
                required
              />
            </div>
            <div className="form-buttons">
              <button type="submit" className="btn-primary">
                {editingTipo ? 'Actualizar' : 'Crear'}
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
              <th>Nombre</th>
              <th>Plazo de Documentación</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {tipos.map((tipo) => (
              <tr key={tipo.id}>
                <td>{tipo.nombre}</td>
                <td>{tipo.plazo_documentacion}</td>
                <td>
                  <button onClick={() => handleEdit(tipo)} className="btn-edit">
                    Editar
                  </button>
                  <button onClick={() => handleDelete(tipo.id)} className="btn-delete">
                    Eliminar
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