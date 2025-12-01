// src/pages/SubirDocumentacionPage.jsx
import { useEffect, useState } from "react";
import { useAuth } from "../auth/AuthContext";
import { API_URL } from "../config";
import {
  listDocumentosTramite,
  uploadDocumentoTramite,
  deleteDocumentoTramite,
} from "../services/adminApi";
import "../components/TramiteDashboard.css"; // reutilizamos estilos

export default function SubirDocumentacionPage() {
  const { token } = useAuth();

  const [tramites, setTramites] = useState([]);
  const [selectedTramiteId, setSelectedTramiteId] = useState("");
  const [documentos, setDocumentos] = useState([]);

  const [documentacionId, setDocumentacionId] = useState("");
  const [file, setFile] = useState(null);

  const [loadingTramites, setLoadingTramites] = useState(false);
  const [loadingDocs, setLoadingDocs] = useState(false);
  const [error, setError] = useState(null);
  const [message, setMessage] = useState(null);

  // ================== CARGAR TRÁMITES ==================
  useEffect(() => {
    const fetchTramites = async () => {
      if (!token) return;
      setLoadingTramites(true);
      setError(null);
      try {
        const res = await fetch(`${API_URL}/tramites`, {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        });
        if (!res.ok) throw new Error("No se pudieron cargar los trámites");
        const data = await res.json();
        setTramites(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error(err);
        setError(err.message);
      } finally {
        setLoadingTramites(false);
      }
    };

    fetchTramites();
  }, [token]);

  // ================== CARGAR DOCUMENTOS DEL TRÁMITE ==================
  const loadDocumentos = async (tramiteId) => {
    if (!tramiteId) return;
    setLoadingDocs(true);
    setError(null);
    try {
      const data = await listDocumentosTramite(tramiteId);
      setDocumentos(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error(err);
      setError(err.message);
    } finally {
      setLoadingDocs(false);
    }
  };

  const handleChangeTramite = (e) => {
    const id = e.target.value;
    setSelectedTramiteId(id);
    setDocumentos([]);
    if (id) loadDocumentos(id);
  };

  // ================== SUBIR DOCUMENTO ==================
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setMessage(null);

    if (!selectedTramiteId) {
      setError("Seleccioná un trámite primero.");
      return;
    }
    if (!file) {
      setError("Seleccioná un archivo para subir.");
      return;
    }

    try {
      await uploadDocumentoTramite(selectedTramiteId, {
        documentacion_id: documentacionId || null,
        file,
      });
      setMessage("Documento subido correctamente.");
      setFile(null);
      setDocumentacionId("");
      // recargar lista
      loadDocumentos(selectedTramiteId);
    } catch (err) {
      console.error(err);
      setError(err.message);
    }
  };

  // ================== ELIMINAR DOCUMENTO ==================
  const handleDeleteDoc = async (docId) => {
    if (!selectedTramiteId) return;
    if (!window.confirm("¿Eliminar este documento?")) return;

    setError(null);
    setMessage(null);
    try {
      await deleteDocumentoTramite(selectedTramiteId, docId);
      setMessage("Documento eliminado.");
      loadDocumentos(selectedTramiteId);
    } catch (err) {
      console.error(err);
      setError(err.message);
    }
  };

  const tramiteSeleccionado =
    tramites.find((t) => String(t.id) === String(selectedTramiteId)) || null;

  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <h1>Subir Documentación</h1>
      </div>

      {error && <div className="error-message" style={{ marginBottom: 16 }}>{error}</div>}
      {message && (
        <div
          style={{
            marginBottom: 16,
            padding: "8px 12px",
            borderRadius: 8,
            background: "#064e3b",
            color: "#d1fae5",
            fontSize: "0.9rem",
          }}
        >
          {message}
        </div>
      )}

      {/* ==== Selección de Trámite ==== */}
      <section style={{ marginBottom: 24 }}>
        <label style={{ display: "block", marginBottom: 8, fontWeight: 500 }}>
          Seleccionar Trámite
        </label>
        {loadingTramites ? (
          <p>Cargando trámites...</p>
        ) : (
          <select
            value={selectedTramiteId}
            onChange={handleChangeTramite}
            style={{
              width: "100%",
              maxWidth: 480,
              padding: "8px 10px",
              borderRadius: 8,
              border: "1px solid #374151",
              background: "#020617",
              color: "#e5e7eb",
            }}
          >
            <option value="">-- Elegí un trámite --</option>
            {tramites.map((t) => (
              <option key={t.id} value={t.id}>
                {t.codigo || `TR-${t.id}`} — {t.tipo_tramite?.nombre || "Sin tipo"} —{" "}
                {t.cliente?.nombre_apellido_cliente || "Sin cliente"}
              </option>
            ))}
          </select>
        )}

        {tramiteSeleccionado && (
          <div
            style={{
              marginTop: 12,
              padding: "8px 12px",
              borderRadius: 8,
              background: "#020617",
              border: "1px solid #1f2937",
              fontSize: "0.9rem",
              color: "#9ca3af",
            }}
          >
            <div>
              <strong>Código:</strong> {tramiteSeleccionado.codigo || `TR-${tramiteSeleccionado.id}`}
            </div>
            <div>
              <strong>Tipo:</strong>{" "}
              {tramiteSeleccionado.tipo_tramite?.nombre || "N/A"}
            </div>
            <div>
              <strong>Cliente:</strong>{" "}
              {tramiteSeleccionado.cliente?.nombre_apellido_cliente || "N/A"}
            </div>
          </div>
        )}
      </section>

      {/* ==== Documentos ya subidos ==== */}
      <section style={{ marginBottom: 32 }}>
        <h3 style={{ marginBottom: 8 }}>Documentos cargados</h3>
        {loadingDocs ? (
          <p>Cargando documentos...</p>
        ) : documentos.length === 0 ? (
          <p style={{ color: "#9ca3af" }}>No hay documentos para este trámite.</p>
        ) : (
          <div className="table-wrapper">
            <table className="tramites-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Documentación</th>
                  <th>Fecha Entrega</th>
                  <th>Archivo</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {documentos.map((doc) => (
                  <tr key={doc.id}>
                    <td>{doc.id}</td>
                    <td>{doc.documentacion_nombre || doc.documentacion_id}</td>
                    <td>
                      {doc.fecha_hora_entrega
                        ? new Date(doc.fecha_hora_entrega).toLocaleString()
                        : "-"}
                    </td>
                    <td>
                      {doc.archivo_url ? (
                        <a
                          href={doc.archivo_url}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          Ver archivo
                        </a>
                      ) : (
                        "-"
                      )}
                    </td>
                    <td>
                      <button
                        className="btn-secondary"
                        style={{ backgroundColor: "#b91c1c" }}
                        onClick={() => handleDeleteDoc(doc.id)}
                      >
                        Eliminar
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {/* ==== Formulario de subida ==== */}
      <section>
        <h3 style={{ marginBottom: 8 }}>Subir nuevo documento</h3>
        <form
          onSubmit={handleSubmit}
          className="tramite-form"
          style={{ maxWidth: 480 }}
        >
          <label>
            ID de Documentación (opcional)
            <input
              type="text"
              value={documentacionId}
              onChange={(e) => setDocumentacionId(e.target.value)}
              placeholder="Ej: 1, 2, 3..."
            />
          </label>

          <label>
            Archivo
            <input
              type="file"
              onChange={(e) => setFile(e.target.files?.[0] || null)}
            />
          </label>

          <div className="form-actions">
            <button type="submit" className="btn-primary">
              Subir
            </button>
          </div>
        </form>
      </section>
    </div>
  );
}
