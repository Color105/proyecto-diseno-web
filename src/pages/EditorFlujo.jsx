// src/pages/EditorFlujo.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { 
  getVersionDetalle, 
  listEstados,
  addTransicion, 
  deleteTransicion 
} from '../services/adminApi';
import { FiPlus, FiTrash2, FiChevronLeft } from 'react-icons/fi';
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
      
      const estados = estadosRes.data || [];
      setVersionData(versionRes.data);
      setTodosLosEstados(estados);
      
      if (estados.length > 0) {
        // 1. El default "Desde:" SIEMPRE es el estado inicial
        const estadoInicial = estados.find(e => e.es_estado_inicial);
        // Si ya hay un 'origenId' seleccionado, lo respetamos, si no, usamos el inicial
        setOrigenId(currentId => currentId || estadoInicial?.id || '');
        
        // 2. El default "Hacia:" es el primer estado NO inicial
        const primerDestino = estados.find(e => !e.es_estado_inicial);
        setSiguienteId(currentId => currentId || primerDestino?.id || '');
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
      const errorMsg = error.response?.data?.errors?.join(", ") || 
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

  // --- LÓGICA DE FILTRADO DE DROPDOWNS ---

  // 1. Lista para "HACIA:" (Todos MENOS el inicial)
  const estadosDeDestinoDisponibles = todosLosEstados.filter(e => e.es_estado_inicial === false);

  // 2. Lista para "DESDE:"
  // IDs de los estados que ya son un destino en el circuito
  const estadosAlcanzadosIds = new Set(
    circuito.flatMap(c => c.posiblesDestinos.map(d => d.estado.id))
  );
  
  // La lista "Desde" contiene:
  // 1. El estado inicial (SIEMPRE)
  // 2. Cualquier estado que ya haya sido "alcanzado"
  const estadosDeOrigenDisponibles = todosLosEstados.filter(e => 
    e.es_estado_inicial === true || 
    estadosAlcanzadosIds.has(e.id)
  );

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
              {/* Usamos la lista filtrada 'estadosDeOrigenDisponibles' */}
              {estadosDeOrigenDisponibles.map(e => <option key={e.id} value={e.id}>{e.nombreEstadoTramite}</option>)}
            </select>
          </div>
          <div>
            <label>Hacia:</label>
            <select value={siguienteId} onChange={e => setSiguienteId(e.target.value)}>
              {/* Usamos la lista filtrada 'estadosDeDestinoDisponibles' */}
              {estadosDeDestinoDisponibles.map(e => <option key={e.id} value={e.id}>{e.nombreEstadoTramite}</option>)}
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
        {circuito.length === 0 && esEditable && <p>Este circuito está vacío. Empieza añadiendo una transición desde 'Ingresado'.</p>}
      </div>
    </div>
  );
};

export default EditorFlujo;