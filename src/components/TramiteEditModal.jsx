// src/components/TramiteEditModal.jsx
import React, { useState } from 'react';

const API_BASE = 'http://localhost:3000';

const ALL_POSSIBLE_STATES = [
    'ingresado', 'asignado', 'en_proceso', 'suspendido', 'terminado', 'cancelado'
];

function TramiteEditModal({ tramite, onClose, onTramiteUpdated }) {
    const [newMonto, setNewMonto] = useState(tramite.monto.toString());
    const [newState, setNewState] = useState(tramite.estado);
    
    const [error, setError] = useState(null);
    const [isUpdating, setIsUpdating] = useState(false);

    const handleUpdate = (e) => { 
        e.preventDefault();
        
        const currentMonto = parseFloat(tramite.monto);
        const submittedMonto = parseFloat(newMonto);

        if (newState === tramite.estado && submittedMonto === currentMonto) {
            setError("No hay cambios para guardar.");
            return;
        }

        setIsUpdating(true);
        setError(null);
        
        const payload = { 
            monto: submittedMonto,
            new_state: newState 
        };

        fetch(`${API_BASE}/tramites/${tramite.id}/update_estado`, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(payload),
        })
        .then(response => {
            setIsUpdating(false);
            if (!response.ok) {
                return response.json().then(data => {
                    throw new Error(data.error || data.details || 'Transición de estado inválida.');
                });
            }
            return response.json();
        })
        .then(data => {
            alert(`Actualización exitosa: ${data.message || 'Datos guardados.'}`);
            
            // Pasa el objeto completo (trámite actualizado + mensaje) al Dashboard
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
        <div className="modal-backdrop"> 
            <div className="modal-content">
                <h3>Actualizar Trámite: {tramite.codigo}</h3>
                
                <div className="details">
                    <p><strong>Tipo:</strong> {tramite.tipo_tramite?.nombre || 'N/A'}</p>
                    <p><strong>Consultor:</strong> {tramite.consultor?.nombre || 'Sin asignar'}</p>
                </div>
                
                <div className="state-transition-section">
                    <h4>Estado Actual: <span className={`status-${tramite.estado}`}>{tramite.estado}</span></h4>
                    
                    <form onSubmit={handleUpdate} className="tramite-form">
                        {error && <div className="form-error">{error}</div>}

                        {/* Campo editable para Monto */}
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
                        
                        {/* Selector de Estado */}
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