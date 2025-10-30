// src/pages/EditorFlujo.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { 
  getVersionDetalle, 
  listEstados,
  addTransicion, 
  deleteTransicion 
} from '../services/adminApi';
// Importamos los íconos minimalistas
import { FiPlus, FiTrash2, FiChevronLeft } from 'react-icons/fi';
// Importamos el CSS nuevo
import './EditorFlujo.css'; 

const EditorFlujo = () => {
  const { versionId } = useParams();
  const navigate = useNavigate();
  
  const [versionData, setVersionData] = useState(null);
  const [todosLosEstados, setTodosLosEstados] = useState([]);
  const [loading, setLoading] = useState(true);

  const [origenId, setOrigenId] = useState('');
  const [siguienteId, setSiguienteId] = useState('');

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const [versionRes, estadosRes] = await Promise.all([
        getVersionDetalle(versionId),
        listEstados() 
      ]);
      
      setVersionData(versionRes.data);
      setTodosLosEstados(estadosRes.data);
      
      if (estadosRes.data.length > 0) {
        setOrigenId(currentId => currentId || estadosRes.data[0].id);
        setSiguienteId(currentId => currentId || estadosRes.data[0].id);
      }
    } catch (error) {
      console.error("Error al cargar datos del editor", error);
      alert('Error al cargar datos: ' + (error.response?.data?.error || error.message));
    } finally {
      setLoading(false);
    }
  }, [versionId]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleAddTransicion = async (e) => {
    e.preventDefault();
    if (!origenId || !siguienteId) {
      alert('Debes seleccionar un estado de origen y uno siguiente.');
      return;
    }
    try {
      await addTransicion(versionId, origenId, siguienteId);
      fetchData(); 
    } catch (error) {
      const errorMsg = error.response?.data?.errors?.base?.join(", ") || 
                       error.response?.data?.errors?.join(", ") || 
                       "Error desconocido";
      alert('Error al añadir la transición: ' + errorMsg);
    }
  };
  
  const handleDeleteTransicion = async (transicionId) => {
    if (window.confirm('¿Seguro que quieres eliminar esta transición?')) {
      try {
        await deleteTransicion(transicionId);
        fetchData(); // Recargar
      } catch (err) {
        alert('Error al eliminar: ' + (err.response?.data?.error || err.message));
      }
    }
  };

  if (loading) return <p>Cargando editor de flujo...</p>;
  if (!versionData) return <p>No se encontraron datos de la versión.</p>;

  const { version, circuito } = versionData;
  const esEditable = version.estado === 'Borrador';

  return (
    <div className="editor-container">
      <Link to={`/admin/tipos/${version.tipo_tramite_id}/versiones`}>
        <FiChevronLeft /> Volver al Historial
      </Link>
      
      <h1>{esEditable ? 'Editando' : 'Viendo'} Flujo de la Versión {version.nroVersion}</h1>
      <p>Estado de la versión: <strong>{version.estado}</strong></p>
      
      {esEditable && (
        <form onSubmit={handleAddTransicion} className="form-transicion">
          <div>
            <label>Desde:</label>
            <select value={origenId} onChange={e => setOrigenId(e.target.value)}>
              {todosLosEstados.map(e => <option key={e.id} value={e.id}>{e.nombreEstadoTramite}</option>)}
            </select>
          </div>
          <div>
            <label>Hacia:</label>
            <select value={siguienteId} onChange={e => setSiguienteId(e.target.value)}>
              {todosLosEstados.map(e => <option key={e.id} value={e.id}>{e.nombreEstadoTramite}</option>)}
            </select>
          </div>
          <button type="submit" className="btn-add">
            <FiPlus /> Añadir
          </button>
        </form>
      )}

      <h2>Circuito Actual</h2>
      <div className="circuito-diagrama">
        {circuito.map(({ estadoTramite, posiblesDestinos }) => (
          <div key={estadoTramite.id} className="nodo-origen">
            <h4>De: <strong>{estadoTramite.nombreEstadoTramite}</strong></h4>
            <ul>
              {posiblesDestinos.map(destino => (
                <li key={destino.transicion_id}>
                  <span>→ {destino.estado.nombreEstadoTramite}</span>
                  {esEditable && (
                    <button 
                      onClick={() => handleDeleteTransicion(destino.transicion_id)}
                      className="delete-transicion"
                      title="Eliminar esta transición"
                    >
                      <FiTrash2 />
                    </button>
                  )}
                </li>
              ))}
              {posiblesDestinos.length === 0 && <li><em>(Sin transiciones de salida)</em></li>}
            </ul>
          </div>
        ))}
        {circuito.length === 0 && !esEditable && <p>Este circuito no tiene transiciones.</p>}
        {circuito.length === 0 && esEditable && <p>Este circuito está vacío. Empieza añadiendo transiciones en el formulario de arriba.</p>}
      </div>
    </div>
  );
};

export default EditorFlujo;