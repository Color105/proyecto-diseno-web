// src/services/adminApi.js
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
  fetch(`${API_URL}/estado_tramites`, { headers: getAuthHeaders() }).then(handle);

export const createEstado = (p) =>
  fetch(`${API_URL}/estado_tramites`, {
    method: "POST",
    headers: getAuthHeaders(),
    body: JSON.stringify({ estado_tramite: p }),
  }).then(handle);

export const updateEstado = (id, p) =>
  fetch(`${API_URL}/estado_tramites/${id}`, {
    method: "PATCH",
    headers: getAuthHeaders(),
    body: JSON.stringify({ estado_tramite: p }),
  }).then(handle);

export const deleteEstado = (id) =>
  fetch(`${API_URL}/estado_tramites/${id}`, {
    method: "DELETE",
    headers: getAuthHeaders(),
  }).then(handle);

/* =========================================================
   HISTORIAL POR TRÁMITE
   ========================================================= */
export const historialPorTramite = (tramiteId) =>
  fetch(`${API_URL}/tramites/${tramiteId}/historico_estados`, {
    headers: getAuthHeaders(),
  }).then(handle);

/* =========================================================
   TRÁMITES (panel Admin/Recep y vistas Cliente)
   ========================================================= */
export const listTramites = (q = {}) => {
  const params = new URLSearchParams(q).toString();
  const url = params ? `${API_URL}/tramites?${params}` : `${API_URL}/tramites`;
  return fetch(url, { headers: getAuthHeaders() }).then(handle);
};

export const createTramite = (p) =>
  fetch(`${API_URL}/tramites`, {
    method: "POST",
    headers: getAuthHeaders(),
    body: JSON.stringify({ tramite: p }),
  }).then(handle);

export const deleteTramite = (id) =>
  fetch(`${API_URL}/tramites/${id}`, {
    method: "DELETE",
    headers: getAuthHeaders(),
  }).then(handle);

/* =========================================================
   CLIENTES (ClientesController)  [solo admin]
   ========================================================= */
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
