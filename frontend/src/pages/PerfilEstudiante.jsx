import { useState } from "react";
import api from "../api/client";
import EstatusBadge from "../components/EstatusBadge";
import Chat from "../components/Chat";
import { useAuth } from "../context/AuthContext";
import { useApi } from "../hooks/useApi";

export default function PerfilEstudiante() {
  const { idUsuario } = useAuth();
  const { datos: perfil, setDatos: setPerfil, cargando: cargandoPerfil, error: errorPerfil } = useApi("/estudiantes/perfil");
  const { datos: postulaciones, cargando: cargandoPost, error: errorPost } = useApi("/postulaciones/mias");
  const { datos: habilidades, cargando: cargandoHabilidades, recargar: recargarHabilidades } = useApi("/estudiantes/habilidades");
  const [nuevaHabilidad, setNuevaHabilidad] = useState({ nombre: "", tipo: "tecnica", nivel: "" });
  const [errorHabilidad, setErrorHabilidad] = useState("");
  const [nuevaExperiencia, setNuevaExperiencia] = useState({ puesto: "", empresa: "", periodo: "", descripcion: "" });
  const [archivo, setArchivo] = useState(null);
  const [subiendo, setSubiendo] = useState(false);
  const [mensaje, setMensaje] = useState("");
  const [error, setError] = useState("");
  const [perfilExtraido, setPerfilExtraido] = useState(null);
  const [chatAbierto, setChatAbierto] = useState(null);

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

  async function agregarHabilidad(e) {
    e.preventDefault();
    setErrorHabilidad("");
    if (!nuevaHabilidad.nombre.trim()) return;
    try {
      await api.post("/estudiantes/habilidades", nuevaHabilidad);
      setNuevaHabilidad({ nombre: "", tipo: "tecnica", nivel: "" });
      recargarHabilidades();
    } catch (err) {
      setErrorHabilidad(err.response?.data?.error || "No se pudo agregar la habilidad");
    }
  }

  async function eliminarHabilidad(id) {
    try {
      await api.delete(`/estudiantes/habilidades/${id}`);
      recargarHabilidades();
    } catch (err) {
      setErrorHabilidad(err.response?.data?.error || "No se pudo eliminar la habilidad");
    }
  }

  async function guardarExperiencia(lista) {
    setError(""); setMensaje("");
    try {
      const { data } = await api.put("/estudiantes/perfil", { ...perfil, experiencia_laboral: lista });
      setPerfil(data);
      setMensaje("Experiencia laboral actualizada.");
    } catch (err) {
      setError(err.response?.data?.error || "No se pudo guardar la experiencia laboral");
    }
  }

  function agregarExperiencia(e) {
    e.preventDefault();
    if (!nuevaExperiencia.puesto.trim() || !nuevaExperiencia.empresa.trim()) return;
    const lista = [...(perfil.experiencia_laboral || []), nuevaExperiencia];
    setNuevaExperiencia({ puesto: "", empresa: "", periodo: "", descripcion: "" });
    guardarExperiencia(lista);
  }

  function eliminarExperiencia(i) {
    const lista = (perfil.experiencia_laboral || []).filter((_, idx) => idx !== i);
    guardarExperiencia(lista);
  }

  if (cargandoPerfil) return <div className="container">Cargando perfil…</div>;
  if (errorPerfil || !perfil) return <div className="container"><div className="alert alert-error">{errorPerfil || "No se pudo cargar tu perfil."}</div></div>;

  return (
    <div className="container">
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 12 }}>
        <div style={{ display: "flex", gap: 14, alignItems: "center" }}>
          <div className="avatar-circle">
            {(perfil.nombre_completo || "?").split(" ").slice(0, 2).map((s) => s[0]).join("").toUpperCase()}
          </div>
          <div>
            <h2 style={{ margin: 0 }}>{perfil.nombre_completo || "Mi perfil"}</h2>
            <span style={{ fontSize: 13, color: "var(--color-ink-soft)" }}>{perfil.universidad}</span>
          </div>
        </div>
        <div style={{ textAlign: "center" }}>
          <div className="progress-ring" style={{ "--pct": perfil.porcentaje_perfil || 0 }}>
            <span>{perfil.porcentaje_perfil || 0}%</span>
          </div>
          <span style={{ fontSize: 12, color: "var(--color-ink-soft)" }}>Perfil completado</span>
        </div>
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

      <div className="card" style={{ marginTop: 24 }}>
        <h3 style={{ fontSize: 16 }}>Habilidades, certificaciones e idiomas</h3>
        {errorHabilidad && <div className="alert alert-error">{errorHabilidad}</div>}
        <form onSubmit={agregarHabilidad} className="grid grid-2" style={{ marginBottom: 12 }}>
          <div className="form-field">
            <label>Nombre</label>
            <input value={nuevaHabilidad.nombre} onChange={(e) => setNuevaHabilidad({ ...nuevaHabilidad, nombre: e.target.value })} placeholder="Ej. React, Inglés B2, Scrum..." />
          </div>
          <div className="form-field">
            <label>Tipo</label>
            <select value={nuevaHabilidad.tipo} onChange={(e) => setNuevaHabilidad({ ...nuevaHabilidad, tipo: e.target.value })}>
              <option value="tecnica">Técnica</option>
              <option value="software">Software</option>
              <option value="certificacion">Certificación</option>
              <option value="idioma">Idioma</option>
            </select>
          </div>
          <button className="btn btn-primary" type="submit">Agregar</button>
        </form>
        {cargandoHabilidades ? (
          <p>Cargando…</p>
        ) : !habilidades || habilidades.length === 0 ? (
          <p style={{ fontSize: 13, color: "var(--color-ink-soft)" }}>Aún no has agregado habilidades.</p>
        ) : (
          <div className="tags">
            {habilidades.map((h) => (
              <span key={h.id_habilidad} className="tag">
                {h.nombre}
                <button onClick={() => eliminarHabilidad(h.id_habilidad)} style={{ marginLeft: 6, border: "none", background: "none", cursor: "pointer", color: "var(--color-danger)" }}>×</button>
              </span>
            ))}
          </div>
        )}
      </div>

      <div className="card" style={{ marginTop: 24 }}>
        <h3 style={{ fontSize: 16 }}>Experiencia laboral</h3>
        <form onSubmit={agregarExperiencia} className="grid grid-2" style={{ marginBottom: 12 }}>
          <div className="form-field">
            <label>Puesto</label>
            <input value={nuevaExperiencia.puesto} onChange={(e) => setNuevaExperiencia({ ...nuevaExperiencia, puesto: e.target.value })} placeholder="Ej. Practicante de desarrollo" />
          </div>
          <div className="form-field">
            <label>Empresa</label>
            <input value={nuevaExperiencia.empresa} onChange={(e) => setNuevaExperiencia({ ...nuevaExperiencia, empresa: e.target.value })} />
          </div>
          <div className="form-field">
            <label>Periodo</label>
            <input value={nuevaExperiencia.periodo} onChange={(e) => setNuevaExperiencia({ ...nuevaExperiencia, periodo: e.target.value })} placeholder="Ej. Ene 2025 - Jun 2025" />
          </div>
          <div className="form-field">
            <label>Descripción</label>
            <input value={nuevaExperiencia.descripcion} onChange={(e) => setNuevaExperiencia({ ...nuevaExperiencia, descripcion: e.target.value })} />
          </div>
          <button className="btn btn-primary" type="submit">Agregar experiencia</button>
        </form>
        {!perfil.experiencia_laboral || perfil.experiencia_laboral.length === 0 ? (
          <p style={{ fontSize: 13, color: "var(--color-ink-soft)" }}>Aún no has agregado experiencia laboral.</p>
        ) : (
          perfil.experiencia_laboral.map((exp, i) => (
            <div key={i} style={{ display: "flex", justifyContent: "space-between", padding: "10px 0", borderBottom: "1px solid var(--color-border)" }}>
              <div>
                <strong>{exp.puesto}</strong> — {exp.empresa}
                <div style={{ fontSize: 12, color: "var(--color-ink-soft)" }}>{exp.periodo}</div>
                {exp.descripcion && <p style={{ fontSize: 13, margin: "4px 0 0" }}>{exp.descripcion}</p>}
              </div>
              <button className="btn btn-outline" onClick={() => eliminarExperiencia(i)}>Eliminar</button>
            </div>
          ))
        )}
      </div>

      <h3 id="postulaciones" style={{ marginTop: 32, scrollMarginTop: 90 }}>Mis postulaciones</h3>
      {errorPost && <div className="alert alert-error">{errorPost}</div>}
      {cargandoPost ? (
        <p>Cargando postulaciones…</p>
      ) : !postulaciones || postulaciones.length === 0 ? (
        <div className="empty-state">Aún no te has postulado a ninguna vacante.</div>
      ) : (
        <table>
          <thead>
            <tr><th>Vacante</th><th>Empresa</th><th>Matching</th><th>Estatus</th><th>Fecha</th><th></th></tr>
          </thead>
          <tbody>
            {postulaciones.map((p) => (
              <tr key={p.id_postulacion}>
                <td>{p.Vacante?.titulo}</td>
                <td>{p.Vacante?.Empresa?.nombre_empresa}</td>
                <td>{p.matching_score}%</td>
                <td><EstatusBadge estatus={p.estatus} /></td>
                <td>{new Date(p.fecha_postulacion).toLocaleDateString()}</td>
                <td>
                  <button className="btn btn-outline" onClick={() => setChatAbierto(chatAbierto === p.id_postulacion ? null : p.id_postulacion)}>
                    {chatAbierto === p.id_postulacion ? "Cerrar chat" : "Chat"}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {chatAbierto && (
        <div style={{ marginTop: 16 }}>
          <Chat idPostulacion={chatAbierto} miIdUsuario={idUsuario} />
        </div>
      )}
    </div>
  );
}
