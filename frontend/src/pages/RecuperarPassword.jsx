import { useState } from "react";
import { Link } from "react-router-dom";
import api from "../api/client";

export default function RecuperarPassword() {
  const [correo, setCorreo] = useState("");
  const [mensaje, setMensaje] = useState("");
  const [error, setError] = useState("");
  const [enviando, setEnviando] = useState(false);

  async function enviar(e) {
    e.preventDefault();
    setError(""); setMensaje(""); setEnviando(true);
    try {
      const { data } = await api.post("/auth/recuperar-password", { correo });
      setMensaje(data.mensaje);
    } catch (err) {
      setError(err.response?.data?.error || "No se pudo procesar la solicitud");
    } finally {
      setEnviando(false);
    }
  }

  return (
    <div className="container-narrow">
      <div className="card">
        <h2>Recuperar contraseña</h2>
        <p style={{ fontSize: 13, color: "var(--color-ink-soft)" }}>
          Escribe tu correo y te enviaremos un enlace para restablecer tu contraseña.
        </p>
        {error && <div className="alert alert-error">{error}</div>}
        {mensaje && <div className="alert alert-success">{mensaje}</div>}
        <form onSubmit={enviar}>
          <div className="form-field">
            <label>Correo</label>
            <input type="email" value={correo} onChange={(e) => setCorreo(e.target.value)} required />
          </div>
          <button className="btn btn-primary btn-block" type="submit" disabled={enviando}>
            {enviando ? "Enviando…" : "Enviar enlace"}
          </button>
        </form>
        <p style={{ marginTop: 16, fontSize: 13 }}>
          <Link to="/login">Volver a iniciar sesión</Link>
        </p>
      </div>
    </div>
  );
}
