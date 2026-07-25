import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../api/client";

export default function Inicio() {
  const [total, setTotal] = useState(null);

  useEffect(() => {
    api.get("/vacantes").then(({ data }) => setTotal(data.length)).catch(() => setTotal(null));
  }, []);

  return (
    <div className="container">
      <div className="card" style={{ textAlign: "center", padding: 60 }}>
        <div style={{ display: "inline-block", background: "var(--color-primary-light)", color: "var(--color-primary-dark)", fontSize: 12, fontWeight: 700, padding: "4px 12px", borderRadius: 999, marginBottom: 16 }}>
          INTELIGENCIA ARTIFICIAL · VACANTES REALES · PROCESO FÁCIL
        </div>
        <h1 style={{ fontSize: 34 }}>Conectando talento universitario<br />con oportunidades reales</h1>
        <p style={{ color: "var(--color-ink-soft)", fontSize: 16, maxWidth: 520, margin: "0 auto 24px" }}>
          PractiLink analiza tu CV con inteligencia artificial, calcula tu porcentaje de coincidencia
          con cada vacante y te acompaña desde la postulación hasta la entrevista.
        </p>
        <div style={{ display: "flex", gap: 12, justifyContent: "center", marginBottom: 32 }}>
          <Link to="/vacantes" className="btn btn-primary">Explorar vacantes</Link>
          <Link to="/registro" className="btn btn-outline">Crear cuenta</Link>
        </div>

        <div className="grid grid-2" style={{ maxWidth: 480, margin: "0 auto" }}>
          <div className="card" style={{ padding: 16 }}>
            <div style={{ fontSize: 26, fontWeight: 700, color: "var(--color-primary)" }}>{total ?? "—"}</div>
            <div style={{ fontSize: 13, color: "var(--color-ink-soft)" }}>Vacantes activas</div>
          </div>
          <div className="card" style={{ padding: 16 }}>
            <div style={{ fontSize: 26, fontWeight: 700, color: "var(--color-primary)" }}>IA</div>
            <div style={{ fontSize: 13, color: "var(--color-ink-soft)" }}>Evaluación automática</div>
          </div>
        </div>
      </div>
    </div>
  );
}
