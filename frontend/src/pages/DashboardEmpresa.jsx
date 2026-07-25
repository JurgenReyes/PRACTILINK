import { useState } from "react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from "recharts";
import api from "../api/client";
import EstatusBadge from "../components/EstatusBadge";
import Chat from "../components/Chat";
import { useAuth } from "../context/AuthContext";
import { useApi } from "../hooks/useApi";

const VACIA = { titulo: "", area: "", modalidad: "remoto", ubicacion: "", carrera_solicitada: "", requisitos: "", duracion_meses: "", apoyo_economico: "" };
const COLORES = ["#2563EB", "#EF4444", "#F59E0B", "#8B5CF6", "#16A34A"];

function Resumen() {
  const { datos: stats, cargando, error } = useApi("/empresa/dashboard");
  if (cargando) return <p>Cargando estadísticas…</p>;
  if (error || !stats) return <div className="alert alert-error">{error || "No se pudieron cargar las estadísticas."}</div>;

  const porVacante = Object.entries(stats.postulaciones_por_vacante).map(([titulo, total]) => ({ titulo, total }));
  const porEstatus = Object.entries(stats.postulaciones_por_estatus).map(([estatus, total]) => ({ estatus, total }));

  return (
    <div>
      <div className="grid grid-2" style={{ marginBottom: 24 }}>
        <div className="card" style={{ textAlign: "center" }}>
          <div style={{ fontSize: 28, fontWeight: 700, color: "var(--color-primary)" }}>{stats.vacantes_activas}</div>
          <div style={{ fontSize: 13, color: "var(--color-ink-soft)" }}>Vacantes activas</div>
        </div>
        <div className="card" style={{ textAlign: "center" }}>
          <div style={{ fontSize: 28, fontWeight: 700, color: "var(--color-primary)" }}>{stats.total_postulaciones}</div>
          <div style={{ fontSize: 13, color: "var(--color-ink-soft)" }}>Postulaciones totales</div>
        </div>
      </div>
      <div className="grid grid-2">
        <div className="card">
          <h3 style={{ fontSize: 15 }}>Postulaciones por vacante</h3>
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={porVacante}>
              <XAxis dataKey="titulo" tick={{ fontSize: 10 }} interval={0} angle={-15} textAnchor="end" height={60} />
              <YAxis allowDecimals={false} />
              <Tooltip />
              <Bar dataKey="total" fill="#2563EB" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div className="card">
          <h3 style={{ fontSize: 15 }}>Postulaciones por estatus</h3>
          <ResponsiveContainer width="100%" height={260}>
            <PieChart>
              <Pie data={porEstatus} dataKey="total" nameKey="estatus" outerRadius={90} label>
                {porEstatus.map((_, i) => <Cell key={i} fill={COLORES[i % COLORES.length]} />)}
              </Pie>
              <Tooltip /><Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}

function MisVacantes() {
  const { datos: vacantes, cargando, error: errorCarga, recargar: cargar } = useApi("/empresa/mis-vacantes");
  const [form, setForm] = useState(VACIA);
  const [mensaje, setMensaje] = useState("");
  const [error, setError] = useState("");

  async function crearVacante(e, estatus) {
    e.preventDefault();
    setError(""); setMensaje("");
    try {
      await api.post("/vacantes", { ...form, estatus });
      setMensaje(estatus === "publicada" ? "Vacante publicada." : "Vacante guardada como borrador.");
      setForm(VACIA);
      cargar();
    } catch (err) {
      setError(err.response?.data?.error || "No se pudo crear la vacante");
    }
  }

  async function cambiarEstatusVacante(id, estatus) {
    try {
      await api.put(`/vacantes/${id}`, { estatus });
      cargar();
    } catch (err) {
      setError(err.response?.data?.error || "No se pudo actualizar el estatus de la vacante");
    }
  }

  async function duplicar(id) {
    try {
      await api.post(`/vacantes/${id}/duplicar`);
      cargar();
    } catch (err) {
      setError(err.response?.data?.error || "No se pudo duplicar la vacante");
    }
  }

  return (
    <div>
      {error && <div className="alert alert-error">{error}</div>}
      {errorCarga && <div className="alert alert-error">{errorCarga}</div>}
      {mensaje && <div className="alert alert-success">{mensaje}</div>}

      <div className="card" style={{ marginBottom: 32 }}>
        <h3 style={{ fontSize: 16 }}>Publicar nueva vacante</h3>
        <form>
          <div className="grid grid-2">
            <div className="form-field">
              <label>Título del puesto</label>
              <input value={form.titulo} onChange={(e) => setForm({ ...form, titulo: e.target.value })} required />
            </div>
            <div className="form-field">
              <label>Área</label>
              <input value={form.area} onChange={(e) => setForm({ ...form, area: e.target.value })} />
            </div>
            <div className="form-field">
              <label>Modalidad</label>
              <select value={form.modalidad} onChange={(e) => setForm({ ...form, modalidad: e.target.value })}>
                <option value="remoto">Remoto</option>
                <option value="presencial">Presencial</option>
                <option value="hibrido">Híbrido</option>
              </select>
            </div>
            <div className="form-field">
              <label>Ubicación</label>
              <input value={form.ubicacion} onChange={(e) => setForm({ ...form, ubicacion: e.target.value })} />
            </div>
            <div className="form-field">
              <label>Carrera solicitada</label>
              <input value={form.carrera_solicitada} onChange={(e) => setForm({ ...form, carrera_solicitada: e.target.value })} />
            </div>
            <div className="form-field">
              <label>Duración (meses)</label>
              <input type="number" value={form.duracion_meses} onChange={(e) => setForm({ ...form, duracion_meses: e.target.value })} />
            </div>
            <div className="form-field">
              <label>Apoyo económico (MXN, opcional)</label>
              <input type="number" value={form.apoyo_economico} onChange={(e) => setForm({ ...form, apoyo_economico: e.target.value })} />
            </div>
          </div>
          <div className="form-field">
            <label>Requisitos y descripción</label>
            <textarea rows={4} value={form.requisitos} onChange={(e) => setForm({ ...form, requisitos: e.target.value })} />
          </div>
          <div style={{ display: "flex", gap: 10 }}>
            <button className="btn btn-outline" onClick={(e) => crearVacante(e, "borrador")}>Guardar borrador</button>
            <button className="btn btn-primary" onClick={(e) => crearVacante(e, "publicada")}>Publicar vacante</button>
          </div>
        </form>
      </div>

      <h3>Mis vacantes</h3>
      {cargando ? (
        <p>Cargando vacantes…</p>
      ) : !vacantes || vacantes.length === 0 ? (
        <div className="empty-state">Aún no tienes vacantes.</div>
      ) : (
        <table>
          <thead><tr><th>Título</th><th>Modalidad</th><th>Estatus</th><th>Acciones</th></tr></thead>
          <tbody>
            {vacantes.map((v) => (
              <tr key={v.id_vacante}>
                <td>{v.titulo}</td><td>{v.modalidad}</td>
                <td><EstatusBadge estatus={v.estatus} /></td>
                <td style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                  {v.estatus === "publicada" && <button className="btn btn-outline" onClick={() => cambiarEstatusVacante(v.id_vacante, "pausada")}>Pausar</button>}
                  {v.estatus === "pausada" && <button className="btn btn-outline" onClick={() => cambiarEstatusVacante(v.id_vacante, "publicada")}>Reactivar</button>}
                  {v.estatus === "borrador" && <button className="btn btn-primary" onClick={() => cambiarEstatusVacante(v.id_vacante, "publicada")}>Publicar</button>}
                  {v.estatus !== "cerrada" && <button className="btn btn-outline" onClick={() => cambiarEstatusVacante(v.id_vacante, "cerrada")}>Cerrar</button>}
                  <button className="btn btn-outline" onClick={() => duplicar(v.id_vacante)}>Duplicar</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

function Candidatos({ idUsuario }) {
  const { datos: vacantes } = useApi("/empresa/mis-vacantes");
  const [idVacante, setIdVacante] = useState("");
  const [filtros, setFiltros] = useState({ estatus: "", carrera: "", puntaje_min: "" });
  const [filtrosAplicados, setFiltrosAplicados] = useState({});
  const [error, setError] = useState("");
  const [chatAbierto, setChatAbierto] = useState(null);
  const [entrevista, setEntrevista] = useState(null); // id_postulacion en edición

  const { datos: candidatos, cargando, error: errorCarga, recargar: cargarCandidatos } =
    useApi(idVacante ? `/empresa/vacantes/${idVacante}/candidatos` : null, filtrosAplicados);

  function aplicarFiltros() {
    setFiltrosAplicados(Object.fromEntries(Object.entries(filtros).filter(([, v]) => v)));
  }

  function seleccionarVacante(id) {
    setIdVacante(id);
    aplicarFiltros();
  }

  async function cambiarEstatus(id, estatus) {
    try {
      await api.put(`/postulaciones/${id}/estatus`, { estatus });
      cargarCandidatos();
    } catch (err) {
      setError(err.response?.data?.error || "No se pudo cambiar el estatus");
    }
  }

  async function guardarNota(id, notas) {
    try {
      await api.put(`/empresa/postulaciones/${id}/notas`, { notas_internas: notas });
    } catch (err) {
      setError(err.response?.data?.error || "No se pudo guardar la nota");
    }
  }

  async function programar(id, e) {
    e.preventDefault();
    const form = new FormData(e.target);
    try {
      await api.put(`/empresa/postulaciones/${id}/entrevista`, {
        fecha_entrevista: form.get("fecha"),
        modalidad_entrevista: form.get("modalidad"),
        notas_entrevista: form.get("notas"),
        enlace_videollamada: form.get("enlace"),
      });
      setEntrevista(null);
      cargarCandidatos();
    } catch (err) {
      setError(err.response?.data?.error || "No se pudo programar la entrevista");
    }
  }

  return (
    <div>
      <div className="card" style={{ marginBottom: 20 }}>
        <div className="grid grid-2">
          <div className="form-field">
            <label>Vacante</label>
            <select value={idVacante} onChange={(e) => seleccionarVacante(e.target.value)}>
              <option value="">Selecciona una vacante</option>
              {(vacantes || []).map((v) => <option key={v.id_vacante} value={v.id_vacante}>{v.titulo}</option>)}
            </select>
          </div>
          <div className="form-field">
            <label>Filtrar por estatus</label>
            <select value={filtros.estatus} onChange={(e) => setFiltros({ ...filtros, estatus: e.target.value })}>
              <option value="">Todos</option>
              <option value="en_revision">En revisión</option>
              <option value="evaluacion_pendiente">Evaluación pendiente</option>
              <option value="entrevista_programada">Entrevista programada</option>
              <option value="aceptado">Aceptado</option>
              <option value="rechazado">Rechazado</option>
            </select>
          </div>
        </div>
        <button className="btn btn-primary" onClick={aplicarFiltros}>Aplicar filtros</button>
        {idVacante && <a className="btn btn-outline" style={{ marginLeft: 10 }}
          href={`${import.meta.env.VITE_API_URL || "http://localhost:4000/api"}/empresa/reportes/candidatos.csv`}
          target="_blank" rel="noreferrer">Exportar CSV</a>}
      </div>

      {error && <div className="alert alert-error">{error}</div>}
      {errorCarga && <div className="alert alert-error">{errorCarga}</div>}

      {!idVacante ? (
        <div className="empty-state">Selecciona una vacante para ver a sus candidatos.</div>
      ) : cargando ? (
        <p>Cargando candidatos…</p>
      ) : !candidatos || candidatos.length === 0 ? (
        <div className="empty-state">Aún no hay postulaciones para esta vacante.</div>
      ) : (
        candidatos.map((c) => (
          <div key={c.id_postulacion} className="card" style={{ marginBottom: 16 }}>
            <div style={{ display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: 10 }}>
              <div>
                <strong>{c.Estudiante?.nombre_completo}</strong> — {c.Estudiante?.universidad} · {c.Estudiante?.carrera}
                <div style={{ fontSize: 13, color: "var(--color-ink-soft)" }}>Matching: {c.matching_score}%</div>
              </div>
              <EstatusBadge estatus={c.estatus} />
            </div>

            {/* Resultado de la evaluación con IA: la empresa necesita ver el
                puntaje y el detalle para poder decidir si acepta al candidato. */}
            {c.Examen && (
              <div style={{ marginTop: 12, padding: 12, borderRadius: 8, background: "var(--color-bg)" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 8 }}>
                  <strong style={{ fontSize: 13.5 }}>🧠 Evaluación con IA</strong>
                  {!c.Examen.finalizado ? (
                    <span className="badge badge-pendiente">Examen no presentado aún</span>
                  ) : c.Examen.ResultadoExamen ? (
                    <span
                      className={`badge ${c.Examen.ResultadoExamen.puntaje_global >= 70 ? "badge-aceptado" : c.Examen.ResultadoExamen.puntaje_global >= 50 ? "badge-pendiente" : "badge-rechazado"}`}
                    >
                      Puntaje: {c.Examen.ResultadoExamen.puntaje_global}%
                    </span>
                  ) : (
                    <span className="badge badge-pendiente">Calificando…</span>
                  )}
                </div>

                {c.Examen.finalizado && c.Examen.ResultadoExamen && (
                  <div style={{ marginTop: 8, fontSize: 13 }}>
                    {c.Examen.ResultadoExamen.nivel_compatibilidad && (
                      <p style={{ margin: "2px 0" }}><strong>Compatibilidad con la vacante:</strong> {c.Examen.ResultadoExamen.nivel_compatibilidad}</p>
                    )}
                    {c.Examen.ResultadoExamen.fortalezas && (
                      <p style={{ margin: "2px 0" }}><strong>Fortalezas:</strong> {c.Examen.ResultadoExamen.fortalezas}</p>
                    )}
                    {c.Examen.ResultadoExamen.areas_mejora && (
                      <p style={{ margin: "2px 0" }}><strong>Áreas de mejora:</strong> {c.Examen.ResultadoExamen.areas_mejora}</p>
                    )}
                  </div>
                )}
              </div>
            )}

            <div className="form-field" style={{ marginTop: 10 }}>
              <label>Cambiar estatus</label>
              <select value={c.estatus} onChange={(e) => cambiarEstatus(c.id_postulacion, e.target.value)}>
                <option value="en_revision">En revisión</option>
                <option value="evaluacion_pendiente">Evaluación pendiente</option>
                <option value="entrevista_programada">Entrevista programada</option>
                <option value="aceptado">Aceptado</option>
                <option value="rechazado">Rechazado</option>
              </select>
            </div>

            <div className="form-field">
              <label>Notas internas (no visibles para el estudiante)</label>
              <textarea rows={2} defaultValue={c.notas_internas || ""} onBlur={(e) => guardarNota(c.id_postulacion, e.target.value)} />
            </div>

            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              <button className="btn btn-outline" onClick={() => setEntrevista(entrevista === c.id_postulacion ? null : c.id_postulacion)}>
                Programar entrevista
              </button>
              <button className="btn btn-outline" onClick={() => setChatAbierto(chatAbierto === c.id_postulacion ? null : c.id_postulacion)}>
                {chatAbierto === c.id_postulacion ? "Cerrar chat" : "Chat"}
              </button>
            </div>

            {entrevista === c.id_postulacion && (
              <form onSubmit={(e) => programar(c.id_postulacion, e)} style={{ marginTop: 12, background: "var(--color-bg)", padding: 12, borderRadius: 8 }}>
                <div className="grid grid-2">
                  <div className="form-field"><label>Fecha y hora</label><input type="datetime-local" name="fecha" required /></div>
                  <div className="form-field">
                    <label>Modalidad</label>
                    <select name="modalidad"><option value="presencial">Presencial</option><option value="videollamada">Videollamada</option></select>
                  </div>
                </div>
                <div className="form-field"><label>Enlace de videollamada (si aplica)</label><input name="enlace" placeholder="https://meet.google.com/..." /></div>
                <div className="form-field"><label>Notas para el estudiante</label><input name="notas" /></div>
                <button className="btn btn-primary" type="submit">Confirmar entrevista</button>
              </form>
            )}

            {chatAbierto === c.id_postulacion && (
              <div style={{ marginTop: 12 }}><Chat idPostulacion={c.id_postulacion} miIdUsuario={idUsuario} /></div>
            )}
          </div>
        ))
      )}
    </div>
  );
}

const PESTANAS_EMPRESA = [
  ["resumen", "📊 Dashboard"],
  ["vacantes", "💼 Vacantes"],
  ["candidatos", "🧑‍🤝‍🧑 Candidatos"],
];

export default function DashboardEmpresa() {
  const { idUsuario } = useAuth();
  const [tab, setTab] = useState("resumen");

  return (
    <div style={{ display: "flex", flex: 1, minHeight: "60vh" }}>
      <aside className="sidebar">
        {PESTANAS_EMPRESA.map(([key, label]) => (
          <button
            key={key}
            className={"side-item" + (tab === key ? " active" : "")}
            onClick={() => setTab(key)}
          >
            {label}
          </button>
        ))}
      </aside>
      <div className="container" style={{ flex: 1 }}>
        <h2>Dashboard Empresa</h2>
        {tab === "resumen" && <Resumen />}
        {tab === "vacantes" && <MisVacantes />}
        {tab === "candidatos" && <Candidatos idUsuario={idUsuario} />}
      </div>
    </div>
  );
}
