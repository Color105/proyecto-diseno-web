// src/pages/ListaPreciosPage.jsx
import React, { useEffect, useState } from "react";
import { API_URL } from "../config";
import "./ListaPreciosPage.css";

// =======================
// Helper: headers con token
// =======================
const getAuthHeaders = () => {
  const token = localStorage.getItem("token");
  const headers = {
    "Content-Type": "application/json",
    Accept: "application/json",
  };
  if (token) headers.Authorization = `Bearer ${token}`;
  return headers;
};

// =======================
// Helpers de fechas
// =======================

// Ignoramos timezone y tomamos solo Y-M-D
function parseDate(value) {
  if (!value) return null;

  if (value instanceof Date) return value;

  if (typeof value === "string") {
    const datePart = value.split("T")[0]; // "2025-12-04"
    const [y, m, d] = datePart.split("-").map(Number);
    if (!y || !m || !d) return null;
    return new Date(y, m - 1, d); // new Date(año, mesIndex, día)
  }

  return null;
}

function formatDateForInput(value) {
  const d = parseDate(value);
  if (!d || Number.isNaN(d.getTime())) return "";
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`; // YYYY-MM-DD (para <input type="date">
}

function formatDateForTable(value) {
  const d = parseDate(value);
  if (!d || Number.isNaN(d.getTime())) return "-";
  const day = String(d.getDate()).padStart(2, "0");
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const year = d.getFullYear();
  return `${day}/${month}/${year}`; // dd/mm/aaaa
}

// Orden de estados: futuras, activas, vencidas, eliminadas
const ESTADO_ORDER = {
  futura: 0,
  activa: 1,
  vencida: 2,
  eliminada: 3,
};

function getEstadoLabel(estado) {
  if (estado === "futura") return "FUTURA";
  if (estado === "vencida") return "VENCIDA";
  if (estado === "eliminada") return "ELIMINADA";
  return "VIGENTE"; // "activa"
}

// =======================
// Componente principal
// =======================
export default function ListaPreciosPage() {
  const [listas, setListas] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const [selectedLista, setSelectedLista] = useState(null);

  const [formNueva, setFormNueva] = useState({
    fecha_desde: "",
    fecha_hasta: "",
  });

  // Precios por tipo de trámite
  const [tiposTramite, setTiposTramite] = useState([]);
  const [preciosPorTipo, setPreciosPorTipo] = useState({});
  const [loadingDetalle, setLoadingDetalle] = useState(false);

  // ----------------------
  // Carga inicial
  // ----------------------
  useEffect(() => {
    fetchListas();
    fetchTiposTramite();
  }, []);

  const fetchListas = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${API_URL}/lista_precios`, {
        headers: getAuthHeaders(),
      });
      if (!res.ok) throw new Error(`${res.status} ${res.statusText}`);
      const data = await res.json();

      setListas(data);

      // Seleccionamos la activa; si no hay, la primera NO eliminada
      const activa = data.find((lp) => lp.estado === "activa");
      const primeraNoEliminada = data.find((lp) => lp.estado !== "eliminada");
      const inicial = activa || primeraNoEliminada || null;
      setSelectedLista(inicial);

      if (inicial) {
        await fetchDetalles(inicial.id);
      } else {
        setPreciosPorTipo({});
      }
    } catch (e) {
      console.error(e);
      setError("Error al cargar listas de precios.");
    } finally {
      setLoading(false);
    }
  };

  const fetchTiposTramite = async () => {
    try {
      const res = await fetch(`${API_URL}/tipo_tramites`, {
        headers: getAuthHeaders(),
      });
      if (!res.ok) throw new Error(`${res.status} ${res.statusText}`);
      const data = await res.json();
      setTiposTramite(data);
    } catch (e) {
      console.error(e);
    }
  };

  const fetchDetalles = async (listaId) => {
    if (!listaId) return;
    setLoadingDetalle(true);
    setError(null);
    try {
      const res = await fetch(`${API_URL}/lista_precios/${listaId}/detalles`, {
        headers: getAuthHeaders(),
      });
      if (!res.ok) throw new Error(`${res.status} ${res.statusText}`);
      const data = await res.json();

      const map = {};
      data.forEach((d) => {
        map[d.tipo_tramite_id] = d.precio_tipo_tramite;
      });
      setPreciosPorTipo(map);
    } catch (e) {
      console.error(e);
      setError("Error al cargar los precios por tipo de trámite.");
    } finally {
      setLoadingDetalle(false);
    }
  };

  // ----------------------
  // Seleccionar lista
  // ----------------------
  const handleSelectLista = (lista) => {
    // Ahora SÍ permitimos seleccionar vencidas y eliminadas,
    // para ver fechas y precios, pero en modo solo lectura.
    setSelectedLista(lista);
    fetchDetalles(lista.id);
  };

  // ----------------------
  // Crear nueva lista
  // ----------------------
  const handleChangeNueva = (field, value) => {
    setFormNueva((prev) => ({ ...prev, [field]: value }));
  };

  const handleCrearLista = async (e) => {
    e.preventDefault();
    setError(null);

    const body = {
      lista_precio: {
        fecha_hora_desde_lista_precio: formNueva.fecha_desde || null,
        fecha_hora_hasta_lista_precio: formNueva.fecha_hasta || null,
      },
    };

    try {
      const res = await fetch(`${API_URL}/lista_precios`, {
        method: "POST",
        headers: getAuthHeaders(),
        body: JSON.stringify(body),
      });

      const data = await res.json().catch(() => null);

      if (!res.ok) {
        const msg =
          data?.errors?.join(", ") ||
          data?.error ||
          `${res.status} ${res.statusText}`;
        throw new Error(msg);
      }

      await fetchListas();
      setFormNueva({ fecha_desde: "", fecha_hasta: "" });
    } catch (e) {
      console.error(e);
      setError(e.message || "Error al crear la lista.");
    }
  };

  // ----------------------
  // Editar lista seleccionada
  // ----------------------
  const handleChangeEdit = (field, value) => {
    if (!selectedLista) return;
    const updated = {
      ...selectedLista,
      [field]: value,
    };
    setSelectedLista(updated);

    setListas((prev) =>
      prev.map((lp) => (lp.id === updated.id ? updated : lp))
    );
  };

  const handleGuardarEdicion = async () => {
    if (!selectedLista) return;

    const estado = selectedLista.estado;

    // 🔒 No permitir editar listas vencidas ni eliminadas
    if (estado === "vencida" || estado === "eliminada") {
      setError("No se puede editar una lista de precios vencida o eliminada.");
      return;
    }

    setError(null);

    const body = {
      lista_precio: {
        fecha_hora_desde_lista_precio: selectedLista.fecha_hora_desde_lista_precio
          ? formatDateForInput(selectedLista.fecha_hora_desde_lista_precio)
          : null,
        fecha_hora_hasta_lista_precio: selectedLista.fecha_hora_hasta_lista_precio
          ? formatDateForInput(selectedLista.fecha_hora_hasta_lista_precio)
          : null,
      },
    };

    try {
      const res = await fetch(`${API_URL}/lista_precios/${selectedLista.id}`, {
        method: "PUT",
        headers: getAuthHeaders(),
        body: JSON.stringify(body),
      });
      const data = await res.json().catch(() => null);

      if (!res.ok) {
        const msg =
          data?.errors?.join(", ") ||
          data?.error ||
          `${res.status} ${res.statusText}`;
        throw new Error(msg);
      }

      await fetchListas();
    } catch (e) {
      console.error(e);
      setError(e.message || "Error al guardar cambios de la lista.");
    }
  };

  // ----------------------
  // Dar de baja lista
  // ----------------------
  const handleDarDeBaja = async (lista) => {
    if (!window.confirm("¿Seguro que querés dar de baja esta lista de precios?")) {
      return;
    }
    setError(null);

    try {
      const res = await fetch(`${API_URL}/lista_precios/${lista.id}/baja`, {
        method: "PATCH",
        headers: getAuthHeaders(),
      });

      const data = await res.json().catch(() => null);
      if (!res.ok) {
        const msg =
          data?.errors?.join(", ") ||
          data?.error ||
          `${res.status} ${res.statusText}`;
        throw new Error(msg);
      }

      await fetchListas();
    } catch (e) {
      console.error(e);
      setError(e.message || "Error al dar de baja la lista.");
    }
  };

  // ----------------------
  // Guardar precio por tipo de trámite
  // ----------------------
  const handleChangePrecioTipo = (tipoId, value) => {
    setPreciosPorTipo((prev) => ({
      ...prev,
      [tipoId]: value,
    }));
  };

  const handleGuardarPrecioTipo = async (tipoId) => {
    if (!selectedLista) return;

    const estado = selectedLista.estado;

    // 🔒 No permitir asignar precios si la lista está vencida o eliminada
    if (estado === "vencida" || estado === "eliminada") {
      setError("No se pueden modificar precios de una lista vencida o eliminada.");
      return;
    }

    const precio = preciosPorTipo[tipoId];
    if (precio === undefined || precio === null || precio === "") return;

    setError(null);
    try {
      const body = {
        tipo_tramite_id: tipoId,
        precio_tipo_tramite: parseFloat(precio),
      };

      const res = await fetch(
        `${API_URL}/lista_precios/${selectedLista.id}/asignar_precio`,
        {
          method: "POST",
          headers: getAuthHeaders(),
          body: JSON.stringify(body),
        }
      );

      const data = await res.json().catch(() => null);
      if (!res.ok || !data?.ok) {
        const msg =
          data?.errors?.join(", ") ||
          data?.error ||
          `${res.status} ${res.statusText}`;
        throw new Error(msg);
      }
    } catch (e) {
      console.error(e);
      setError(e.message || "Error al guardar el precio.");
    }
  };

  // ----------------------
  // Listas ordenadas por estado
  // ----------------------
  const listasOrdenadas = [...listas].sort((a, b) => {
    const ea = ESTADO_ORDER[a.estado] ?? 1;
    const eb = ESTADO_ORDER[b.estado] ?? 1;
    if (ea !== eb) return ea - eb;

    const ca = parseInt(a.cod_lista_precio, 10) || 0;
    const cb = parseInt(b.cod_lista_precio, 10) || 0;
    return ca - cb;
  });

  const estadoSeleccionada = selectedLista?.estado || null;
  const isReadOnlyLista =
    estadoSeleccionada === "vencida" || estadoSeleccionada === "eliminada";

  // ----------------------
  // Render
  // ----------------------
  return (
    <div className="lista-precios-container">
      <div className="lista-precios-header">
        <h1>Listas de Precios</h1>
        <p>
          Administrá las listas de precios y sus rangos de vigencia. Estas listas se usan
          para calcular el precio vigente de cada tipo de trámite.
        </p>
      </div>

      {error && <div className="alert alert-error">{error}</div>}

      <div className="lista-precios-content">
        {/* COLUMNA IZQUIERDA: listado */}
        <section className="panel panel-left">
          <div className="panel-title">Listado</div>

          {loading ? (
            <div className="panel-loading">Cargando listas…</div>
          ) : (
            <table className="tabla-listas-precio">
              <thead>
                <tr>
                  <th>CÓDIGO</th>
                  <th>VIGENCIA DESDE</th>
                  <th>VIGENCIA HASTA</th>
                  <th>ESTADO</th>
                  <th>ACCIONES</th>
                </tr>
              </thead>
              <tbody>
                {listasOrdenadas.map((lista) => {
                  const isSelected = selectedLista && selectedLista.id === lista.id;
                  const estado = lista.estado || "activa";

                  return (
                    <tr
                      key={lista.id}
                      className={isSelected ? "row-selected" : ""}
                      onClick={() => handleSelectLista(lista)}
                    >
                      <td>{lista.cod_lista_precio}</td>
                      <td>{formatDateForTable(lista.fecha_hora_desde_lista_precio)}</td>
                      <td>{formatDateForTable(lista.fecha_hora_hasta_lista_precio)}</td>
                      <td>
                        <span className={`badge-estado badge-estado--${estado}`}>
                          {getEstadoLabel(estado)}
                        </span>
                      </td>
                      <td>
                        {estado === "eliminada" ? (
                          <span className="acciones-disabled">Eliminada</span>
                        ) : estado === "vencida" ? (
                          <span className="acciones-disabled">Histórico</span>
                        ) : (
                          <button
                            type="button"
                            className="btn btn-sm btn-danger"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDarDeBaja(lista);
                            }}
                          >
                            Dar de baja
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}

                {listasOrdenadas.length === 0 && !loading && (
                  <tr>
                    <td colSpan="5" style={{ textAlign: "center", padding: "16px" }}>
                      No hay listas de precios cargadas.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          )}
        </section>

        {/* COLUMNA DERECHA: nueva + edición + precios */}
        <section className="panel panel-right">
          {/* NUEVA LISTA */}
          <div className="panel-subsection">
            <div className="panel-title">Nueva Lista de Precios</div>
            <form onSubmit={handleCrearLista} className="form-grid">
              <div className="form-row">
                <label>Código</label>
                <input
                  type="text"
                  value="Se asignará automáticamente al crear"
                  disabled
                  className="input-disabled"
                />
              </div>

              <div className="form-row">
                <label>Vigencia desde</label>
                <input
                  type="date"
                  value={formNueva.fecha_desde}
                  onChange={(e) => handleChangeNueva("fecha_desde", e.target.value)}
                />
                <small>
                  Si lo dejás vacío, la fecha se calculará automáticamente según la lista
                  anterior.
                </small>
              </div>

              <div className="form-row">
                <label>Vigencia hasta</label>
                <input
                  type="date"
                  value={formNueva.fecha_hasta}
                  onChange={(e) => handleChangeNueva("fecha_hasta", e.target.value)}
                />
                <small>Si lo dejás vacío, la lista no tendrá fecha de fin.</small>
              </div>

              <div className="form-actions">
                <button type="submit" className="btn btn-primary">
                  Crear lista
                </button>
              </div>
            </form>
          </div>

          {/* EDITAR LISTA SELECCIONADA */}
          {selectedLista && !isReadOnlyLista && (
            <div className="panel-subsection">
              <div className="panel-title">Editar Lista de Precios</div>

              <div className="form-grid">
                <div className="form-row">
                  <label>Código</label>
                  <input
                    type="text"
                    value={selectedLista.cod_lista_precio}
                    disabled
                    className="input-disabled"
                  />
                </div>

                <div className="form-row">
                  <label>Vigencia desde</label>
                  <input
                    type="date"
                    value={formatDateForInput(
                      selectedLista.fecha_hora_desde_lista_precio
                    )}
                    onChange={(e) =>
                      handleChangeEdit(
                        "fecha_hora_desde_lista_precio",
                        e.target.value
                      )
                    }
                  />
                </div>

                <div className="form-row">
                  <label>Vigencia hasta</label>
                  <input
                    type="date"
                    value={formatDateForInput(
                      selectedLista.fecha_hora_hasta_lista_precio
                    )}
                    onChange={(e) =>
                      handleChangeEdit(
                        "fecha_hora_hasta_lista_precio",
                        e.target.value
                      )
                    }
                  />
                </div>

                <div className="form-actions">
                  <button
                    type="button"
                    className="btn btn-primary"
                    onClick={handleGuardarEdicion}
                  >
                    Guardar cambios
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* PRECIOS POR TIPO DE TRÁMITE */}
          <div className="panel-subsection">
            <div className="panel-title">Precios por Tipo de Trámite</div>
            {selectedLista ? (
              isReadOnlyLista ? (
                <>
                  <p className="panel-caption">
                    Esta lista está{" "}
                    {estadoSeleccionada === "vencida" ? "vencida" : "eliminada"}. Sólo
                    podés consultar sus precios; no se pueden modificar.
                  </p>
                  {loadingDetalle ? (
                    <div className="panel-loading">Cargando precios…</div>
                  ) : (
                    <table className="tabla-precios-tipo">
                      <thead>
                        <tr>
                          <th>Tipo de Trámite</th>
                          <th>Precio en esta lista</th>
                        </tr>
                      </thead>
                      <tbody>
                        {tiposTramite.map((tipo) => (
                          <tr key={tipo.id}>
                            <td>{tipo.nombre}</td>
                            <td>
                              <input
                                type="number"
                                className="input-precio"
                                value={
                                  preciosPorTipo[tipo.id] !== undefined
                                    ? preciosPorTipo[tipo.id]
                                    : ""
                                }
                                disabled
                              />
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  )}
                </>
              ) : (
                <>
                  <p className="panel-caption">
                    Seleccioná una lista de precios en el panel izquierdo para poder asignar
                    precios a cada tipo de trámite.
                  </p>
                  {loadingDetalle ? (
                    <div className="panel-loading">Cargando precios…</div>
                  ) : (
                    <table className="tabla-precios-tipo">
                      <thead>
                        <tr>
                          <th>Tipo de Trámite</th>
                          <th>Precio en esta lista</th>
                          <th></th>
                        </tr>
                      </thead>
                      <tbody>
                        {tiposTramite.map((tipo) => (
                          <tr key={tipo.id}>
                            <td>{tipo.nombre}</td>
                            <td>
                              <input
                                type="number"
                                className="input-precio"
                                value={
                                  preciosPorTipo[tipo.id] !== undefined
                                    ? preciosPorTipo[tipo.id]
                                    : ""
                                }
                                onChange={(e) =>
                                  handleChangePrecioTipo(tipo.id, e.target.value)
                                }
                              />
                            </td>
                            <td>
                              <button
                                type="button"
                                className="btn btn-sm btn-primary"
                                onClick={() => handleGuardarPrecioTipo(tipo.id)}
                              >
                                Guardar
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  )}
                </>
              )
            ) : (
              <p>Seleccioná una lista de precios en el panel izquierdo.</p>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}
