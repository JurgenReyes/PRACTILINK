import { useState } from "react";
import { Link } from "react-router-dom";
import api from "../api/client";
import { useAuth } from "../context/AuthContext";

export default function Configuracion() {
  const { rol } = useAuth();
  const rutaVolver = rol === "empresa" ? "/empresa" : rol === "estudiante" ? "/estudiante/inicio" : "/";
  const [form, setForm] = useState({ passwordActual: "", passwordNueva: "", confirmar: "" });
  const [mensaje, setMensaje] = useState("");
  const [error, setError] = useState("");
  const [enviando, setEnviando] = useState(false);

  async function guardar(e) {
    e.preventDefault();
    setError(""); setMensaje("");
    if (form.passwordNueva !== form.confirmar) {
      setError("La confirmación no coincide con la nueva contraseña.");
      return;
    }
    setEnviando(true);
    try {
      await api.put("/auth/cambiar-password", {
        passwordActual: form.passwordActual,
        passwordNueva: form.passwordNueva,
      });
      setMensaje("Contraseña actualizada correctamente.");
      setForm({ passwordActual: "", passwordNueva: "", confirmar: "" });
    } catch (err) {
      setError(err.response?.data?.error || "No se pudo actualizar la contraseña");
    } finally {
      setEnviando(false);
    }
  }

  return (
    <div className="container">
      <p style={{ marginBottom: 12 }}><Link to={rutaVolver}>← Volver</Link></p>
      <h2>Configuración</h2>

      <div className="card" style={{ maxWidth: 480 }}>
        <h4 style={{ marginTop: 0 }}>Cambiar contraseña</h4>
        {mensaje && <div className="alert alert-success">{mensaje}</div>}
        {error && <div className="alert alert-error">{error}</div>}
        <form onSubmit={guardar}>
          <div className="form-field">
            <label>Contraseña actual</label>
            <input type="password" required value={form.passwordActual} onChange={(e) => setForm({ ...form, passwordActual: e.target.value })} />
          </div>
          <div className="form-field">
            <label>Nueva contraseña</label>
            <input type="password" required minLength={8} value={form.passwordNueva} onChange={(e) => setForm({ ...form, passwordNueva: e.target.value })} />
          </div>
          <div className="form-field">
            <label>Confirmar nueva contraseña</label>
            <input type="password" required value={form.confirmar} onChange={(e) => setForm({ ...form, confirmar: e.target.value })} />
          </div>
          <button className="btn btn-primary" type="submit" disabled={enviando}>
            {enviando ? "Guardando…" : "Guardar cambios"}
          </button>
        </form>
      </div>
    </div>
  );
}
