import { useEffect, useState } from "react";
import api from "../api/client";
import EstatusBadge from "../components/EstatusBadge";

export default function PerfilEstudiante() {
  const [perfil, setPerfil] = useState(null);
  const [postulaciones, setPostulaciones] = useState([]);
  const [archivo, setArchivo] = useState(null);
  const [subiendo, setSubiendo] = useState(false);
  const [mensaje, setMensaje] = useState("");
  const [error, setError] = useState("");
  const [perfilExtraido, setPerfilExtraido] = useState(null);

  async function cargarDatos() {
    const [{ data: p }, { data: post }] = await Promise.all([
      api.get("/estudiantes/perfil"),
      api.get("/postulaciones/mias"),
    ]);
    setPerfil(p);
    setPostulaciones(post);
  }

  useEffect(() => { cargarDatos(); }, []);

  async function guardarPerfil(e) {
    e.preventDefault();
    setError(""); setMensaje("");
    try {
      const { data } = await api.put("/estudiantes/perfil", perfil);
      setPerfil(data);
      setMensaje("Perfil actualizado correctamente.");
    } catch (err) {
      setError(err.response?.data?.error || "No se pudo actualizar el perfil");
    }
  }

  async function subirCV(e) {
    e.preventDefault();
    if (!archivo) return;
    setSubiendo(true); setError(""); setMensaje("");
    try {
      const formData = new FormData();
      formData.append("cv", archivo);
      const { data } = await api.post("/estudiantes/cv", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setPerfilExtraido(data.perfil_extraido);
      setMensaje("CV analizado. Revisa y confirma los datos extraídos abajo.");
    } catch (err) {
      setError(err.response?.data?.error || "No se pudo analizar el CV. Puedes reintentar o completar tu perfil manualmente.");
    } finally {
      setSubiendo(false);
    }
  }

  if (!perfil) return <div className="container">Cargando perfil…</div>;

  return (
    <div className="container">
      <h2>Mi perfil</h2>
      <div style={{ marginBottom: 8, fontSize: 14, color: "var(--color-ink-soft)" }}>
        Perfil completado: <strong>{perfil.porcentaje_perfil}%</strong>
      </div>

      {error && <div className="alert alert-error">{error}</div>}
      {mensaje && <div className="alert alert-success">{mensaje}</div>}

      <div className="grid grid-2">
        <div className="card">
          <h3 style={{ fontSize: 16 }}>Información académica</h3>
          <form onSubmit={guardarPerfil}>
            <div className="form-field">
              <label>Nombre completo</label>
              <input value={perfil.nombre_completo || ""} onChange={(e) => setPerfil({ ...perfil, nombre_completo: e.target.value })} />
            </div>
            <div className="form-field">
              <label>Universidad</label>
              <input value={perfil.universidad || ""} onChange={(e) => setPerfil({ ...perfil, universidad: e.target.value })} />
            </div>
            <div className="form-field">
              <label>Carrera</label>
              <input value={perfil.carrera || ""} onChange={(e) => setPerfil({ ...perfil, carrera: e.target.value })} />
            </div>
            <div className="form-field">
              <label>Semestre actual</label>
              <input type="number" value={perfil.semestre || ""} onChange={(e) => setPerfil({ ...perfil, semestre: e.target.value })} />
            </div>
            <div className="form-field">
              <label>Promedio (0–10)</label>
              <input type="number" step="0.1" min="0" max="10" value={perfil.promedio || ""} onChange={(e) => setPerfil({ ...perfil, promedio: e.target.value })} />
            </div>
            <button className="btn btn-primary" type="submit">Guardar cambios</button>
          </form>
        </div>

        <div className="card">
          <h3 style={{ fontSize: 16 }}>Cargar CV (PDF, máx. 10 MB)</h3>
          <form onSubmit={subirCV}>
            <div className="form-field">
              <input type="file" accept="application/pdf" onChange={(e) => setArchivo(e.target.files[0])} />
            </div>
            <button className="btn btn-accent" type="submit" disabled={subiendo}>
              {subiendo ? "Analizando con IA…" : "Subir y analizar"}
            </button>
          </form>

          {perfilExtraido && (
            <div style={{ marginTop: 16, fontSize: 13 }}>
              <strong>Habilidades técnicas detectadas:</strong>
              <div className="tags" style={{ marginTop: 6 }}>
                {perfilExtraido.habilidades_tecnicas.map((h) => <span key={h} className="tag">{h}</span>)}
              </div>
              <p style={{ marginTop: 10, color: "var(--color-ink-soft)" }}>
                Formación: {perfilExtraido.formacion_academica[0]?.titulo} — {perfilExtraido.formacion_academica[0]?.institucion}
              </p>
            </div>
          )}
        </div>
      </div>

      <h3 style={{ marginTop: 32 }}>Mis postulaciones</h3>
      {postulaciones.length === 0 ? (
        <div className="empty-state">Aún no te has postulado a ninguna vacante.</div>
      ) : (
        <table>
          <thead>
            <tr><th>Vacante</th><th>Empresa</th><th>Matching</th><th>Estatus</th><th>Fecha</th></tr>
          </thead>
          <tbody>
            {postulaciones.map((p) => (
              <tr key={p.id_postulacion}>
                <td>{p.Vacante?.titulo}</td>
                <td>{p.Vacante?.Empresa?.nombre_empresa}</td>
                <td>{p.matching_score}%</td>
                <td><EstatusBadge estatus={p.estatus} /></td>
                <td>{new Date(p.fecha_postulacion).toLocaleDateString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
