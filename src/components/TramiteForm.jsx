// src/components/TramiteForm.jsx
import React, { useState, useEffect } from 'react';
// ¡No usamos API_BASE hardcodeado!
// const API_BASE = 'http://localhost:3000';

// 1. Aceptamos 'token' y 'apiUrl' como props
function TramiteForm({ token, apiUrl, onClose, onTramiteCreated }) {
  const [monto, setMonto] = useState('');
  const [consultorId, setConsultorId] = useState('');
  const [tipoTramiteId, setTipoTramiteId] = useState('');
  const [clienteId, setClienteId] = useState(''); // <-- 1. AÑADIR ESTADO PARA CLIENTE

  const [consultores, setConsultores] = useState([]);
  const [tiposTramite, setTiposTramite] = useState([]);
  const [clientes, setClientes] = useState([]); // <-- 2. AÑADIR ESTADO PARA LISTA DE CLIENTES
  
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  // 2. useEffect para cargar los combos (selects)
  useEffect(() => {
    if (!token) {
      setError("Error: No hay token de autenticación.");
      return;
    }

    const fetchCombos = async () => {
      setIsLoading(true);
      setError(null);
      
      const authHeaders = {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      };

      try {
        // --- 3. AÑADIR FETCH DE CLIENTES A PROMISE.ALL ---
        const [resConsultores, resTipos, resClientes] = await Promise.all([
          fetch(`${apiUrl}/consultors`, { headers: authHeaders }),
          fetch(`${apiUrl}/tipo_tramites`, { headers: authHeaders }),
          fetch(`${apiUrl}/clientes`, { headers: authHeaders }) // <-- AÑADIDO
        ]);

        if (!resConsultores.ok || !resTipos.ok || !resClientes.ok) { // <-- AÑADIDO
          throw new Error('Error al cargar combos de selección');
        }

        const dataConsultores = await resConsultores.json();
        const dataTipos = await resTipos.json();
        const dataClientes = await resClientes.json(); // <-- AÑADIDO

        setConsultores(Array.isArray(dataConsultores) ? dataConsultores : []);
        setTiposTramite(Array.isArray(dataTipos) ? dataTipos : []);
        setClientes(Array.isArray(dataClientes) ? dataClientes : []); // <-- AÑADIDO

      } catch (err) {
        console.error(err);
        setError(err.message || 'No pude cargar consultores/tipos/clientes.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchCombos();
  }, [token, apiUrl]);


  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    // --- 4. AÑADIR CLIENTE_ID AL PAYLOAD ---
    const payload = {
      monto: parseFloat(monto),
      consultor_id: parseInt(consultorId, 10),
      tipo_tramite_id: parseInt(tipoTramiteId, 10),
      cliente_id: parseInt(clienteId, 10) // <-- AÑADIDO
    };

    try {
      const response = await fetch(`${apiUrl}/tramites`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ tramite: payload }), 
      });

      if (!response.ok) {
        const errData = await response.json();
        // El error ahora vendrá de nuestro controller
        const errorMsg = errData.error || errData.errors.join(', ') || 'Error al crear.';
        throw new Error(errorMsg);
      }

      const newTramite = await response.json();
      onTramiteCreated?.(newTramite);
      onClose();

    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  // Renderizado (usa las clases de tu CSS)
  return (
    <div className="modal-backdrop" onMouseDown={onClose}>
      <div className="modal-content" onMouseDown={(e) => e.stopPropagation()}>
        <h3>Crear Nuevo Trámite</h3>

        <form onSubmit={handleSubmit} className="tramite-form">
          
          {error && <div className="error-message">{error}</div>}

          {/* --- 5. AÑADIR EL DROPDOWN DE CLIENTE --- */}
          <label>
            Cliente:
            <select
              value={clienteId}
              onChange={(e) => setClienteId(e.target.value)}
              disabled={isLoading}
              required
            >
              <option value="">Seleccione un cliente</option>
              {clientes.map(c => (
                // Asumo que tu modelo Cliente tiene 'nombre_apellido_cliente'
                <option key={c.id} value={c.id}>{c.nombre_apellido_cliente}</option> 
              ))}
            </select>
          </label>

          <label>
            Consultor Responsable:
            <select
              value={consultorId}
              onChange={(e) => setConsultorId(e.target.value)}
              disabled={isLoading}
              required
            >
              <option value="">Seleccione un consultor</option>
              {consultores.map(c => (
                <option key={c.id} value={c.id}>{c.nombre} ({c.email})</option>
              ))}
            </select>
          </label>

          <label>
            Tipo de Trámite:
            <select
              value={tipoTramiteId}
              onChange={(e) => setTipoTramiteId(e.target.value)}
              disabled={isLoading}
              required
            >
              <option value="">Seleccione un tipo</option>
              {tiposTramite.map(t => (
                <option key={t.id} value={t.id}>{t.nombre}</option>
              ))}
            </select>
          </label>

          <label>
            Monto del Servicio ($):
            <input
              type="number"
              value={monto}
              onChange={(e) => setMonto(e.target.value)}
              min="0"
              step="0.01"
              disabled={isLoading}
              required
              placeholder='0.00'
            />
          </label>

          <div className="form-actions">
            <button type="submit" className="btn-primary" disabled={isLoading}>
              {isLoading ? 'Creando...' : 'Crear Trámite'}
            </button>
            <button type="button" className="btn-secondary" onClick={onClose} disabled={isLoading}>
              Cancelar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default TramiteForm;