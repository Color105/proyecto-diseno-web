const API = import.meta.env.VITE_API_URL || 'http://localhost:3000';

async function handle(res) {
  const tryJson = async () => { try { return await res.json(); } catch { return null; } };
  if (!res.ok) {
    const j = await tryJson();
    const msg = j?.errors?.join(', ') || j?.error || `${res.status} ${res.statusText}`;
    throw new Error(msg);
  }
  return tryJson();
}

// Consultores
export const listConsultores   = () => fetch(`${API}/consultors.json`).then(handle);
export const createConsultor   = (p) => fetch(`${API}/consultors.json`, { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ consultor: p }) }).then(handle);
export const updateConsultor   = (id, p) => fetch(`${API}/consultors/${id}.json`, { method:'PUT', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ consultor: p }) }).then(handle);
export const deleteConsultor   = (id) => fetch(`${API}/consultors/${id}.json`, { method:'DELETE' }).then(handle);

// Tipos de trámite
export const listTipos         = () => fetch(`${API}/tipo_tramites.json`).then(handle);
export const createTipo        = (p) => fetch(`${API}/tipo_tramites.json`, { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ tipo_tramite: p }) }).then(handle);
export const updateTipo        = (id, p) => fetch(`${API}/tipo_tramites/${id}.json`, { method:'PUT', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ tipo_tramite: p }) }).then(handle);
export const deleteTipo        = (id) => fetch(`${API}/tipo_tramites/${id}.json`, { method:'DELETE' }).then(handle);

// Historial de estados (por trámite)
export const historialPorTramite = (tramiteId) => fetch(`${API}/tramites/${tramiteId}/historico_estados.json`).then(handle);
