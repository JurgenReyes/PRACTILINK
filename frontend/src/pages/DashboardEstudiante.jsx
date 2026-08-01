import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import api from "../api/client";
import CirculoProgreso from "../components/CirculoProgreso";
import { useApi } from "../hooks/useApi";

export default function DashboardEstudiante() {
  const { datos: perfil } = useApi("/estudiantes/perfil");
  const { datos: postulaciones, cargando, error } = useApi("/postulaciones/mias");
  const { datos: notificaciones } = useApi("/notificaciones");

  const [recomendadas, setRecomendadas] = useState([]);

  useEffect(() => {
    if (!perfil?.carrera) return;
    api.get("/vacantes", { params: { carrera: perfil.carrera } })
      .then(({ data }) => setRecomendadas(data.slice(0, 3)))
      .catch(() => setRecomendadas([]));
  }, [perfil?.carrera]);

  const resumen = useMemo(() => {
    const lista = postulaciones || [];
    return {
      en_revision: lista.filter((p) => p.estatus === "en_revision" || p.estatus === "evaluacion_pendiente").length,
      entrevistas: lista.filter((p) => p.estatus === "entrevista_programada").length,
      aceptadas: lista.filter((p) => p.estatus === "aceptado").length,
    };
  }, [postulaciones]);

  const proximasEntrevistas = useMemo(() => {
    const hoy = new Date();
    return (postulaciones || [])
      .filter((p) => p.fecha_entrevista && new Date(p.fecha_entrevista) >= hoy)
      .sort((a, b) => new Date(a.fecha_entrevista) - new Date(b.fecha_entrevista))
      .slice(0, 2);
  }, [postulaciones]);

  // "Coincidencia con vacantes": promedio del matching_score de las
  // postulaciones activas del estudiante; si aún no se ha postulado a nada,
  // se usa el % de perfil completado como referencia inicial.
  const coincidencia = useMemo(() => {
    const conScore = (postulaciones || []).filter((p) => p.matching_score != null);
    if (conScore.length === 0) return perfil?.porcentaje_perfil || 0;
    return conScore.reduce((s, p) => s + Number(p.matching_score), 0) / conScore.length;
  }, [postulaciones, perfil]);

  if (cargando) return <div className="container">Cargando…</div>;
  if (error) return <div className="container"><div className="alert alert-error">{error}</div></div>;

  return (
    <div className="container">
      <h2>Resumen del Dashboard</h2>

      <div className="card" style={{ display: "flex", flexWrap: "wrap", gap: 28 }}>
        <div style={{ flex: "1 1 320px", minWidth: 280 }}>
          <h4 style={{ marginTop: 0 }}>Postulaciones</h4>
          <p style={{ margin: "4px 0", fontSize: 14 }}>· En revisión: <strong>{resumen.en_revision}</strong></p>
          <p style={{ margin: "4px 0", fontSize: 14 }}>· Entrevistas: <strong>{resumen.entrevistas}</strong></p>
          <p style={{ margin: "4px 0", fontSize: 14 }}>· Aceptadas: <strong>{resumen.aceptadas}</strong></p>

          <h4 style={{ marginBottom: 6 }}>Vacantes Recomendadas</h4>
          {recomendadas.length === 0 ? (
            <p style={{ fontSize: 13.5, color: "var(--color-ink-soft)" }}>Completa tu carrera en tu perfil para ver recomendaciones.</p>
          ) : (
            recomendadas.map((v) => (
              <p key={v.id_vacante} style={{ margin: "4px 0", fontSize: 14 }}>
                · <Link to={`/vacantes/${v.id_vacante}`}>{v.titulo}</Link> — {v.Empresa?.nombre_empresa}
              </p>
            ))
          )}

          <h4 style={{ marginBottom: 6 }}>Próximas Entrevistas</h4>
          {proximasEntrevistas.length === 0 ? (
            <p style={{ fontSize: 13.5, color: "var(--color-ink-soft)" }}>No tienes entrevistas próximas.</p>
          ) : (
            proximasEntrevistas.map((p) => (
              <p key={p.id_postulacion} style={{ margin: "4px 0", fontSize: 14 }}>
                · {p.Vacante?.Empresa?.nombre_empresa} - {new Date(p.fecha_entrevista).toLocaleDateString("es-MX")}
              </p>
            ))
          )}

          <h4 style={{ marginBottom: 6 }}>Notificaciones Recientes</h4>
          {(!notificaciones || notificaciones.length === 0) ? (
            <p style={{ fontSize: 13.5, color: "var(--color-ink-soft)" }}>Sin notificaciones nuevas.</p>
          ) : (
            notificaciones.slice(0, 2).map((n) => (
              <p key={n.id_notificacion} style={{ margin: "4px 0", fontSize: 14 }}>· {n.mensaje}</p>
            ))
          )}
        </div>

        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 8, minWidth: 160 }}>
          <CirculoProgreso porcentaje={coincidencia} tamano={110} />
          <div style={{ fontSize: 12.5, color: "var(--color-ink-soft)", textAlign: "center" }}>Coincidencia con vacantes</div>
        </div>
      </div>
    </div>
  );
}
