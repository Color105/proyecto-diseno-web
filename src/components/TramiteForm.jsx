import React, { useState, useEffect } from 'react';
// ¡No usamos API_BASE hardcodeado!
// const API_BASE = 'http://localhost:3000';

// 1. Aceptamos 'token' y 'apiUrl' como props
function TramiteForm({ token, apiUrl, onClose, onTramiteCreated }) {
  const [monto, setMonto] = useState('');
  const [consultorId, setConsultorId] = useState('');
  const [tipoTramiteId, setTipoTramiteId] = useState('');
  
  const [consultores, setConsultores] = useState([]);
  const [tiposTramite, setTiposTramite] = useState([]);
  
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  // 2. useEffect para cargar los combos (selects)
  useEffect(() => {
    // No hacer nada si no tenemos el token
    if (!token) {
      setError("Error: No hay token de autenticación.");
      return;
    }

    const fetchCombos = async () => {
      setIsLoading(true);
      setError(null);
      
      // 3. Preparamos los headers de autenticación
      const authHeaders = {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      };

      try {
        // Usamos Promise.all para cargar ambos al mismo tiempo
        const [resConsultores, resTipos] = await Promise.all([
          fetch(`${apiUrl}/consultors`, { headers: authHeaders }), // <-- CORREGIDO: /consultores -> /consultors
          fetch(`${apiUrl}/tipo_tramites`, { headers: authHeaders })  // <-- CORREGIDO: /tipos_tramite -> /tipo_tramites
        ]);

        if (!resConsultores.ok || !resTipos.ok) {
          throw new Error('Error al cargar combos de selección');
        }

        const dataConsultores = await resConsultores.json();
        const dataTipos = await resTipos.json();

        setConsultores(Array.isArray(dataConsultores) ? dataConsultores : []);
        setTiposTramite(Array.isArray(dataTipos) ? dataTipos : []);

      } catch (err) {
        console.error(err);
        setError(err.message || 'No pude cargar consultores/tipos.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchCombos();
    // Dependemos de 'token' y 'apiUrl'
  }, [token, apiUrl]);


  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    const payload = {
      monto: parseFloat(monto),
      consultor_id: parseInt(consultorId, 10),
      tipo_tramite_id: parseInt(tipoTramiteId, 10),
    };

    try {
      // 4. Usamos 'token' y 'apiUrl' también para CREAR
      const response = await fetch(`${apiUrl}/tramites`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}` // ¡Autenticación!
        },
        body: JSON.stringify({ tramite: payload }), // Rails espera { tramite: { ... } }
      });

      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.error || errData.errors.join(', ') || 'Error al crear.');
      }

      const newTramite = await response.json();
      onTramiteCreated?.(newTramite); // Informamos al dashboard
      onClose(); // Cerramos el modal

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

