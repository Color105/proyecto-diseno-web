import React, { useState, useEffect } from 'react';
import TramiteEditModal from './TramiteEditModal'; 
import TramiteForm from './TramiteForm'; // CLAVE: Debe existir y estar en la ruta correcta

const API_BASE = 'http://localhost:3000';

function TramiteDashboard() {
    const [tramites, setTramites] = useState([]);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isFormModalOpen, setIsFormModalOpen] = useState(false); // Controla el modal de CREACIÓN
    const [selectedTramite, setSelectedTramite] = useState(null);

    const fetchTramites = async () => {
        try {
            const response = await fetch(`${API_BASE}/tramites`);
            const data = await response.json();
            setTramites(data);
        } catch (error) {
            console.error("Error al cargar trámites:", error);
        }
    };

    useEffect(() => {
        fetchTramites();
    }, []);

    const handleTramiteUpdated = (updatedTramiteData) => {
        setTramites(prevTramites => 
            prevTramites.map(t => 
                t.id === updatedTramiteData.id ? updatedTramiteData : t
            )
        );
        setIsEditModalOpen(false);
        setSelectedTramite(null);
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
                <h1>Gestión de Trámites ({tramites.length} en total)</h1>
                {/* Botón que establece isFormModalOpen a true */}
                <button 
                    className="btn-primary" 
                    onClick={() => setIsFormModalOpen(true)}
                >
                    + Nuevo Trámite
                </button>
            </header>

            <div className="table-wrapper">
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
                        {tramites.map(tramite => (
                            <tr key={tramite.id}>
                                <td>{tramite.codigo}</td>
                                <td>{tramite.tipo_tramite?.nombre}</td>
                                <td><span className={`status-${tramite.estado}`}>{tramite.estado}</span></td>
                                <td>{tramite.consultor?.nombre}</td>
                                <td>${parseFloat(tramite.monto).toFixed(2)}</td>
                                <td>
                                    <button className="btn-primary" onClick={() => openEditModal(tramite)}>Editar</button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
            
            {/* Modal de Edición */}
            {isEditModalOpen && selectedTramite && (
                <TramiteEditModal 
                    tramite={selectedTramite} 
                    onClose={closeEditModal} 
                    onTramiteUpdated={handleTramiteUpdated} 
                />
            )}

            {/* MODAL DE CREACIÓN */}
            {isFormModalOpen && (
                <TramiteForm 
                    onClose={() => setIsFormModalOpen(false)} // Cierra el modal
                    onTramiteCreated={handleTramiteCreated} 
                />
            )}
        </div>
    );
}

export default TramiteDashboard;
