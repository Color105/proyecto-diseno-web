import React, { useState } from 'react';
// ¡No importamos 'TramiteDashboard.css' aquí, ya está cargado en el Dashboard!

// const API_BASE = 'http://localhost:3000'; // <-- 1. Eliminado

const ALL_POSSIBLE_STATES = [
    'ingresado', 'asignado', 'en_proceso', 'suspendido', 'terminado', 'cancelado'
];

// --- 2. ACEPTAMOS 'token' Y 'apiUrl' COMO PROPS ---
function TramiteEditModal({ tramite, onClose, onTramiteUpdated, token, apiUrl }) {
    
    // El 'toString()' es importante por si el monto es 0 o null
    const [newMonto, setNewMonto] = useState((tramite.monto || 0).toString());
    const [newState, setNewState] = useState(tramite.estado_tramite?.nombre || 'ingresado');
    
    const [error, setError] = useState(null);
    const [isUpdating, setIsUpdating] = useState(false);

    const handleUpdate = (e) => { 
        e.preventDefault();
        
        const currentMonto = parseFloat(tramite.monto || 0);
        const submittedMonto = parseFloat(newMonto);

        if (newState === (tramite.estado_tramite?.nombre) && submittedMonto === currentMonto) {
            setError("No hay cambios para guardar.");
            return;
        }

        setIsUpdating(true);
        setError(null);
        
        const payload = { 
            monto: submittedMonto,
            new_state: newState 
        };

        // --- 3. USAMOS 'apiUrl' Y 'token' ---
        fetch(`${apiUrl}/tramites/${tramite.id}/update_estado`, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}` // ¡Autenticación!
            },
            body: JSON.stringify(payload),
        })
        .then(response => {
            setIsUpdating(false);
            if (!response.ok) {
                return response.json().then(data => {
                    // El error 401 es 'No autorizado'
                    if (response.status === 401) throw new Error('Error de autenticación. Intenta iniciar sesión de nuevo.');
                    throw new Error(data.error || data.details || 'Transición de estado inválida.');
                });
            }
            return response.json();
        })
        .then(data => {
            // alert(`Actualización exitosa: ${data.message || 'Datos guardados.'}`); // <-- 4. Eliminamos alert()
            console.log("Trámite actualizado:", data);
            
            // Asumimos que 'data' es el trámite actualizado
            onTramiteUpdated(data); 
            
            onClose();
        })
        .catch(err => {
            console.error("Error al actualizar estado/monto:", err);
            setError(err.message);
            setIsUpdating(false);
        });
    };

    return (
        // Todos los 'className' ya coinciden con tu CSS
        <div className="modal-backdrop" onClick={onClose}> 
            <div className="modal-content" onClick={e => e.stopPropagation()}>
                <h3>Actualizar Trámite: {tramite.codigo || `TR-${tramite.id}`}</h3>
                
                <div style={{color: '#cbd5e1', marginBottom: '1rem'}}>
                    <p><strong>Tipo:</strong> {tramite.tipo_tramite?.nombre || 'N/A'}</p>
                    <p><strong>Consultor:</strong> {tramite.consultor?.email || 'Sin asignar'}</p>
                </div>
                
                <div className="state-transition-section">
                    <h4>Estado Actual: <span className={`status-${tramite.estado_tramite?.nombre || 'desconocido'}`}>{tramite.estado_tramite?.nombre || 'N/A'}</span></h4>
                    
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
                            <select
                                value={newState}
                                onChange={(e) => setNewState(e.target.value)}
                                disabled={isUpdating}
                            >
                                {ALL_POSSIBLE_STATES.map(state => (
                                    <option key={state} value={state}>
                                        {state.replace(/_/g, ' ')}
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
