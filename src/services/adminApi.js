// 1. Importamos la URL centralizada
import { API_URL } from '../config';

// 2. Función para obtener los headers de autenticación (¡la parte clave!)
const getAuthHeaders = () => {
    const token = localStorage.getItem('token');
    const headers = { 
        'Content-Type': 'application/json',
        'Accept': 'application/json' // Es bueno pedir JSON
    };
    if (token) {
        headers['Authorization'] = `Bearer ${token}`;
    }
    return headers;
};

// 3. Tu función 'handle', mejorada con el manejo de 401 (expiración de token)
async function handle(res) {
  const tryJson = async () => { try { return await res.json(); } catch { return null; } };

  if (!res.ok) {
    // Si el token expiró o es inválido, forzamos logout
    if (res.status === 401) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.reload(); // Recarga la app, el ProtectedRoute lo enviará a /login
    }
    
    const j = await tryJson();
    const msg = j?.errors?.join(', ') || j?.error || `${res.status} ${res.statusText}`;
    throw new Error(msg);
  }
  
  // Manejo de DELETE (204 No Content), que no devuelve cuerpo
  if (res.status === 204) {
      return { success: true };
  }
  return tryJson(); 
}

// 4. Todas tus funciones, AHORA CON AUTENTICACIÓN
// (He quitado el .json de las rutas, Rails no lo necesita si pedimos JSON en los headers)
// (Cambié PUT por PATCH, que es más común para actualizaciones)

// ----------------------------------------------------
// Consultores (Controller: ConsultorsController)
// ----------------------------------------------------
export const listConsultores   = () => fetch(`${API_URL}/consultors`, { headers: getAuthHeaders() }).then(handle);
export const createConsultor   = (p) => fetch(`${API_URL}/consultors`, { method:'POST', headers: getAuthHeaders(), body: JSON.stringify({ consultor: p }) }).then(handle);
export const updateConsultor   = (id, p) => fetch(`${API_URL}/consultors/${id}`, { method:'PATCH', headers: getAuthHeaders(), body: JSON.stringify({ consultor: p }) }).then(handle);
export const deleteConsultor   = (id) => fetch(`${API_URL}/consultors/${id}`, { method:'DELETE', headers: getAuthHeaders() }).then(handle);

// ----------------------------------------------------
// Tipos de trámite (Controller: TipoTramitesController)
// ----------------------------------------------------
export const listTipos         = () => fetch(`${API_URL}/tipo_tramites`, { headers: getAuthHeaders() }).then(handle);
export const createTipo        = (p) => fetch(`${API_URL}/tipo_tramites`, { method:'POST', headers: getAuthHeaders(), body: JSON.stringify({ tipo_tramite: p }) }).then(handle);
export const updateTipo        = (id, p) => fetch(`${API_URL}/tipo_tramites/${id}`, { method:'PATCH', headers: getAuthHeaders(), body: JSON.stringify({ tipo_tramite: p }) }).then(handle);
export const deleteTipo        = (id) => fetch(`${API_URL}/tipo_tramites/${id}`, { method:'DELETE', headers: getAuthHeaders() }).then(handle);

// ----------------------------------------------------
// Estados de trámite (Controller: EstadoTramitesController)
// ----------------------------------------------------
export const listEstados       = () => fetch(`${API_URL}/estado_tramites`, { headers: getAuthHeaders() }).then(handle);
export const createEstado      = (p) => fetch(`${API_URL}/estado_tramites`, { method:'POST', headers: getAuthHeaders(), body: JSON.stringify({ estado_tramite: p }) }).then(handle);
export const updateEstado      = (id, p) => fetch(`${API_URL}/estado_tramites/${id}`, { method:'PATCH', headers: getAuthHeaders(), body: JSON.stringify({ estado_tramite: p }) }).then(handle);
export const deleteEstado      = (id) => fetch(`${API_URL}/estado_tramites/${id}`, { method:'DELETE', headers: getAuthHeaders() }).then(handle);

// ----------------------------------------------------
// Historial de estados (por trámite)
// ----------------------------------------------------
export const historialPorTramite = (tramiteId) => fetch(`${API_URL}/tramites/${tramiteId}/historico_estados`, { headers: getAuthHeaders() }).then(handle);

