import { Link } from "react-router-dom";

export default function Inicio() {
  return (
    <div className="container">
      <div className="card" style={{ textAlign: "center", padding: 60 }}>
        <h1 style={{ fontSize: 34 }}>Conecta tu talento con la empresa correcta</h1>
        <p style={{ color: "var(--color-ink-soft)", fontSize: 16, maxWidth: 520, margin: "0 auto 24px" }}>
          PractiLink analiza tu CV con inteligencia artificial, calcula tu porcentaje de coincidencia
          con cada vacante y te acompaña desde la postulación hasta la entrevista.
        </p>
        <div style={{ display: "flex", gap: 12, justifyContent: "center" }}>
          <Link to="/vacantes" className="btn btn-primary">Explorar vacantes</Link>
          <Link to="/registro" className="btn btn-outline">Crear cuenta</Link>
        </div>
      </div>
    </div>
  );
}
