import React, { useState, useEffect } from 'react';
import { useAuth } from '../auth/AuthContext';
import { API_URL } from '../config'; // Asumimos que src/config.js existe

// --- ¡¡CORRECCIÓN!! Importamos desde la misma carpeta './' ---
import TramiteEditModal from './TramiteEditModal'; 
import TramiteForm from './TramiteForm'; 
import './TramiteDashboard.css'; // Asumimos que src/components/TramiteDashboard.css existe
// --- Fin Corrección ---

function TramiteDashboard() {
    const [tramites, setTramites] = useState([]);
    const [isLoading, setIsLoading] = useState(true); 
    const [errorMessage, setErrorMessage] = useState(null); 
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isFormModalOpen, setIsFormModalOpen] = useState(false);
    const [selectedTramite, setSelectedTramite] = useState(null);
    
    const { token, logout } = useAuth(); 

    const fetchTramites = async () => {
        if (!token) return; 
        setIsLoading(true);
        setErrorMessage(null);
        try {
            const response = await fetch(`${API_URL}/tramites`, { 
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}` 
                }
            });
            if (response.status === 401) {
                logout(); 
                throw new Error('Tu sesión ha expirado. Por favor, inicia sesión de nuevo.');
            }
            if (!response.ok) {
                throw new Error(`Error ${response.status}: No se pudieron cargar los trámites.`);
            }
            const data = await response.json(); 
            setTramites(Array.isArray(data) ? data : []); 
        } catch (error) {
            console.error("Error al cargar trámites:", error);
            setErrorMessage(error.message);
            setTramites([]); 
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchTramites();
    }, [token]); 

    // --- Manejadores de Modales (sin cambios) ---
    const handleTramiteUpdated = (updatedTramite) => {
        setTramites(prevTramites => 
            prevTramites.map(t => 
                t.id === updatedTramite.id ? updatedTramite : t
            )
        );
        closeEditModal();
    };

    const handleTramiteCreated = (newTramite) => {
        setTramites(prevTramites => [newTramite, ...prevTramites]);
        setIsFormModalOpen(false);
    };

    const openEditModal = (tramite) => {
        setSelectedTramite(tramite);
        setIsEditModalOpen(true);
    };
    
    const closeEditModal = () => {
        setIsEditModalOpen(false);
        setSelectedTramite(null);
    };

    return (
        <div className="dashboard-container"> 
            <header className="dashboard-header">
                <h1>Gestión de Trámites</h1>
                <button 
                    className="btn-primary" 
                    onClick={() => setIsFormModalOpen(true)}
                >
                    + Nuevo Trámite
                </button>
            </header>

            {isLoading && <p style={{textAlign: 'center', fontSize: '1.2em'}}>Cargando trámites...</p>}
            {errorMessage && <div className="error-message">{errorMessage}</div>}
            
            {!isLoading && !errorMessage && (
                <div className="table-wrapper">
                    {tramites.length === 0 ? (
                        <p style={{textAlign: 'center', padding: '2rem'}}>No se encontraron trámites.</p>
                    ) : (
                        <table className="tramites-table">
                            <thead>
                                <tr>
                                    <th>CÓDIGO</th>
                                    <th>TIPO</th>
                                    <th>ESTADO</th>
                                    <th>CONSULTOR</th>
                                    <th>MONTO</th>
                                    <th>ACCIONES</th>
                                </tr>
                            </thead>
                            <tbody>
                                {tramites.map(tramite => {
                                    const estado = tramite.estado || 'desconocido'; 
                                    const consultorNombre = tramite.consultor?.nombre || 'Sin asignar';

                                    return (
                                        <tr key={tramite.id}>
                                            <td>{tramite.codigo || `TR-${tramite.id}`}</td>
                                            <td>{tramite.tipo_tramite?.nombre || 'N/A'}</td>
                                            <td>
                                                <span className={`status-${estado.toLowerCase()}`}>
                                                    {estado}
                                                </span>
                                            </td>
                                            <td>{consultorNombre}</td>
                                            <td>${parseFloat(tramite.monto || 0).toFixed(2)}</td>
                                            <td>
                                                <button className="btn-primary" onClick={() => openEditModal(tramite)}>Editar</button>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    )}
                </div>
            )}
            
            {isEditModalOpen && selectedTramite && (
                <TramiteEditModal 
                    tramite={selectedTramite} 
                    onClose={closeEditModal} 
                    onTramiteUpdated={handleTramiteUpdated} 
                    token={token}
                    apiUrl={API_URL}
                />
            )}

            {isFormModalOpen && (
                <TramiteForm 
                    onClose={() => setIsFormModalOpen(false)}
                    onTramiteCreated={handleTramiteCreated} 
                    token={token}
                    apiUrl={API_URL}
                />
            )}
        </div>
    );
}

export default TramiteDashboard;
