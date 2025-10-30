// src/services/adminApi.js
import api from "../api"; // <-- ¡¡IMPORTANTE!!
import { API_URL } from "../config";

// -------- headers con auth ----------
const getAuthHeaders = () => {
  const token = localStorage.getItem("token");
  const headers = {
    "Content-Type": "application/json",
    Accept: "application/json",
  };
  if (token) headers.Authorization = `Bearer ${token}`;
  return headers;
};

// -------- manejador de fetch ----------
async function handle(res) {
  const tryJson = async () => {
    try { return await res.json(); } catch { return null; }
  };

  if (!res.ok) {
    if (res.status === 401) {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      window.location.reload();
    }
    const j = await tryJson();
    const msg = j?.errors?.join(", ") || j?.error || `${res.status} ${res.statusText}`;
    throw new Error(msg);
  }
  if (res.status === 204) return { success: true };
  return tryJson();
}

/* =========================================================
   CONSULTORES (ConsultorsController)
   ========================================================= */
export const listConsultores = () =>
  fetch(`${API_URL}/consultors`, { headers: getAuthHeaders() }).then(handle);

export const createConsultor = (p) =>
  fetch(`${API_URL}/consultors`, {
    method: "POST",
    headers: getAuthHeaders(),
    body: JSON.stringify({ consultor: p }),
  }).then(handle);

export const updateConsultor = (id, p) =>
  fetch(`${API_URL}/consultors/${id}`, {
    method: "PATCH",
    headers: getAuthHeaders(),
    body: JSON.stringify({ consultor: p }),
  }).then(handle);

export const deleteConsultor = (id) =>
  fetch(`${API_URL}/consultors/${id}`, {
    method: "DELETE",
    headers: getAuthHeaders(),
  }).then(handle);

/* =========================================================
   TIPOS DE TRÁMITE (TipoTramitesController)
   ========================================================= */
export const listTipos = () =>
  fetch(`${API_URL}/tipo_tramites`, { headers: getAuthHeaders() }).then(handle);

export const createTipo = (p) =>
  fetch(`${API_URL}/tipo_tramites`, {
    method: "POST",
    headers: getAuthHeaders(),
    body: JSON.stringify({ tipo_tramite: p }),
  }).then(handle);

export const updateTipo = (id, p) =>
  fetch(`${API_URL}/tipo_tramites/${id}`, {
    method: "PATCH",
    headers: getAuthHeaders(),
    body: JSON.stringify({ tipo_tramite: p }),
  }).then(handle);

export const deleteTipo = (id) =>
  fetch(`${API_URL}/tipo_tramites/${id}`, {
    method: "DELETE",
    headers: getAuthHeaders(),
  }).then(handle);

/* =========================================================
   ESTADOS DE TRÁMITE (EstadoTramitesController)
   ========================================================= */
export const listEstados = () =>
  api.get("/estado_tramites");

export const createEstado = (p) =>
  api.post("/estado_tramites", { estado_tramite: p });

export const updateEstado = (id, p) =>
  api.patch(`/estado_tramites/${id}`, p);

export const deleteEstado = (id) =>
  api.delete(`/estado_tramites/${id}`);

/* =========================================================
   HISTORIAL POR TRÁMITE
   ========================================================= */
export const historialPorTramite = (tramiteId) =>
  api.get(`/tramites/${tramiteId}/historico_estados`);

/* =========================================================
   TRÁMITES (panel Admin/Recep y vistas Cliente)
   ========================================================= */
export const listTramites = (q = {}) => {
  return api.get("/tramites", { params: q });
};

export const createTramite = (p) => {
  return api.post("/tramites", { tramite: p });
};

export const deleteTramite = (id) => {
  return api.delete(`/tramites/${id}`);
};

/* =========================================================
   CLIENTES (ClientesController)  [solo admin]
   ========================================================= */
// ... (tu código de clientes va aquí, no lo repito para ahorrar espacio) ...
export const buildClientePayload = (
  {
    nombre_apellido_cliente = "",
    cuit_cliente = "",
    mail_cliente = "",
    direccion_cliente = "",
    telefono_cliente = "",
    nameLogin = "",
    emailLogin = "",
    passwordLogin = "",
    roleLogin = "cliente",
  },
  { includeUser = true } = {}
) => {
  const base = {
    cliente: {
      nombre_apellido_cliente: nombre_apellido_cliente.trim(),
      cuit_cliente: cuit_cliente.trim(),
      mail_cliente: mail_cliente.trim(),
      direccion_cliente: direccion_cliente.trim(),
      telefono_cliente: telefono_cliente.trim(),
    },
  };
  if (includeUser) {
    base.cliente.user_attributes = {
      name: nameLogin.trim(),
      email: emailLogin.trim(),
      password: passwordLogin,
      password_confirmation: passwordLogin,
      role: roleLogin || "cliente",
    };
  }
  return base;
};

export const listClientes = () =>
  fetch(`${API_URL}/clientes`, { headers: getAuthHeaders() }).then(handle);

export const createCliente = (payload) =>
  fetch(`${API_URL}/clientes`, {
    method: "POST",
    headers: getAuthHeaders(),
    body: JSON.stringify(payload),
  }).then(handle);

export const updateCliente = (id, payload) =>
  fetch(`${API_URL}/clientes/${id}`, {
    method: "PATCH",
    headers: getAuthHeaders(),
    body: JSON.stringify(payload),
  }).then(handle);

export const deleteCliente = (id) =>
  fetch(`${API_URL}/clientes/${id}`, {
    method: "DELETE",
    headers: getAuthHeaders(),
  }).then(handle);


/* =========================================================
   == NUEVO: VERSIONADO (VersionsController) ==
   (Usando Axios 'api' para código más limpio)
   ========================================================= */

// GET /tipo_tramites/:tipoTramiteId/versiones
export const getVersionesPorTipo = (tipoTramiteId) =>
  api.get(`/tipo_tramites/${tipoTramiteId}/versiones`);

// --- ¡¡CORRECCIÓN!! 'versions' -> 'versiones' ---
// GET /versiones/:id
export const getVersionDetalle = (versionId) =>
  api.get(`/versiones/${versionId}`);

// POST /tipo_tramites/:tipoTramiteId/versiones (Para crear V1)
export const createPrimeraVersion = (tipoTramiteId) =>
  api.post(`/tipo_tramites/${tipoTramiteId}/versiones`);

// --- ¡¡CORRECCIÓN!! 'versions' -> 'versiones' ---
// POST /versiones/:id/clonar
export const clonarVersion = (versionId) =>
  api.post(`/versiones/${versionId}/clonar`);

// --- ¡¡CORRECCIÓN!! 'versions' -> 'versiones' ---
// POST /versiones/:id/activar
export const activarVersion = (versionId) =>
  api.post(`/versiones/${versionId}/activar`);

// --- ¡¡CORRECCIÓN!! 'versions' -> 'versiones' ---
// DELETE /versiones/:id
export const deleteVersionBorrador = (versionId) =>
  api.delete(`/versiones/${versionId}`);

/* =========================================================
   == NUEVO: TRANSICIONES (TransicionPosiblesController) ==
   (Usando Axios 'api' para código más limpio)
   ========================================================= */

// --- ¡¡CORRECCIÓN!! 'versions' -> 'versiones' ---
// POST /versiones/:versionId/transiciones
export const addTransicion = (versionId, origenId, siguienteId) => {
  const body = {
    transicion_posible: {
      estado_origen_id: origenId,
      estado_siguiente_id: siguienteId,
    },
  };
  return api.post(`/versiones/${versionId}/transiciones`, body);
};

// DELETE /transiciones/:transicionId
export const deleteTransicion = (transicionId) =>
  api.delete(`/transiciones/${transicionId}`);