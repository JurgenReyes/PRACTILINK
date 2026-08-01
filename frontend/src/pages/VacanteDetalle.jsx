import { useParams, Link } from "react-router-dom";
import { useState } from "react";
import api from "../api/client";
import { useAuth } from "../context/AuthContext";
import { useApi } from "../hooks/useApi";

const BASE_ARCHIVOS = (import.meta.env.VITE_API_URL || "http://localhost:4000/api").replace(/\/api\/?$/, "");

export default function VacanteDetalle() {
  const { id } = useParams();
  const { rol } = useAuth();
  const { datos: vacante, cargando, error } = useApi(`/vacantes/${id}`);
  const [mensaje, setMensaje] = useState("");
  const [logoFallo, setLogoFallo] = useState(false);
  const [enviando, setEnviando] = useState(false);
  const [mostrarReporte, setMostrarReporte] = useState(false);
  const [motivoReporte, setMotivoReporte] = useState("");
  const [mensajeReporte, setMensajeReporte] = useState("");

  async function postularse() {
    setMensaje(""); setEnviando(true);
    try {
      await api.post("/postulaciones", { id_vacante: Number(id) });
      setMensaje("Postulación enviada correctamente.");
    } catch (err) {
      setMensaje(err.response?.data?.error || "No se pudo completar la postulación");
    } finally {
      setEnviando(false);
    }
  }

  async function enviarReporte(e) {
    e.preventDefault();
    setMensajeReporte("");
    try {
      await api.post(`/vacantes/${id}/reportar`, { motivo: motivoReporte });
      setMensajeReporte("Gracias por tu reporte. Un administrador la revisará.");
      setMotivoReporte("");
      setMostrarReporte(false);
    } catch (err) {
      setMensajeReporte(err.response?.data?.error || "No se pudo enviar el reporte");
    }
  }

  if (cargando) return <div className="container">Cargando…</div>;
  if (error || !vacante) return <div className="container"><div className="alert alert-error">{error || "Vacante no encontrada"}</div></div>;

  const requisitos = (vacante.requisitos || "").split("\n").filter(Boolean);
  const beneficios = (vacante.beneficios || "").split("\n").filter(Boolean);

  return (
    <div className="container">
      <p style={{ marginBottom: 12 }}><Link to="/vacantes">← Volver a vacantes</Link></p>

      <div className="card">
        <h2 style={{ marginBottom: 2 }}>{vacante.titulo}</h2>
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginTop: 0 }}>
          {vacante.Empresa?.logo_url && !logoFallo && (
            <img
              src={`${BASE_ARCHIVOS}${vacante.Empresa.logo_url}`}
              alt={vacante.Empresa.nombre_empresa}
              onError={() => setLogoFallo(true)}
              style={{ width: 32, height: 32, borderRadius: 6, objectFit: "contain", background: "#fff", border: "1px solid var(--color-border)" }}
            />
          )}
          <p style={{ color: "var(--color-primary)", fontWeight: 600, margin: 0 }}>{vacante.Empresa?.nombre_empresa}</p>
        </div>

        <h4>Descripción</h4>
        <p style={{ fontSize: 14, lineHeight: 1.6 }}>{vacante.area}</p>

        {requisitos.length > 0 && (
          <>
            <h4>Requisitos</h4>
            <ul style={{ fontSize: 14, lineHeight: 1.8, paddingLeft: 20 }}>
              {requisitos.map((r, i) => <li key={i}>{r}</li>)}
            </ul>
          </>
        )}

        {beneficios.length > 0 && (
          <>
            <h4>Beneficios</h4>
            <ul style={{ fontSize: 14, lineHeight: 1.8, paddingLeft: 20 }}>
              {beneficios.map((b, i) => <li key={i}>{b}</li>)}
            </ul>
          </>
        )}

        <p style={{ fontSize: 14, margin: "4px 0" }}><strong>Modalidad:</strong> {vacante.modalidad}</p>
        {vacante.apoyo_economico && (
          <p style={{ fontSize: 14, margin: "4px 0" }}><strong>Apoyo económico:</strong> ${Number(vacante.apoyo_economico).toLocaleString("es-MX")} MXN / mes</p>
        )}

        {mensaje && <div className={`alert ${mensaje.includes("correctamente") ? "alert-success" : "alert-error"}`} style={{ marginTop: 14 }}>{mensaje}</div>}

        {rol === "estudiante" ? (
          <button className="btn btn-primary btn-block" style={{ marginTop: 14 }} onClick={postularse} disabled={enviando}>
            {enviando ? "Enviando…" : "Postularme"}
          </button>
        ) : !rol ? (
          <Link to="/login" className="btn btn-primary btn-block" style={{ marginTop: 14 }}>Inicia sesión para postularte</Link>
        ) : null}

        {rol === "estudiante" && (
          <div style={{ marginTop: 14 }}>
            {mensajeReporte && <div className="alert alert-success">{mensajeReporte}</div>}
            {!mostrarReporte ? (
              <button className="btn btn-outline" onClick={() => setMostrarReporte(true)} style={{ fontSize: 12.5 }}>
                🚩 Reportar esta vacante
              </button>
            ) : (
              <form onSubmit={enviarReporte} style={{ background: "var(--color-bg)", padding: 12, borderRadius: 8 }}>
                <div className="form-field">
                  <label>Motivo del reporte</label>
                  <input
                    value={motivoReporte}
                    onChange={(e) => setMotivoReporte(e.target.value)}
                    placeholder="Ej. Contenido engañoso, pide dinero, etc."
                    required
                  />
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <button className="btn btn-accent" type="submit">Enviar reporte</button>
                  <button className="btn btn-outline" type="button" onClick={() => setMostrarReporte(false)}>Cancelar</button>
                </div>
              </form>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
