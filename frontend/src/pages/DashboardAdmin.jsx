import { useState } from "react";
import { Link } from "react-router-dom";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import api from "../api/client";
import EstatusBadge from "../components/EstatusBadge";
import BotonExportar from "../components/BotonExportar";
import { useApi } from "../hooks/useApi";

function Resumen() {
  const { datos: stats, cargando, error } = useApi("/admin/dashboard");
  if (cargando) return <p>Cargando…</p>;
  if (error || !stats) return <div className="alert alert-error">{error || "No se pudieron cargar las estadísticas."}</div>;

  const tarjetas = [
    ["Usuarios activos", stats.usuarios_activos, "#2563EB"],
    ["Empresas validadas", stats.empresas_validadas, "#15803D"],
    ["Vacantes activas", stats.vacantes_activas, "#B45309"],
    ["Postulaciones totales", stats.postulaciones_totales, "#6D28D9"],
    ["Tasa de colocación", `${stats.tasa_colocacion}%`, "#EF4444"],
  ];

  const datosGrafica = (stats.usuarios_nuevos_por_semana || []).map((s) => ({
    semana: new Date(s.semana + "T00:00:00").toLocaleDateString("es-MX", { day: "numeric", month: "short" }),
    total: s.total,
  }));

  return (
    <div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))", gap: 14, marginBottom: 24 }}>
        {tarjetas.map(([label, valor, color]) => (
          <div key={label} className="card" style={{ textAlign: "center" }}>
            <div style={{ fontSize: 28, fontWeight: 800, color, fontFamily: "var(--font-display)" }}>{valor}</div>
            <div style={{ fontSize: 12.5, color: "var(--color-ink-soft)", marginTop: 2 }}>{label}</div>
          </div>
        ))}
      </div>

      <h4 style={{ marginBottom: 10 }}>Métricas de uso de la plataforma</h4>
      <div className="card" style={{ marginBottom: 16 }}>
        <div style={{ fontSize: 13, color: "var(--color-ink-soft)", marginBottom: 8 }}>Usuarios nuevos por semana</div>
        {datosGrafica.length === 0 ? (
          <div className="empty-state">Aún no hay suficiente actividad reciente para graficar.</div>
        ) : (
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={datosGrafica}>
              <XAxis dataKey="semana" fontSize={12} stroke="var(--color-ink-soft)" />
              <YAxis allowDecimals={false} fontSize={12} stroke="var(--color-ink-soft)" />
              <Tooltip />
              <Line type="monotone" dataKey="total" stroke="var(--color-primary)" strokeWidth={2} dot={{ r: 3 }} />
            </LineChart>
          </ResponsiveContainer>
        )}
      </div>

      <div className="card" style={{ marginBottom: 16 }}>
        <div style={{ fontSize: 13, color: "var(--color-ink-soft)", marginBottom: 10 }}>Vacantes con mayor demanda</div>
        {(!stats.vacantes_mayor_demanda || stats.vacantes_mayor_demanda.length === 0) ? (
          <div className="empty-state">Aún no hay postulaciones registradas.</div>
        ) : (
          stats.vacantes_mayor_demanda.map((v, i) => (
            <div key={i} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "8px 0", borderBottom: i < stats.vacantes_mayor_demanda.length - 1 ? "1px solid var(--color-border)" : "none" }}>
              <span>{v.titulo}</span>
              <strong>{v.postulantes} postulantes</strong>
            </div>
          ))
        )}
      </div>

      <div className="card" style={{ marginBottom: 20 }}>
        <div style={{ fontSize: 13, color: "var(--color-ink-soft)", marginBottom: 6 }}>Tiempo promedio de respuesta de empresas</div>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
          <span>Promedio general de la plataforma</span>
          <strong style={{ fontSize: 20, color: "var(--color-primary)" }}>{stats.tiempo_promedio_respuesta_dias} días</strong>
        </div>
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: 10, justifyContent: "flex-end" }}>
        <BotonExportar ruta="/admin/reportes/usuarios.csv" nombreArchivo="usuarios_practilink.csv">
          Exportar Excel
        </BotonExportar>
        <BotonExportar ruta="/admin/dashboard.pdf" nombreArchivo="dashboard_practilink.pdf" primario>
          Exportar PDF
        </BotonExportar>
      </div>
    </div>
  );
}

function Empresas() {
  const { datos, cargando, error: errorCarga, recargar: cargar } = useApi("/admin/empresas/pendientes");
  const [mensaje, setMensaje] = useState("");
  const [error, setError] = useState("");
  const [motivos, setMotivos] = useState({});

  async function validar(id, aprobar) {
    const motivo = motivos[id] || "";
    if (!aprobar && !motivo.trim()) { setError("El motivo es obligatorio si se rechaza."); return; }
    setError("");
    try {
      await api.put(`/admin/empresas/${id}/validar`, { aprobar, motivo });
      setMensaje(aprobar ? "Empresa aprobada." : "Empresa rechazada.");
      cargar();
    } catch (err) {
      setError(err.response?.data?.error || "No se pudo procesar la validación");
    }
  }

  const pendientes = datos?.pendientes || [];
  const conteos = datos?.conteos || { pendientes: 0, aprobadas: 0, rechazadas: 0 };

  return (
    <div>
      <h4 style={{ marginTop: 0 }}>Validación de Empresas</h4>
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 16, flexWrap: "wrap" }}>
        <span className="badge badge-pendiente">Pendientes: {conteos.pendientes}</span>
        <span className="badge badge-aceptado">Aprobadas: {conteos.aprobadas}</span>
        <span className="badge badge-rechazado">Rechazadas: {conteos.rechazadas}</span>
      </div>

      {error && <div className="alert alert-error">{error}</div>}
      {errorCarga && <div className="alert alert-error">{errorCarga}</div>}
      {mensaje && <div className="alert alert-success">{mensaje}</div>}

      {cargando ? <p>Cargando…</p> : pendientes.length === 0 ? (
        <div className="empty-state">No hay empresas pendientes por validar.</div>
      ) : (
        pendientes.map((e) => (
          <div key={e.id_empresa} className="card" style={{ marginBottom: 14 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 8 }}>
              <div>
                <strong style={{ fontSize: 15 }}>{e.nombre_empresa}</strong>
                <div style={{ fontSize: 12.5, color: "var(--color-ink-soft)" }}>
                  RFC: {e.rfc} · Giro: {e.giro || "—"}
                </div>
                <div style={{ fontSize: 12.5, color: "var(--color-ink-soft)" }}>
                  Contacto: {e.responsable || "—"} · {e.Usuario?.correo} · {e.telefono || "—"}
                </div>
              </div>
              <span className="badge badge-pendiente">Pendiente de validación</span>
            </div>

            <div className="form-field" style={{ marginTop: 10, marginBottom: 10 }}>
              <input
                placeholder="Motivo (obligatorio si se rechaza)…"
                value={motivos[e.id_empresa] || ""}
                onChange={(ev) => setMotivos({ ...motivos, [e.id_empresa]: ev.target.value })}
              />
            </div>

            <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
              <button className="btn btn-primary" onClick={() => validar(e.id_empresa, true)}>Aprobar</button>
              <button className="btn btn-accent" onClick={() => validar(e.id_empresa, false)}>Rechazar</button>
              <button className="btn btn-outline" disabled title="No hay documentos adjuntos en el prototipo actual">Ver documentación</button>
            </div>
          </div>
        ))
      )}
    </div>
  );
}

function nombreDe(u) {
  return u.Estudiante?.nombre_completo || u.Empresa?.nombre_empresa || "—";
}

function DetalleUsuario({ usuario, onVolver, onCambio }) {
  const [motivo, setMotivo] = useState("");
  const [error, setError] = useState("");
  const [ok, setOk] = useState("");

  async function cambiarEstatus(estatus) {
    if ((estatus === "suspendido") && !motivo.trim()) {
      setError("El motivo es obligatorio para suspender o eliminar una cuenta.");
      return;
    }
    setError(""); setOk("");
    try {
      await api.put(`/admin/usuarios/${usuario.id_usuario}/estatus`, { estatus, motivo });
      setOk("Estatus actualizado.");
      onCambio();
    } catch (err) {
      setError(err.response?.data?.error || "No se pudo cambiar el estatus del usuario");
    }
  }

  async function restablecer() {
    try {
      await api.post(`/admin/usuarios/${usuario.id_usuario}/restablecer-password`);
      setOk("Contraseña temporal enviada por correo.");
    } catch (err) {
      setError(err.response?.data?.error || "No se pudo restablecer la contraseña");
    }
  }

  async function eliminar() {
    if (!motivo.trim()) { setError("El motivo es obligatorio para suspender o eliminar una cuenta."); return; }
    if (!confirm("Esta acción elimina al usuario de forma permanente. ¿Continuar?")) return;
    setError(""); setOk("");
    try {
      await api.delete(`/admin/usuarios/${usuario.id_usuario}`, { data: { motivo } });
      onCambio();
      onVolver();
    } catch (err) {
      setError(err.response?.data?.error || "No se pudo eliminar al usuario");
    }
  }

  const esEstudiante = Boolean(usuario.Estudiante);

  return (
    <div className="card">
      <button className="btn btn-outline" style={{ marginBottom: 16 }} onClick={onVolver}>← Volver a usuarios</button>
      <h3 style={{ marginTop: 0 }}>Detalle de Usuario — {nombreDe(usuario)}</h3>

      {error && <div className="alert alert-error">{error}</div>}
      {ok && <div className="alert alert-success">{ok}</div>}

      <div style={{ fontSize: 14, lineHeight: 2 }}>
        <p style={{ margin: "4px 0" }}><strong>Correo:</strong> {usuario.correo}</p>
        {esEstudiante ? (
          <>
            <p style={{ margin: "4px 0" }}><strong>Universidad:</strong> {usuario.Estudiante?.universidad || "—"}</p>
            <p style={{ margin: "4px 0" }}><strong>Carrera:</strong> {usuario.Estudiante?.carrera || "—"}</p>
            <p style={{ margin: "4px 0" }}><strong>Semestre:</strong> {usuario.Estudiante?.semestre || "—"}</p>
            <p style={{ margin: "4px 0" }}><strong>Perfil completado:</strong> {usuario.Estudiante?.porcentaje_perfil ?? 0}%</p>
          </>
        ) : usuario.Empresa ? (
          <>
            <p style={{ margin: "4px 0" }}><strong>Empresa:</strong> {usuario.Empresa.nombre_empresa}</p>
            <p style={{ margin: "4px 0" }}><strong>RFC:</strong> {usuario.Empresa.rfc}</p>
            <p style={{ margin: "4px 0" }}><strong>Giro:</strong> {usuario.Empresa.giro || "—"}</p>
            <p style={{ margin: "4px 0" }}><strong>Validación:</strong> {usuario.Empresa.estatus_validacion}</p>
          </>
        ) : null}
        <p style={{ margin: "4px 0" }}><strong>Fecha de registro:</strong> {new Date(usuario.fecha_creacion).toLocaleDateString("es-MX")}</p>
        <p style={{ margin: "4px 0" }}><strong>Estatus actual:</strong> <EstatusBadge estatus={usuario.estatus === "activo" ? "aceptado" : "rechazado"} /></p>
      </div>

      <h4>Acciones administrativas</h4>
      <div style={{ display: "flex", flexDirection: "column", gap: 8, maxWidth: 420 }}>
        <button className="btn btn-outline" onClick={restablecer}>Restablecer contraseña (token temporal)</button>
        {usuario.estatus === "activo" ? (
          <button className="btn btn-outline" onClick={() => cambiarEstatus("suspendido")}>Suspender cuenta</button>
        ) : (
          <button className="btn btn-outline" onClick={() => cambiarEstatus("activo")}>Reactivar cuenta</button>
        )}
        <button className="btn btn-accent" onClick={eliminar}>Eliminar cuenta definitivamente</button>
      </div>

      <div className="form-field" style={{ marginTop: 14, maxWidth: 420 }}>
        <label>Motivo (obligatorio para suspender/eliminar)</label>
        <input value={motivo} onChange={(e) => setMotivo(e.target.value)} placeholder="Ej. Incumplimiento de políticas de la plataforma" />
      </div>
      <p style={{ fontSize: 12, color: "var(--color-ink-soft)" }}>
        ⚠️ Esta acción queda registrada en la bitácora de auditoría con usuario, fecha/hora y motivo.
      </p>
    </div>
  );
}

function Usuarios() {
  const [q, setQ] = useState("");
  const [filtroTipo, setFiltroTipo] = useState("");
  const [filtroEstatus, setFiltroEstatus] = useState("");
  const [seleccionado, setSeleccionado] = useState(null);
  const params = {};
  if (filtroTipo) params.tipo = filtroTipo;
  if (filtroEstatus) params.estatus = filtroEstatus;
  if (q) params.q = q;
  const { datos: usuarios, cargando, error: errorCarga, recargar: cargar } = useApi("/admin/usuarios", params);

  const usuarioSeleccionado = (usuarios || []).find((u) => u.id_usuario === seleccionado);
  if (usuarioSeleccionado) {
    return (
      <DetalleUsuario
        usuario={usuarioSeleccionado}
        onVolver={() => setSeleccionado(null)}
        onCambio={cargar}
      />
    );
  }

  return (
    <div>
      {errorCarga && <div className="alert alert-error">{errorCarga}</div>}

      <div className="card" style={{ marginBottom: 16 }}>
        <div className="grid grid-3">
          <div className="form-field" style={{ marginBottom: 0 }}>
            <label>Buscar</label>
            <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Buscar por nombre o correo…" />
          </div>
          <div className="form-field" style={{ marginBottom: 0 }}>
            <label>Tipo</label>
            <select value={filtroTipo} onChange={(e) => setFiltroTipo(e.target.value)}>
              <option value="">Todos</option>
              <option value="estudiante">Estudiantes</option>
              <option value="empresa">Empresas</option>
              <option value="administrador">Administradores</option>
            </select>
          </div>
          <div className="form-field" style={{ marginBottom: 0 }}>
            <label>Estatus</label>
            <select value={filtroEstatus} onChange={(e) => setFiltroEstatus(e.target.value)}>
              <option value="">Todos</option>
              <option value="activo">Activo</option>
              <option value="suspendido">Suspendido</option>
            </select>
          </div>
        </div>
      </div>

      {cargando ? <p>Cargando…</p> : (
        <>
          <table>
            <thead>
              <tr><th>Nombre</th><th>Correo</th><th>Tipo</th><th>Universidad / Empresa</th><th>Fecha registro</th><th>Estatus</th><th>Acciones</th></tr>
            </thead>
            <tbody>
              {(usuarios || []).map((u) => (
                <tr key={u.id_usuario}>
                  <td>{nombreDe(u)}</td>
                  <td>{u.correo}</td>
                  <td>{u.rol.charAt(0).toUpperCase() + u.rol.slice(1)}</td>
                  <td>{u.Estudiante?.universidad || u.Empresa?.nombre_empresa || "—"}</td>
                  <td>{new Date(u.fecha_creacion).toLocaleDateString("es-MX")}</td>
                  <td><EstatusBadge estatus={u.estatus === "activo" ? "aceptado" : "rechazado"} /></td>
                  <td><button className="btn btn-outline" onClick={() => setSeleccionado(u.id_usuario)}>Ver</button></td>
                </tr>
              ))}
            </tbody>
          </table>
          <p style={{ fontSize: 12.5, color: "var(--color-ink-soft)", marginTop: 8 }}>
            Mostrando {(usuarios || []).length} usuario{(usuarios || []).length === 1 ? "" : "s"}
          </p>
        </>
      )}
    </div>
  );
}

function ModeracionVacantes() {
  const [q, setQ] = useState("");
  const [filtroEstatus, setFiltroEstatus] = useState("");
  const [soloReportadas, setSoloReportadas] = useState("");
  const params = {};
  if (q) params.q = q;
  if (filtroEstatus) params.estatus = filtroEstatus;
  if (soloReportadas) params.reportadas = soloReportadas;
  const { datos: vacantes, cargando, error: errorCarga, recargar: cargar } = useApi("/admin/vacantes", params);
  const [motivos, setMotivos] = useState({});
  const [error, setError] = useState("");

  async function darDeBaja(id) {
    const motivo = motivos[id];
    if (!motivo || !motivo.trim()) { setError("Escribe el motivo de la baja antes de confirmar."); return; }
    setError("");
    try {
      await api.put(`/admin/vacantes/${id}/dar-de-baja`, { motivo });
      cargar();
    } catch (err) {
      setError(err.response?.data?.error || "No se pudo dar de baja la vacante");
    }
  }

  async function descartarReporte(id) {
    try {
      await api.put(`/admin/vacantes/${id}/descartar-reporte`);
      cargar();
    } catch (err) {
      setError(err.response?.data?.error || "No se pudo descartar el reporte");
    }
  }

  const reportadas = (vacantes || []).filter((v) => v.reportada);

  return (
    <div>
      <h4 style={{ marginTop: 0 }}>Gestión y Moderación de Vacantes</h4>

      <div className="card" style={{ marginBottom: 16 }}>
        <div className="grid grid-3">
          <div className="form-field" style={{ marginBottom: 0 }}>
            <label>Buscar</label>
            <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Buscar vacante o empresa…" />
          </div>
          <div className="form-field" style={{ marginBottom: 0 }}>
            <label>Estatus</label>
            <select value={filtroEstatus} onChange={(e) => setFiltroEstatus(e.target.value)}>
              <option value="">Todos</option>
              <option value="publicada">Activa</option>
              <option value="pausada">Pausada</option>
              <option value="cerrada">Cerrada</option>
              <option value="borrador">Borrador</option>
            </select>
          </div>
          <div className="form-field" style={{ marginBottom: 0 }}>
            <label>Reportadas</label>
            <select value={soloReportadas} onChange={(e) => setSoloReportadas(e.target.value)}>
              <option value="">Todas</option>
              <option value="1">Solo reportadas</option>
            </select>
          </div>
        </div>
      </div>

      {error && <div className="alert alert-error">{error}</div>}
      {errorCarga && <div className="alert alert-error">{errorCarga}</div>}

      {cargando ? <p>Cargando…</p> : (
        <table style={{ marginBottom: 20 }}>
          <thead><tr><th>Vacante</th><th>Empresa</th><th>Modalidad</th><th>Publicada</th><th>Estatus</th><th>Acciones</th></tr></thead>
          <tbody>
            {(vacantes || []).map((v) => (
              <tr key={v.id_vacante}>
                <td>{v.titulo}{v.reportada && " 🚩"}</td>
                <td>{v.Empresa?.nombre_empresa}</td>
                <td>{v.modalidad}</td>
                <td>{new Date(v.fecha_creacion).toLocaleDateString("es-MX")}</td>
                <td><EstatusBadge estatus={v.reportada ? "rechazado" : v.estatus} />{v.reportada && " Reportada"}</td>
                <td>
                  <Link className="btn btn-outline" to={`/vacantes/${v.id_vacante}`} target="_blank" rel="noreferrer">Ver</Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {reportadas.map((v) => (
        <div key={v.id_vacante} className="card" style={{ borderLeft: "4px solid var(--color-danger)", marginBottom: 14 }}>
          <strong style={{ color: "var(--color-danger)" }}>🚩 Vacante reportada: "{v.titulo}"</strong>
          <p style={{ fontSize: 13, margin: "6px 0" }}>Motivo del reporte: {v.motivo_reporte}</p>
          <div className="form-field">
            <label>Motivo de la baja (se notificará a la empresa)</label>
            <input
              value={motivos[v.id_vacante] || ""}
              onChange={(e) => setMotivos({ ...motivos, [v.id_vacante]: e.target.value })}
              placeholder="Contenido engañoso, incumple políticas de la plataforma"
            />
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <button className="btn btn-accent" onClick={() => darDeBaja(v.id_vacante)}>Confirmar baja de vacante</button>
            <button className="btn btn-outline" onClick={() => descartarReporte(v.id_vacante)}>Descartar reporte</button>
          </div>
        </div>
      ))}
    </div>
  );
}

function HistorialExamenes() {
  const { datos: examenes, cargando, error } = useApi("/admin/examenes");
  if (cargando) return <p>Cargando historial…</p>;
  if (error) return <div className="alert alert-error">{error}</div>;
  if (!examenes || examenes.length === 0) return <div className="empty-state">Aún no se ha generado ningún examen.</div>;

  return (
    <table>
      <thead><tr><th>Estudiante</th><th>Vacante</th><th>Tipo</th><th>Puntaje</th><th>Fecha</th><th>Estatus</th></tr></thead>
      <tbody>
        {examenes.map((ex) => (
          <tr key={ex.id_examen}>
            <td>{ex.Postulacion?.Estudiante?.nombre_completo || "—"}</td>
            <td>{ex.Postulacion?.Vacante?.titulo || "—"}</td>
            <td>{ex.tipo}</td>
            <td>{ex.ResultadoExamen ? `${ex.ResultadoExamen.puntaje_global}%` : "—"}</td>
            <td>{new Date(ex.fecha_creacion).toLocaleDateString("es-MX")}</td>
            <td>{ex.finalizado ? <span className="badge badge-aceptado">Sin incidencias</span> : <span className="badge badge-pendiente">Pendiente</span>}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

function ConfiguracionIA() {
  const { datos: config, cargando, error: errorCarga, recargar: cargar } = useApi("/admin/configuracion-ia");
  const [mensaje, setMensaje] = useState("");
  const [error, setError] = useState("");
  async function guardar(clave, valor) {
    try {
      await api.put("/admin/configuracion-ia", { clave, valor });
      setMensaje(`Parámetro "${clave}" actualizado.`);
      cargar();
    } catch (err) {
      setError(err.response?.data?.error || "No se pudo actualizar el parámetro");
    }
  }
  return (
    <div>
      {error && <div className="alert alert-error">{error}</div>}
      {errorCarga && <div className="alert alert-error">{errorCarga}</div>}
      {mensaje && <div className="alert alert-success">{mensaje}</div>}
      <h4 style={{ marginTop: 0 }}>Criterios de Matching</h4>
      <p style={{ fontSize: 13, color: "var(--color-ink-soft)" }}>
        Estos parámetros controlan cómo la IA calcula el matching y genera exámenes en toda la plataforma.
      </p>
      {cargando && <p>Cargando…</p>}
      {(config || []).map((c) => (
        <div key={c.clave} className="card" style={{ marginBottom: 12, display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12 }}>
          <div>
            <strong>{c.clave}</strong>
            <div style={{ fontSize: 12, color: "var(--color-ink-soft)" }}>{c.descripcion}</div>
          </div>
          <input defaultValue={c.valor} style={{ width: 100, padding: 8, border: "1px solid var(--color-border)", borderRadius: 8 }}
            onBlur={(e) => e.target.value !== c.valor && guardar(c.clave, e.target.value)} />
        </div>
      ))}

      <h4>Historial de exámenes generados por IA</h4>
      <HistorialExamenes />
    </div>
  );
}

function Bitacora() {
  const [q, setQ] = useState("");
  const { datos: registros, cargando, error } = useApi("/admin/bitacora");
  if (cargando) return <p>Cargando…</p>;
  if (error) return <div className="alert alert-error">{error}</div>;

  const filtrados = q
    ? (registros || []).filter((r) =>
        r.accion?.toLowerCase().includes(q.toLowerCase()) ||
        r.Administrador?.nombre_completo?.toLowerCase().includes(q.toLowerCase())
      )
    : registros || [];

  return (
    <div>
      <h4 style={{ marginTop: 0 }}>Bitácora de Auditoría</h4>
      <div style={{ display: "flex", gap: 10, marginBottom: 14, flexWrap: "wrap", alignItems: "flex-end" }}>
        <div className="form-field" style={{ marginBottom: 0, flex: 1, minWidth: 220 }}>
          <label>Buscar por acción o administrador</label>
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Ej. suspendió, Karol Gloria…" />
        </div>
        <BotonExportar ruta="/admin/reportes/bitacora.csv" nombreArchivo="bitacora_practilink.csv">
          Exportar Excel
        </BotonExportar>
        <BotonExportar ruta="/admin/reportes/bitacora.pdf" nombreArchivo="bitacora_practilink.pdf" primario>
          Exportar PDF
        </BotonExportar>
      </div>

      <table>
        <thead><tr><th>Fecha</th><th>Administrador</th><th>Acción</th><th>Detalle</th></tr></thead>
        <tbody>
          {filtrados.map((r) => (
            <tr key={r.id_log}>
              <td>{new Date(r.fecha_creacion).toLocaleString("es-MX")}</td>
              <td>{r.Administrador?.nombre_completo}</td>
              <td>{r.accion}</td>
              <td>{r.detalle}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function Avisos() {
  const { datos: avisos, cargando, error: errorCarga, recargar: cargar } = useApi("/admin/avisos");
  const [form, setForm] = useState({ titulo: "", mensaje: "", dirigido_a: "todos" });
  const [error, setError] = useState("");
  async function publicar(e) {
    e.preventDefault();
    try {
      await api.post("/admin/avisos", form);
      setForm({ titulo: "", mensaje: "", dirigido_a: "todos" });
      cargar();
    } catch (err) {
      setError(err.response?.data?.error || "No se pudo publicar el aviso");
    }
  }
  return (
    <div>
      {error && <div className="alert alert-error">{error}</div>}
      {errorCarga && <div className="alert alert-error">{errorCarga}</div>}
      <form onSubmit={publicar} className="card" style={{ marginBottom: 20 }}>
        <div className="form-field"><label>Título</label><input value={form.titulo} onChange={(e) => setForm({ ...form, titulo: e.target.value })} required /></div>
        <div className="form-field"><label>Mensaje</label><textarea rows={3} value={form.mensaje} onChange={(e) => setForm({ ...form, mensaje: e.target.value })} required /></div>
        <div className="form-field">
          <label>Dirigido a</label>
          <select value={form.dirigido_a} onChange={(e) => setForm({ ...form, dirigido_a: e.target.value })}>
            <option value="todos">Todos</option><option value="estudiantes">Estudiantes</option><option value="empresas">Empresas</option>
          </select>
        </div>
        <button className="btn btn-primary" type="submit">Publicar aviso</button>
      </form>
      {cargando && <p>Cargando…</p>}
      {(avisos || []).map((a) => (
        <div key={a.id_aviso} className="card" style={{ marginBottom: 10 }}>
          <strong>{a.titulo}</strong>
          <p style={{ fontSize: 13 }}>{a.mensaje}</p>
        </div>
      ))}
    </div>
  );
}

function Catalogos() {
  const [tipo, setTipo] = useState("universidades");
  const { datos: items, cargando, error: errorCarga, recargar: cargar } = useApi(`/admin/catalogos/${tipo}`);
  const [nombre, setNombre] = useState("");
  const [error, setError] = useState("");

  async function agregar(e) {
    e.preventDefault();
    setError("");
    try {
      await api.post(`/admin/catalogos/${tipo}`, { nombre });
      setNombre("");
      cargar();
    } catch (err) {
      setError(err.response?.data?.error || "No se pudo agregar");
    }
  }

  async function eliminar(id) {
    if (!confirm("¿Eliminar este elemento del catálogo?")) return;
    try {
      await api.delete(`/admin/catalogos/${tipo}/${id}`);
      cargar();
    } catch (err) {
      setError(err.response?.data?.error || "No se pudo eliminar");
    }
  }

  const idCampo = tipo === "universidades" ? "id_universidad" : "id_carrera";

  return (
    <div>
      <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>
        <button className={tipo === "universidades" ? "btn btn-primary" : "btn btn-outline"} onClick={() => setTipo("universidades")}>Universidades</button>
        <button className={tipo === "carreras" ? "btn btn-primary" : "btn btn-outline"} onClick={() => setTipo("carreras")}>Carreras</button>
      </div>

      {error && <div className="alert alert-error">{error}</div>}
      {errorCarga && <div className="alert alert-error">{errorCarga}</div>}

      <form onSubmit={agregar} className="card" style={{ marginBottom: 20, display: "flex", gap: 10, alignItems: "flex-end", flexWrap: "wrap" }}>
        <div className="form-field" style={{ flex: 1, minWidth: 220, marginBottom: 0 }}>
          <label>{tipo === "universidades" ? "Nueva universidad" : "Nueva carrera"}</label>
          <input value={nombre} onChange={(e) => setNombre(e.target.value)} required />
        </div>
        <button className="btn btn-primary" type="submit">Agregar</button>
      </form>

      {cargando ? <p>Cargando…</p> : !items || items.length === 0 ? (
        <div className="empty-state">Aún no hay elementos en este catálogo.</div>
      ) : (
        <table>
          <thead><tr><th>Nombre</th><th></th></tr></thead>
          <tbody>
            {items.map((item) => (
              <tr key={item[idCampo]}>
                <td>{item.nombre}</td>
                <td style={{ textAlign: "right" }}>
                  <button className="btn btn-outline" onClick={() => eliminar(item[idCampo])}>Eliminar</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

function Administradores() {
  const { datos: admins, cargando, error: errorCarga, recargar: cargar } = useApi("/admin/administradores");
  const [form, setForm] = useState({ nombre_completo: "", correo: "", password: "", nivel_permiso: "soporte" });
  const [error, setError] = useState("");
  const [mensaje, setMensaje] = useState("");

  async function crear(e) {
    e.preventDefault();
    setError(""); setMensaje("");
    try {
      await api.post("/admin/administradores", form);
      setMensaje("Administrador creado correctamente.");
      setForm({ nombre_completo: "", correo: "", password: "", nivel_permiso: "soporte" });
      cargar();
    } catch (err) {
      setError(err.response?.data?.error || "No se pudo crear el administrador");
    }
  }

  const ETIQUETA_NIVEL = { superadministrador: "Superadministrador", soporte: "Soporte", moderador: "Moderador de contenido" };

  return (
    <div>
      {error && <div className="alert alert-error">{error}</div>}
      {mensaje && <div className="alert alert-success">{mensaje}</div>}
      {errorCarga && <div className="alert alert-error">{errorCarga}</div>}

      <form onSubmit={crear} className="card" style={{ marginBottom: 20 }}>
        <h4 style={{ marginTop: 0 }}>Crear nueva cuenta de administrador</h4>
        <div className="grid grid-2">
          <div className="form-field"><label>Nombre completo</label>
            <input value={form.nombre_completo} onChange={(e) => setForm({ ...form, nombre_completo: e.target.value })} required />
          </div>
          <div className="form-field"><label>Correo</label>
            <input type="email" value={form.correo} onChange={(e) => setForm({ ...form, correo: e.target.value })} required />
          </div>
          <div className="form-field"><label>Contraseña temporal</label>
            <input type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} required minLength={8} />
          </div>
          <div className="form-field"><label>Nivel de permiso</label>
            <select value={form.nivel_permiso} onChange={(e) => setForm({ ...form, nivel_permiso: e.target.value })}>
              <option value="soporte">Soporte</option>
              <option value="moderador">Moderador de contenido</option>
              <option value="superadministrador">Superadministrador</option>
            </select>
          </div>
        </div>
        <button className="btn btn-primary" type="submit">Crear administrador</button>
      </form>

      {cargando ? <p>Cargando…</p> : (
        <table>
          <thead><tr><th>Nombre</th><th>Correo</th><th>Nivel</th><th>Estatus</th></tr></thead>
          <tbody>
            {(admins || []).map((a) => (
              <tr key={a.id_admin}>
                <td>{a.nombre_completo}</td>
                <td>{a.Usuario?.correo}</td>
                <td>{ETIQUETA_NIVEL[a.nivel_permiso] || a.nivel_permiso}</td>
                <td>{a.Usuario?.estatus}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

function PlantillasCorreo() {
  const { datos: plantillas, cargando, error: errorCarga, recargar: cargar } = useApi("/admin/plantillas-correo");
  const [editando, setEditando] = useState(null); // clave de la plantilla en edición
  const [form, setForm] = useState({ asunto: "", cuerpo: "" });
  const [error, setError] = useState("");
  const [mensaje, setMensaje] = useState("");

  function abrirEdicion(p) {
    setEditando(p.clave);
    setForm({ asunto: p.asunto, cuerpo: p.cuerpo });
    setMensaje(""); setError("");
  }

  async function guardar(clave) {
    if (!form.asunto.trim() || !form.cuerpo.trim()) { setError("Asunto y cuerpo son obligatorios."); return; }
    setError("");
    try {
      await api.put(`/admin/plantillas-correo/${clave}`, form);
      setMensaje("Plantilla actualizada.");
      setEditando(null);
      cargar();
    } catch (err) {
      setError(err.response?.data?.error || "No se pudo actualizar la plantilla");
    }
  }

  if (cargando) return <p>Cargando…</p>;
  if (errorCarga) return <div className="alert alert-error">{errorCarga}</div>;

  return (
    <div className="card" style={{ marginBottom: 24 }}>
      {error && <div className="alert alert-error">{error}</div>}
      {mensaje && <div className="alert alert-success">{mensaje}</div>}
      {(plantillas || []).map((p, i) => (
        <div key={p.clave} style={{ padding: "12px 0", borderBottom: i < plantillas.length - 1 ? "1px solid var(--color-border)" : "none" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 8 }}>
            <div>
              <span style={{ fontSize: 14, fontWeight: 600 }}>{p.nombre}</span>
              {!p.personalizada && <span style={{ fontSize: 11, color: "var(--color-ink-soft)", marginLeft: 8 }}>(usando texto por defecto)</span>}
            </div>
            {editando !== p.clave && (
              <button className="btn btn-outline" onClick={() => abrirEdicion(p)}>Editar</button>
            )}
          </div>

          {editando === p.clave && (
            <div style={{ marginTop: 10 }}>
              <div className="form-field">
                <label>Asunto</label>
                <input value={form.asunto} onChange={(e) => setForm({ ...form, asunto: e.target.value })} />
              </div>
              <div className="form-field">
                <label>Cuerpo del correo</label>
                <textarea rows={4} value={form.cuerpo} onChange={(e) => setForm({ ...form, cuerpo: e.target.value })} />
                <p style={{ fontSize: 11.5, color: "var(--color-ink-soft)", marginTop: 4 }}>
                  Variables disponibles según la plantilla: <code>{"{{enlace}}"}</code>, <code>{"{{mensaje}}"}</code> — se sustituyen automáticamente al enviar el correo.
                </p>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <button className="btn btn-primary" onClick={() => guardar(p.clave)}>Guardar</button>
                <button className="btn btn-outline" onClick={() => setEditando(null)}>Cancelar</button>
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

function ConfiguracionGeneral() {
  return (
    <div>
      <h4 style={{ marginTop: 0 }}>Catálogos</h4>
      <p style={{ fontSize: 13, color: "var(--color-ink-soft)", marginTop: -6 }}>
        Universidades y carreras disponibles en los formularios de registro.
      </p>
      <Catalogos />

      <h4>Plantillas de correo automático</h4>
      <PlantillasCorreo />

      <h4>Cuentas de administrador</h4>
      <Administradores />

      <h4>Avisos y anuncios generales</h4>
      <Avisos />
    </div>
  );
}

const PESTANAS = [
  ["resumen", "📊 Dashboard", Resumen],
  ["empresas", "🏢 Empresas", Empresas],
  ["usuarios", "👥 Usuarios", Usuarios],
  ["vacantes", "💼 Vacantes", ModeracionVacantes],
  ["configia", "🤖 Módulo IA", ConfiguracionIA],
  ["bitacora", "📄 Bitácora y Reportes", Bitacora],
  ["configuracion", "⚙️ Configuración", ConfiguracionGeneral],
];

export default function DashboardAdmin() {
  const [tab, setTab] = useState("resumen");
  const Activa = PESTANAS.find(([key]) => key === tab)[2];
  return (
    <div className="body-wrap" style={{ minHeight: "auto" }}>
      <aside className="sidebar">
        {PESTANAS.map(([key, label]) => (
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
        <h2>Panel de administrador</h2>
        <Activa />
      </div>
    </div>
  );
}
