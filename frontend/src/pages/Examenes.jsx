import { useState, useEffect } from "react";
import api from "../api/client";
import CirculoProgreso from "../components/CirculoProgreso";
import { useApi } from "../hooks/useApi";

function Reloj({ minutos, onAgotado }) {
  const [segsRestantes, setSegsRestantes] = useState(minutos * 60);
  useEffect(() => {
    const t = setInterval(() => {
      setSegsRestantes((s) => {
        if (s <= 1) { clearInterval(t); onAgotado(); return 0; }
        return s - 1;
      });
    }, 1000);
    return () => clearInterval(t);
  }, []);
  const m = Math.floor(segsRestantes / 60), s = segsRestantes % 60;
  return <span style={{ fontWeight: 700, color: segsRestantes < 60 ? "var(--color-danger)" : "var(--color-primary)" }}>{m}:{String(s).padStart(2, "0")}</span>;
}

export default function Examenes() {
  const { datos: examenes, cargando, error: errorCarga, recargar: cargar } = useApi("/examenes");
  const [activo, setActivo] = useState(null); // examen que se está presentando
  const [respuestas, setRespuestas] = useState({});
  const [resultado, setResultado] = useState(null);
  const [error, setError] = useState("");

  async function abrir(id_examen) {
    setError(""); setResultado(null);
    try {
      const { data } = await api.get(`/examenes/${id_examen}`);
      if (data.finalizado) {
        setActivo(null);
        return;
      }
      setActivo(data);
      setRespuestas({});
    } catch (err) {
      setError(err.response?.data?.error || "No se pudo abrir el examen");
    }
  }

  async function enviar() {
    try {
      const { data } = await api.post(`/examenes/${activo.id_examen}/respuestas`, { respuestas });
      setResultado(data.resultado);
      setActivo(null);
      cargar();
    } catch (err) {
      setError(err.response?.data?.error || "No se pudo enviar el examen");
    }
  }

  if (activo) {
    return (
      <div className="container">
        <div className="card">
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <h2 style={{ margin: 0 }}>Examen: {activo.Postulacion?.Vacante?.titulo}</h2>
            <Reloj minutos={activo.tiempo_limite_min} onAgotado={enviar} />
          </div>
          <p style={{ color: "var(--color-ink-soft)", fontSize: 13 }}>
            Responde todas las preguntas antes de que se agote el tiempo. Una vez enviado, no podrás reiniciar este examen.
          </p>

          {activo.preguntas_json.map((p, i) => (
            <div key={p.id} style={{ marginBottom: 20, paddingBottom: 16, borderBottom: "1px solid var(--color-border)" }}>
              <p style={{ fontWeight: 600 }}>{i + 1}. {p.pregunta}</p>
              {p.tipo === "opcion_multiple" ? (
                <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                  {p.opciones.map((op, idx) => (
                    <label key={idx} style={{ fontSize: 14 }}>
                      <input type="radio" name={p.id} checked={respuestas[p.id] === idx}
                        onChange={() => setRespuestas({ ...respuestas, [p.id]: idx })} /> {op}
                    </label>
                  ))}
                </div>
              ) : (
                <textarea rows={4} style={{ width: "100%", padding: 10, border: "1px solid var(--color-border)", borderRadius: 8 }}
                  value={respuestas[p.id] || ""} onChange={(e) => setRespuestas({ ...respuestas, [p.id]: e.target.value })} />
              )}
            </div>
          ))}

          {error && <div className="alert alert-error">{error}</div>}
          <button className="btn btn-primary" onClick={enviar}>Enviar examen</button>
        </div>
      </div>
    );
  }

  return (
    <div className="container">
      <h2>Mis exámenes</h2>

      {resultado && (
        <div className="card" style={{ marginBottom: 20, display: "flex", gap: 24, flexWrap: "wrap", alignItems: "center" }}>
          <div style={{ textAlign: "center" }}>
            <div style={{ fontSize: 12.5, color: "var(--color-ink-soft)", marginBottom: 6 }}>Puntaje general</div>
            <CirculoProgreso porcentaje={resultado.puntaje_global} tamano={110} />
          </div>
          <div style={{ flex: 1, minWidth: 220 }}>
            <p style={{ fontSize: 13.5, margin: "4px 0" }}><strong>✅ Fortalezas:</strong> {resultado.fortalezas}</p>
            <p style={{ fontSize: 13.5, margin: "4px 0" }}><strong>❌ Áreas de mejora:</strong> {resultado.areas_mejora}</p>
            <p style={{ fontSize: 13.5, margin: "4px 0" }}><strong>Compatibilidad con la vacante:</strong> {resultado.nivel_compatibilidad}</p>
          </div>
        </div>
      )}

      {errorCarga && <div className="alert alert-error">{errorCarga}</div>}

      {cargando ? (
        <p>Cargando exámenes…</p>
      ) : !examenes || examenes.length === 0 ? (
        <div className="empty-state">Aún no tienes exámenes asignados. Se generan automáticamente cuando una empresa mueve tu postulación a "Evaluación pendiente".</div>
      ) : (
        <table>
          <thead><tr><th>Vacante</th><th>Tipo</th><th>Estatus</th><th>Resultado</th><th></th></tr></thead>
          <tbody>
            {examenes.map((ex) => (
              <tr key={ex.id_examen}>
                <td>{ex.Postulacion?.Vacante?.titulo}</td>
                <td>{ex.tipo === "tecnico" ? "Técnico" : "No técnico"}</td>
                <td>{ex.finalizado ? "Finalizado" : "Pendiente"}</td>
                <td>{ex.ResultadoExamen ? `${ex.ResultadoExamen.puntaje_global}%` : "—"}</td>
                <td>{!ex.finalizado && <button className="btn btn-accent" onClick={() => abrir(ex.id_examen)}>Presentar</button>}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
