import { useState } from "react";
import api from "../api/client";
import EstatusBadge from "../components/EstatusBadge";
import { useApi } from "../hooks/useApi";

function Resumen() {
  const { datos: stats, cargando, error } = useApi("/admin/dashboard");
  if (cargando) return <p>Cargando…</p>;
  if (error || !stats) return <div className="alert alert-error">{error || "No se pudieron cargar las estadísticas."}</div>;
  const tarjetas = [
    ["Usuarios activos", stats.usuarios_activos],
    ["Empresas validadas", stats.empresas_validadas],
    ["Vacantes activas", stats.vacantes_activas],
    ["Postulaciones totales", stats.postulaciones_totales],
    ["Tasa de colocación", `${stats.tasa_colocacion}%`],
  ];
  return (
    <div className="grid grid-2">
      {tarjetas.map(([label, valor]) => (
        <div key={label} className="card" style={{ textAlign: "center" }}>
          <div style={{ fontSize: 26, fontWeight: 700, color: "var(--color-primary)" }}>{valor}</div>
          <div style={{ fontSize: 13, color: "var(--color-ink-soft)" }}>{label}</div>
        </div>
      ))}
      <a className="btn btn-outline" href={`${import.meta.env.VITE_API_URL || "http://localhost:4000/api"}/admin/reportes/usuarios.csv`} target="_blank" rel="noreferrer">
        Descargar reporte de usuarios (CSV)
      </a>
    </div>
  );
}

function Empresas() {
  const { datos: pendientes, cargando, error: errorCarga, recargar: cargar } = useApi("/admin/empresas/pendientes");
  const [mensaje, setMensaje] = useState("");
  const [error, setError] = useState("");
  async function validar(id, aprobar) {
    let motivo = null;
    if (!aprobar) { motivo = prompt("Motivo del rechazo (obligatorio):"); if (!motivo) return; }
    try {
      await api.put(`/admin/empresas/${id}/validar`, { aprobar, motivo });
      setMensaje(aprobar ? "Empresa aprobada." : "Empresa rechazada.");
      cargar();
    } catch (err) {
      setError(err.response?.data?.error || "No se pudo procesar la validación");
    }
  }
  return (
    <div>
      {error && <div className="alert alert-error">{error}</div>}
      {errorCarga && <div className="alert alert-error">{errorCarga}</div>}
      {mensaje && <div className="alert alert-success">{mensaje}</div>}
      {cargando ? <p>Cargando…</p> : !pendientes || pendientes.length === 0 ? <div className="empty-state">No hay empresas pendientes por validar.</div> : (
        <table>
          <thead><tr><th>Empresa</th><th>RFC</th><th>Giro</th><th>Correo</th><th>Acciones</th></tr></thead>
          <tbody>
            {pendientes.map((e) => (
              <tr key={e.id_empresa}>
                <td>{e.nombre_empresa}</td><td>{e.rfc}</td><td>{e.giro}</td><td>{e.Usuario?.correo}</td>
                <td style={{ display: "flex", gap: 8 }}>
                  <button className="btn btn-primary" onClick={() => validar(e.id_empresa, true)}>Aprobar</button>
                  <button className="btn btn-outline" onClick={() => validar(e.id_empresa, false)}>Rechazar</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

function Usuarios() {
  const [filtroTipo, setFiltroTipo] = useState("");
  const [error, setError] = useState("");
  const { datos: usuarios, cargando, error: errorCarga, recargar: cargar } =
    useApi("/admin/usuarios", filtroTipo ? { tipo: filtroTipo } : {});

  async function cambiarEstatus(id, estatus) {
    const motivo = estatus === "suspendido" ? prompt("Motivo de la suspensión:") : null;
    try {
      await api.put(`/admin/usuarios/${id}/estatus`, { estatus, motivo });
      cargar();
    } catch (err) {
      setError(err.response?.data?.error || "No se pudo cambiar el estatus del usuario");
    }
  }
  async function restablecer(id) {
    if (!confirm("¿Enviar una contraseña temporal a este usuario?")) return;
    try {
      await api.post(`/admin/usuarios/${id}/restablecer-password`);
      alert("Contraseña temporal enviada por correo.");
    } catch (err) {
      setError(err.response?.data?.error || "No se pudo restablecer la contraseña");
    }
  }
  async function eliminar(id) {
    if (!confirm("Esta acción elimina al usuario de forma permanente. ¿Continuar?")) return;
    try {
      await api.delete(`/admin/usuarios/${id}`, { data: { motivo: "Eliminado desde el panel de administración" } });
      cargar();
    } catch (err) {
      setError(err.response?.data?.error || "No se pudo eliminar al usuario");
    }
  }

  return (
    <div>
      {error && <div className="alert alert-error">{error}</div>}
      {errorCarga && <div className="alert alert-error">{errorCarga}</div>}
      <div className="form-field" style={{ maxWidth: 240 }}>
        <label>Filtrar por tipo</label>
        <select value={filtroTipo} onChange={(e) => setFiltroTipo(e.target.value)}>
          <option value="">Todos</option>
          <option value="estudiante">Estudiantes</option>
          <option value="empresa">Empresas</option>
          <option value="administrador">Administradores</option>
        </select>
      </div>
      {cargando && <p>Cargando…</p>}
      <table>
        <thead><tr><th>Correo</th><th>Rol</th><th>Estatus</th><th>Registro</th><th>Acciones</th></tr></thead>
        <tbody>
          {(usuarios || []).map((u) => (
            <tr key={u.id_usuario}>
              <td>{u.correo}</td><td>{u.rol}</td>
              <td><EstatusBadge estatus={u.estatus === "activo" ? "aceptado" : u.estatus === "suspendido" ? "rechazado" : "pendiente"} />{" "}{u.estatus}</td>
              <td>{new Date(u.fecha_creacion).toLocaleDateString()}</td>
              <td style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                {u.estatus === "activo"
                  ? <button className="btn btn-outline" onClick={() => cambiarEstatus(u.id_usuario, "suspendido")}>Suspender</button>
                  : <button className="btn btn-outline" onClick={() => cambiarEstatus(u.id_usuario, "activo")}>Reactivar</button>}
                <button className="btn btn-outline" onClick={() => restablecer(u.id_usuario)}>Restablecer password</button>
                <button className="btn btn-outline" onClick={() => eliminar(u.id_usuario)}>Eliminar</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function ModeracionVacantes() {
  const { datos: vacantes, cargando, error: errorCarga, recargar: cargar } = useApi("/admin/vacantes");
  const [error, setError] = useState("");
  async function darDeBaja(id) {
    const motivo = prompt("Motivo para dar de baja esta vacante:");
    if (!motivo) return;
    try {
      await api.put(`/admin/vacantes/${id}/dar-de-baja`, { motivo });
      cargar();
    } catch (err) {
      setError(err.response?.data?.error || "No se pudo dar de baja la vacante");
    }
  }
  if (cargando) return <p>Cargando…</p>;
  return (
    <div>
      {error && <div className="alert alert-error">{error}</div>}
      {errorCarga && <div className="alert alert-error">{errorCarga}</div>}
      <table>
        <thead><tr><th>Título</th><th>Empresa</th><th>Estatus</th><th>Acción</th></tr></thead>
        <tbody>
          {(vacantes || []).map((v) => (
            <tr key={v.id_vacante}>
              <td>{v.titulo}</td><td>{v.Empresa?.nombre_empresa}</td>
              <td><EstatusBadge estatus={v.estatus} /></td>
              <td>{v.estatus !== "cerrada" && <button className="btn btn-outline" onClick={() => darDeBaja(v.id_vacante)}>Dar de baja</button>}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
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
    </div>
  );
}

function Bitacora() {
  const { datos: registros, cargando, error } = useApi("/admin/bitacora");
  if (cargando) return <p>Cargando…</p>;
  if (error) return <div className="alert alert-error">{error}</div>;
  return (
    <table>
      <thead><tr><th>Fecha</th><th>Administrador</th><th>Acción</th><th>Detalle</th></tr></thead>
      <tbody>
        {(registros || []).map((r) => (
          <tr key={r.id_log}>
            <td>{new Date(r.fecha_creacion).toLocaleString()}</td>
            <td>{r.Administrador?.nombre_completo}</td>
            <td>{r.accion}</td>
            <td>{r.detalle}</td>
          </tr>
        ))}
      </tbody>
    </table>
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

const PESTANAS = [
  ["resumen", "Resumen", Resumen],
  ["empresas", "Validar empresas", Empresas],
  ["usuarios", "Usuarios", Usuarios],
  ["vacantes", "Moderar vacantes", ModeracionVacantes],
  ["configia", "Parámetros de IA", ConfiguracionIA],
  ["bitacora", "Bitácora", Bitacora],
  ["avisos", "Avisos", Avisos],
];

export default function DashboardAdmin() {
  const [tab, setTab] = useState("resumen");
  const Activa = PESTANAS.find(([key]) => key === tab)[2];
  return (
    <div className="container">
      <h2>Panel de administrador</h2>
      <div style={{ display: "flex", gap: 8, marginBottom: 24, flexWrap: "wrap" }}>
        {PESTANAS.map(([key, label]) => (
          <button key={key} className={tab === key ? "btn btn-primary" : "btn btn-outline"} onClick={() => setTab(key)}>{label}</button>
        ))}
      </div>
      <Activa />
    </div>
  );
}
