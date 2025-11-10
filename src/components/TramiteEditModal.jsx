import React, { useState } from 'react';

// --- ¡ELIMINAMOS LA LISTA HARCODEADA! ---
// const ALL_POSSIBLE_STATES = [ ... ]; // <-- ELIMINADA

function TramiteEditModal({ tramite, onClose, onTramiteUpdated, token, apiUrl }) {
    
    const [newMonto, setNewMonto] = useState((tramite.monto || 0).toString());
    
    // Usamos 'nombreEstadoTramite' (del dashboard)
    const [newState, setNewState] = useState(tramite.estado_tramite?.nombreEstadoTramite || '');
    
    const [error, setError] = useState(null);
    const [isUpdating, setIsUpdating] = useState(false);

    const handleUpdate = (e) => { 
        e.preventDefault();
        
        const currentMonto = parseFloat(tramite.monto || 0);
        const submittedMonto = parseFloat(newMonto);
        
        // Usamos 'nombreEstadoTramite' para la comparación
        if (newState === (tramite.estado_tramite?.nombreEstadoTramite) && submittedMonto === currentMonto) {
            setError("No hay cambios para guardar.");
            return;
        }

        setIsUpdating(true);
setError(null);
        
        const payload = { 
            monto: submittedMonto,
            new_state: newState // Enviamos el nombre del estado (ej: "En Proceso")
        };

        fetch(`${apiUrl}/tramites/${tramite.id}/update_estado`, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(payload),
        })
        .then(response => {
            setIsUpdating(false);
            if (!response.ok) {
                return response.json().then(data => {
                    if (response.status === 401) throw new Error('Error de autenticación.');
                    // El error vendrá del backend (ej: "Transición no permitida: Ingresado -> Terminado")
                    throw new Error(data.error || data.details || 'Transición de estado inválida.');
                });
            }
            return response.json();
        })
        .then(data => {
            // 'data' es el trámite actualizado, que ya incluye el nuevo 'posibles_siguientes_estados'
            onTramiteUpdated(data); 
            onClose();
        })
        .catch(err => {
            console.error("Error al actualizar estado/monto:", err);
            setError(err.message);
            setIsUpdating(false);
        });
    };

    // --- LÓGICA DEL DROPDOWN INTELIGENTE ---
    // El backend ahora nos da la lista de estados válidos en 'tramite.posibles_siguientes_estados'
    
    // 1. Obtenemos los estados siguientes desde el trámite
    const siguientesEstados = tramite.posibles_siguientes_estados || [];
    
    // 2. Nos aseguramos de que el estado actual (estado_tramite) esté en la lista
    //    Esto es para que el usuario pueda cambiar SÓLO el monto sin cambiar el estado.
    const estadoActual = tramite.estado_tramite;
    let estadosParaDropdown = [...siguientesEstados];
    
    if (estadoActual && !siguientesEstados.find(e => e.id === estadoActual.id)) {
      estadosParaDropdown.unshift(estadoActual); // Añade el estado actual al inicio
    }
    // --- FIN LÓGICA DROPDOWN ---

    return (
        <div className="modal-backdrop" onClick={onClose}> 
            <div className="modal-content" onClick={e => e.stopPropagation()}>
                <h3>Actualizar Trámite: {tramite.codigo || `TR-${tramite.id}`}</h3>
                
                <div style={{color: '#cbd5e1', marginBottom: '1rem'}}>
                    <p><strong>Tipo:</strong> {tramite.tipo_tramite?.nombre || 'N/A'}</p>
                    <p><strong>Consultor:</strong> {tramite.consultor?.email || 'Sin asignar'}</p>
                </div>
                
                <div className="state-transition-section">
                    {/* Usamos 'nombreEstadoTramite' */}
                    <h4>Estado Actual: <span className={`status-${tramite.estado_tramite?.nombreEstadoTramite || 'desconocido'}`}>{tramite.estado_tramite?.nombreEstadoTramite || 'N/A'}</span></h4>
                    
                    <form onSubmit={handleUpdate} className="tramite-form">
                        {error && <div className="error-message">{error}</div>}

                        <label>
                            Monto del Servicio ($):
                            <input 
                                type="number" 
                                value={newMonto}
                                onChange={(e) => setNewMonto(e.target.value)}
                                min="0"
                                step="0.01"
                                required
                            />
                        </label>
                        
                        <label>
                            Nuevo Estado:
                            {/* --- CAMBIO GRANDE: EL DROPDOWN AHORA ES INTELIGENTE --- */}
                            <select
                                value={newState}
                                onChange={(e) => setNewState(e.target.value)}
                                disabled={isUpdating}
                            >
                                {/* Si no hay estados (ej: un estado final), mostramos solo el actual */}
                                {estadosParaDropdown.length === 0 && estadoActual && (
                                     <option key={estadoActual.id} value={estadoActual.nombreEstadoTramite}>
                                        {estadoActual.nombreEstadoTramite}
                                    </option>
                                )}
                                
                                {/* Mapeamos la lista filtrada que viene del backend */}
                                {estadosParaDropdown.map(estado => (
                                    <option key={estado.id} value={estado.nombreEstadoTramite}>
                                        {estado.nombreEstadoTramite}
                                    </option>
                                ))}
                            </select>
                        </label>

                        <div className="form-actions">
                            <button type="submit" className="btn-primary" disabled={isUpdating}>
                                {isUpdating ? 'Aplicando...' : 'Aplicar Actualización'}
                            </button>
                            <button type="button" className="btn-secondary" onClick={onClose} disabled={isUpdating}>
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