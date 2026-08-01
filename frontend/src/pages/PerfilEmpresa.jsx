import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../api/client";
import { useApi } from "../hooks/useApi";

export default function PerfilEmpresa() {
  const { datos: empresa, cargando, error: errorCarga, setDatos: setEmpresa } = useApi("/empresa/perfil");
  const [form, setForm] = useState(null);
  const [mensaje, setMensaje] = useState("");
  const [error, setError] = useState("");
  const [guardando, setGuardando] = useState(false);
  const [subiendoLogo, setSubiendoLogo] = useState(false);
  const [logoFallo, setLogoFallo] = useState(false);

  const BASE_ARCHIVOS = (import.meta.env.VITE_API_URL || "http://localhost:4000/api").replace(/\/api\/?$/, "");

  useEffect(() => {
    if (empresa) setForm({ nombre_empresa: empresa.nombre_empresa, giro: empresa.giro || "", responsable: empresa.responsable || "", telefono: empresa.telefono || "" });
  }, [empresa]);

  async function subirLogo(e) {
    const archivo = e.target.files[0];
    if (!archivo) return;
    setSubiendoLogo(true); setError(""); setMensaje("");
    try {
      const formData = new FormData();
      formData.append("logo", archivo);
      const { data } = await api.post("/empresa/logo", formData, { headers: { "Content-Type": "multipart/form-data" } });
      setEmpresa(data);
      setLogoFallo(false);
      setMensaje("Logo actualizado.");
    } catch (err) {
      setError(err.response?.data?.error || "No se pudo subir el logo");
    } finally {
      setSubiendoLogo(false);
      e.target.value = "";
    }
  }

  async function guardar(e) {
    e.preventDefault();
    setError(""); setMensaje(""); setGuardando(true);
    try {
      const { data } = await api.put("/empresa/perfil", form);
      setEmpresa(data);
      setMensaje("Datos de la empresa actualizados correctamente.");
    } catch (err) {
      setError(err.response?.data?.error || "No se pudo actualizar el perfil de la empresa");
    } finally {
      setGuardando(false);
    }
  }

  if (cargando || !form) return <div className="container">Cargando…</div>;
  if (errorCarga || !empresa) return <div className="container"><div className="alert alert-error">{errorCarga || "No se pudo cargar el perfil."}</div></div>;

  const ETIQUETA_VALIDACION = { pendiente: "Pendiente de validación", aprobada: "Aprobada", rechazada: "Rechazada" };

  return (
    <div className="container">
      <p style={{ marginBottom: 12 }}><Link to="/empresa">← Volver al panel</Link></p>
      <h2>Mi empresa</h2>

      {mensaje && <div className="alert alert-success">{mensaje}</div>}
      {error && <div className="alert alert-error">{error}</div>}

      <div className="card" style={{ marginBottom: 20 }}>
        <h4 style={{ marginTop: 0 }}>Información de la cuenta</h4>
        <div style={{ display: "flex", gap: 16, alignItems: "center", marginBottom: 14 }}>
          <label style={{ position: "relative", cursor: "pointer" }} title="Cambiar logo de la empresa">
            {empresa.logo_url && !logoFallo ? (
              <img
                src={`${BASE_ARCHIVOS}${empresa.logo_url}`}
                alt={`Logo de ${empresa.nombre_empresa}`}
                onError={() => setLogoFallo(true)}
                style={{ width: 90, height: 90, borderRadius: 12, objectFit: "contain", objectPosition: "center", background: "#fff", border: "1px solid var(--color-border)", display: "block" }}
              />
            ) : (
              <div style={{
                width: 90, height: 90, borderRadius: 12, background: "var(--color-primary-light)", color: "var(--color-primary-dark)",
                display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 800, fontSize: 26,
              }}>
                {(empresa.nombre_empresa || "?").slice(0, 2).toUpperCase()}
              </div>
            )}
            <span style={{
              position: "absolute", bottom: -2, right: -2, background: "var(--color-primary)", color: "#fff",
              width: 26, height: 26, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: 13, border: "2px solid #fff",
            }}>
              {subiendoLogo ? "…" : "✎"}
            </span>
            <input type="file" accept="image/jpeg,image/png,image/webp,image/svg+xml" onChange={subirLogo} disabled={subiendoLogo} style={{ display: "none" }} />
          </label>
          <div style={{ fontSize: 12.5, color: "var(--color-ink-soft)" }}>
            Este logo se muestra en tus vacantes publicadas para que los estudiantes te reconozcan.
          </div>
        </div>

        <p style={{ fontSize: 14, margin: "4px 0" }}><strong>Correo:</strong> {empresa.Usuario?.correo}</p>
        <p style={{ fontSize: 14, margin: "4px 0" }}><strong>RFC:</strong> {empresa.rfc}</p>
        <p style={{ fontSize: 14, margin: "4px 0" }}>
          <strong>Estatus de validación:</strong>{" "}
          <span className={`badge ${empresa.estatus_validacion === "aprobada" ? "badge-aceptado" : empresa.estatus_validacion === "rechazada" ? "badge-rechazado" : "badge-pendiente"}`}>
            {ETIQUETA_VALIDACION[empresa.estatus_validacion]}
          </span>
        </p>
        {empresa.estatus_validacion === "rechazada" && empresa.motivo_rechazo && (
          <p style={{ fontSize: 13, color: "var(--color-danger)", margin: "4px 0" }}>Motivo: {empresa.motivo_rechazo}</p>
        )}
        <p style={{ fontSize: 12, color: "var(--color-ink-soft)", marginTop: 10 }}>
          El correo, el RFC y el estatus de validación no se pueden editar aquí. Si necesitas cambiarlos, contacta a soporte.
        </p>
      </div>

      <form onSubmit={guardar} className="card">
        <h4 style={{ marginTop: 0 }}>Datos generales</h4>
        <div className="form-field">
          <label>Nombre de la empresa</label>
          <input value={form.nombre_empresa} onChange={(e) => setForm({ ...form, nombre_empresa: e.target.value })} required />
        </div>
        <div className="grid grid-2">
          <div className="form-field">
            <label>Giro</label>
            <input value={form.giro} onChange={(e) => setForm({ ...form, giro: e.target.value })} placeholder="Ej. Desarrollo de software" />
          </div>
          <div className="form-field">
            <label>Teléfono</label>
            <input value={form.telefono} onChange={(e) => setForm({ ...form, telefono: e.target.value })} placeholder="Ej. 449 123 4567" />
          </div>
        </div>
        <div className="form-field">
          <label>Responsable de reclutamiento</label>
          <input value={form.responsable} onChange={(e) => setForm({ ...form, responsable: e.target.value })} />
        </div>
        <button className="btn btn-primary" type="submit" disabled={guardando}>
          {guardando ? "Guardando…" : "Guardar cambios"}
        </button>
      </form>
    </div>
  );
}
