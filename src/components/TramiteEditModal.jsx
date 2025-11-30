import React, { useState } from 'react';

function TramiteEditModal({ tramite, onClose, onTramiteUpdated, token, apiUrl }) {
  // Usamos 'nombreEstadoTramite' (del dashboard) como valor del select
  const [newState, setNewState] = useState(
    tramite.estado_tramite?.nombreEstadoTramite || ''
  );

  const [error, setError] = useState(null);
  const [isUpdating, setIsUpdating] = useState(false);

  const handleUpdate = (e) => {
    e.preventDefault();

    const estadoActualNombre = tramite.estado_tramite?.nombreEstadoTramite || '';

    // Si no cambió el estado, no hay nada que guardar
    if (newState === estadoActualNombre) {
      setError('No hay cambios para guardar.');
      return;
    }

    setIsUpdating(true);
    setError(null);

    // 👇 Ahora SOLO mandamos el estado nuevo (sin monto)
    const payload = {
      new_state: newState, // Ej: "En Proceso"
    };

    fetch(`${apiUrl}/tramites/${tramite.id}/update_estado`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(payload),
    })
      .then((response) => {
        setIsUpdating(false);
        if (!response.ok) {
          return response.json().then((data) => {
            if (response.status === 401) throw new Error('Error de autenticación.');
            throw new Error(
              data.error ||
                data.details ||
                'Transición de estado inválida.'
            );
          });
        }
        return response.json();
      })
      .then((data) => {
        // 'data' es el trámite actualizado
        onTramiteUpdated(data);
        onClose();
      })
      .catch((err) => {
        console.error('Error al actualizar estado:', err);
        setError(err.message);
        setIsUpdating(false);
      });
  };

  // ---------- LÓGICA DEL DROPDOWN INTELIGENTE ----------

  // 1. Obtenemos los estados siguientes desde el trámite
  const siguientesEstados = tramite.posibles_siguientes_estados || [];

  // 2. Nos aseguramos de que el estado actual esté en la lista
  const estadoActual = tramite.estado_tramite;
  let estadosParaDropdown = [...siguientesEstados];

  if (
    estadoActual &&
    !siguientesEstados.find((e) => e.id === estadoActual.id)
  ) {
    estadosParaDropdown.unshift(estadoActual); // añade el actual al inicio
  }

  // ----------------------------------------------------

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <h3>Actualizar Trámite: {tramite.codigo || `TR-${tramite.id}`}</h3>

        <div style={{ color: '#cbd5e1', marginBottom: '1rem' }}>
          <p>
            <strong>Tipo:</strong> {tramite.tipo_tramite?.nombre || 'N/A'}
          </p>
          <p>
            <strong>Consultor:</strong>{' '}
            {tramite.consultor?.email || 'Sin asignar'}
          </p>
        </div>

        <div className="state-transition-section">
          <h4>
            Estado Actual:{' '}
            <span
              className={`status-${
                tramite.estado_tramite?.nombreEstadoTramite || 'desconocido'
              }`}
            >
              {tramite.estado_tramite?.nombreEstadoTramite || 'N/A'}
            </span>
          </h4>

          <form onSubmit={handleUpdate} className="tramite-form">
            {error && <div className="error-message">{error}</div>}

            <label>
              Nuevo Estado:
              <select
                value={newState}
                onChange={(e) => setNewState(e.target.value)}
                disabled={isUpdating || estadosParaDropdown.length === 0}
              >
                {estadosParaDropdown.length === 0 && estadoActual && (
                  <option
                    key={estadoActual.id}
                    value={estadoActual.nombreEstadoTramite}
                  >
                    {estadoActual.nombreEstadoTramite}
                  </option>
                )}

                {estadosParaDropdown.map((estado) => (
                  <option
                    key={estado.id}
                    value={estado.nombreEstadoTramite}
                  >
                    {estado.nombreEstadoTramite}
                  </option>
                ))}
              </select>
            </label>

            <div className="form-actions">
              <button
                type="submit"
                className="btn-primary"
                disabled={isUpdating || estadosParaDropdown.length === 0}
              >
                {isUpdating ? 'Aplicando...' : 'Aplicar Actualización'}
              </button>
              <button
                type="button"
                className="btn-secondary"
                onClick={onClose}
                disabled={isUpdating}
              >
                Cerrar
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default TramiteEditModal;
