import React, { useState, useEffect } from 'react';

const API_BASE = 'http://localhost:3000';

function TramiteForm({ open = true, onClose, onTramiteCreated }) {
  const [monto, setMonto] = useState('');
  const [consultorId, setConsultorId] = useState('');
  const [tipoTramiteId, setTipoTramiteId] = useState('');
  const [consultores, setConsultores] = useState([]);
  const [tiposTramite, setTiposTramite] = useState([]);
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  if (!open) return null;

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const [r1, r2] = await Promise.all([
          fetch(`${API_BASE}/consultors.json`, { headers: { Accept: 'application/json' } }),
          fetch(`${API_BASE}/tipo_tramites.json`, { headers: { Accept: 'application/json' } }),
        ]);
        if (!r1.ok || !r2.ok) throw new Error('Error al cargar combos');
        const [c, t] = await Promise.all([r1.json(), r2.json()]);
        if (!mounted) return;
        setConsultores(Array.isArray(c) ? c : []);
        setTiposTramite(Array.isArray(t) ? t : []);
      } catch (err) {
        console.error(err);
        setError('No pude cargar consultores/tipos. ¿Rails ok? ¿CORS para http://localhost:5173?');
      }
    })();
    return () => { mounted = false; };
  }, []);

  useEffect(() => {
    document.body.style.overflow = 'hidden';
    const onEsc = (e) => e.key === 'Escape' && onClose?.();
    window.addEventListener('keydown', onEsc);
    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', onEsc);
    };
  }, [onClose]);

  const parseSafeInt = (v) => {
    const n = parseInt(v, 10);
    return Number.isNaN(n) ? null : n;
  };
  const parseSafeFloat = (v) => {
    const n = parseFloat(v);
    return Number.isNaN(n) ? null : n;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const montoNum = parseSafeFloat(monto);
    const consultorNum = parseSafeInt(consultorId);
    const tipoNum = parseSafeInt(tipoTramiteId);

    const errs = [];
    if (montoNum === null || montoNum < 0) errs.push('Monto inválido');
    if (consultorNum === null) errs.push('Consultor requerido');
    if (tipoNum === null) errs.push('Tipo de trámite requerido');
    if (errs.length) { setError(errs.join(' · ')); return; }

    setIsLoading(true);
    setError(null);

    // No enviamos ni estado ni código: Rails los setea.
    const payload = {
      monto: montoNum,
      consultor_id: consultorNum,
      tipo_tramite_id: tipoNum,
    };

    try {
      const response = await fetch(`${API_BASE}/tramites`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
        body: JSON.stringify({ tramite: payload }),
      });

      const readJsonSafely = async () => { try { return await response.json(); } catch { return null; } };

      if (!response.ok) {
        const data = await readJsonSafely();
        const msg = data?.errors?.join(', ') || data?.error || `Error ${response.status}`;
        throw new Error(msg);
      }

      const newTramite = await readJsonSafely(); // debería venir con codigo autogenerado y estado "INGRESADO"
      onTramiteCreated?.(newTramite);
      onClose?.();
    } catch (err) {
      console.error('POST /tramites', err);
      setError(err.message || 'No se pudo crear el trámite.');
    } finally {
      setIsLoading(false);
    }
  };

  const stopMouseDown = (e) => e.stopPropagation();

  return (
    <div className="modal-backdrop" onMouseDown={onClose} role="presentation">
      <div className="modal-content" onMouseDown={stopMouseDown} role="dialog" aria-modal="true">
        <h3>Crear Nuevo Trámite</h3>

        <form onSubmit={handleSubmit} className="tramite-form">
          {error && <div className="form-error">{error}</div>}

          <label>
            Consultor Responsable:
            <select
              value={consultorId}
              onChange={(e) => setConsultorId(e.target.value)}
              disabled={isLoading}
              required
            >
              <option value="">Seleccione un consultor</option>
              {(consultores ?? []).map(c => (
                <option key={c.id} value={c.id}>{c.nombre}</option>
              ))}
            </select>
          </label>

          <label>
            Tipo de Trámite:
            <select
              value={tipoTramiteId}
              onChange={(e) => setTipoTramiteId(e.target.value)}
              disabled={isLoading}
              required
            >
              <option value="">Seleccione un tipo</option>
              {(tiposTramite ?? []).map(t => (
                <option key={t.id} value={t.id}>{t.nombre}</option>
              ))}
            </select>
          </label>

          <label>
            Monto del Servicio ($):
            <input
              type="number"
              value={monto}
              onChange={(e) => setMonto(e.target.value)}
              min="0"
              step="0.01"
              disabled={isLoading}
              required
            />
          </label>

          <div className="form-actions">
            <button type="submit" className="btn-primary" disabled={isLoading}>
              {isLoading ? 'Creando...' : 'Crear Trámite'}
            </button>
            <button type="button" className="btn-secondary" onClick={onClose} disabled={isLoading}>
              Cancelar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default TramiteForm;
