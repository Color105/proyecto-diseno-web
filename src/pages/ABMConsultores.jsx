import { useState, useEffect } from 'react';
import { listConsultores, createConsultor, updateConsultor, deleteConsultor } from '../services/adminApi';
import './ABMConsultores.css';

export default function ABMConsultores() {
  const [consultores, setConsultores] = useState([]);
  const [editingConsultor, setEditingConsultor] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    nombre: '',
    email: ''
  });

  useEffect(() => {
    loadConsultores();
  }, []);

  const loadConsultores = async () => {
    try {
      const data = await listConsultores();
      setConsultores(data);
    } catch (error) {
      alert('Error al cargar consultores: ' + error.message);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingConsultor) {
        await updateConsultor(editingConsultor.id, formData);
      } else {
        await createConsultor(formData);
      }
      loadConsultores();
      resetForm();
    } catch (error) {
      alert('Error al guardar consultor: ' + error.message);
    }
  };

  const handleEdit = (consultor) => {
    setEditingConsultor(consultor);
    setFormData({
      nombre: consultor.nombre,
      email: consultor.email
    });
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (!confirm('¿Está seguro de eliminar este consultor?')) return;
    try {
      await deleteConsultor(id);
      loadConsultores();
    } catch (error) {
      alert('Error al eliminar consultor: ' + error.message);
    }
  };

  const resetForm = () => {
    setFormData({ nombre: '', email: '' });
    setEditingConsultor(null);
    setShowForm(false);
  };

  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <h1>Consultores</h1>
        <button onClick={() => setShowForm(true)} className="btn-primary">
          Nuevo Consultor
        </button>
      </div>

      {showForm && (
        <div className="form-container">
          <h2>{editingConsultor ? 'Editar Consultor' : 'Nuevo Consultor'}</h2>
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
              <label>Email:</label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                required
              />
            </div>
            <div className="form-buttons">
              <button type="submit" className="btn-primary">
                {editingConsultor ? 'Actualizar' : 'Crear'}
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
              <th>Email</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {consultores.map((consultor) => (
              <tr key={consultor.id}>
                <td>{consultor.nombre}</td>
                <td>{consultor.email}</td>
                <td>
                  <button onClick={() => handleEdit(consultor)} className="btn-edit">
                    Editar
                  </button>
                  <button onClick={() => handleDelete(consultor.id)} className="btn-delete">
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
