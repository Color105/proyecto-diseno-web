import { useEffect, useState } from "react";
import {
  listTramites,
  listDocumentaciones,
  listDocumentosTramite,
  uploadDocumentoTramite,
  deleteDocumentoTramite,
} from "../services/adminApi";
import "./SubirDocumentacion.css";

export default function SubirDocumentacion() {
  const [tramites, setTramites] = useState([]);
  const [documentaciones, setDocumentaciones] = useState([]);
  const [tramiteId, setTramiteId] = useState("");
  const [documentacionId, setDocumentacionId] = useState("");
  const [file, setFile] = useState(null);
  const [docsTramite, setDocsTramite] = useState([]);
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState(null);
  const [error, setError] = useState(null);

  // Cargar combos iniciales
  useEffect(() => {
    const loadBaseData = async () => {
      try {
        setLoading(true);
        setError(null);
        const [tramitesRes, docsRes] = await Promise.all([
          listTramites().then((r) => r.data ?? r),
          listDocumentaciones().then((r) => r.data ?? r),
        ]);
        setTramites(tramitesRes || []);
        setDocumentaciones(docsRes || []);
      } catch (e) {
        console.error(e);
        setError("Error cargando datos iniciales");
      } finally {
        setLoading(false);
      }
    };
    loadBaseData();
  }, []);

  // Cargar docs cuando cambia el trámite
  useEffect(() => {
    if (!tramiteId) {
      setDocsTramite([]);
      return;
    }
    const loadDocs = async () => {
      try {
        setLoading(true);
        setError(null);
        const res = await listDocumentosTramite(tramiteId);
        const data = res.data ?? res;
        setDocsTramite(data || []);
      } catch (e) {
        console.error(e);
        setError("Error cargando documentos del trámite");
      } finally {
        setLoading(false);
      }
    };
    loadDocs();
  }, [tramiteId]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMsg(null);
    setError(null);

    if (!tramiteId || !documentacionId || !file) {
      setError("Seleccioná trámite, tipo de documentación y archivo.");
      return;
    }

    try {
      setLoading(true);
      await uploadDocumentoTramite(tramiteId, {
        documentacion_id: documentacionId,
        file,
      });
      setMsg("Documento subido correctamente.");
      setFile(null);
      const res = await listDocumentosTramite(tramiteId);
      const data = res.data ?? res;
      setDocsTramite(data || []);
    } catch (e) {
      console.error(e);
      setError(e.message || "Error al subir el documento");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (docId) => {
    if (!window.confirm("¿Eliminar este documento?")) return;
    try {
      setLoading(true);
      await deleteDocumentoTramite(tramiteId, docId);
      const res = await listDocumentosTramite(tramiteId);
      const data = res.data ?? res;
      setDocsTramite(data || []);
    } catch (e) {
      console.error(e);
      setError("Error al eliminar documento");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="subirDoc-wrapper">
      <div className="subirDoc-card">
        <h1>Subir Documentación</h1>
        <p className="subirDoc-subtitle">
          Seleccioná un trámite, el tipo de documentación y adjuntá el archivo.
        </p>

        {error && <div className="error-message">{error}</div>}
        {msg && <div className="success-message">{msg}</div>}

        <form className="subirDoc-form" onSubmit={handleSubmit}>
          <div className="grid">
            <label>
              <span>Trámite</span>
              <select
                value={tramiteId}
                onChange={(e) => setTramiteId(e.target.value)}
                required
              >
                <option value="">-- Seleccionar trámite --</option>
                {tramites.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.codigo || `TR-${t.id}`} – {t.tipo_tramite?.nombre || ""} –{" "}
                    {t.cliente?.nombre_apellido_cliente || ""}
                  </option>
                ))}
              </select>
            </label>

            <label>
              <span>Tipo de Documentación</span>
              <select
                value={documentacionId}
                onChange={(e) => setDocumentacionId(e.target.value)}
                required
              >
                <option value="">-- Seleccionar tipo --</option>
                {documentaciones.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.nombre_documentacion || d.nombre || d.descripcion}
                  </option>
                ))}
              </select>
            </label>

            <label>
              <span>Archivo</span>
              <input
                type="file"
                onChange={(e) => setFile(e.target.files?.[0] || null)}
                required
              />
            </label>
          </div>

          <div className="actions">
            <button className="btn primary" type="submit" disabled={loading}>
              {loading ? "Subiendo..." : "Subir archivo"}
            </button>
          </div>
        </form>
      </div>

      <div className="subirDoc-card">
        <h2>Documentación del trámite</h2>
        {!tramiteId && (
          <p className="hint">Elegí un trámite para ver sus documentos.</p>
        )}
        {tramiteId && (
          <div className="table-wrapper">
            {docsTramite.length === 0 ? (
              <p className="hint">Este trámite todavía no tiene documentos.</p>
            ) : (
              <table className="subirDoc-table">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Tipo</th>
                    <th>Fecha entrega</th>
                    <th>Archivo</th>
                    <th>Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {docsTramite.map((doc) => (
                    <tr key={doc.id}>
                      <td>{doc.id}</td>
                      <td>{doc.documentacion?.nombre_documentacion || "-"}</td>
                      <td>
                        {doc.fecha_hora_entrega &&
                          new Date(doc.fecha_hora_entrega).toLocaleString()}
                      </td>
                      <td>
                        {doc.archivo_url ? (
                          <a
                            href={doc.archivo_url}
                            target="_blank"
                            rel="noreferrer"
                          >
                            Ver / Descargar
                          </a>
                        ) : (
                          "-"
                        )}
                      </td>
                      <td>
                        <button
                          className="btn small danger"
                          onClick={() => handleDelete(doc.id)}
                          disabled={loading}
                        >
                          Eliminar
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
