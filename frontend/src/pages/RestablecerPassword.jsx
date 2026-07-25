import { useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import api from "../api/client";

export default function RestablecerPassword() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token") || "";
  const [nuevaPassword, setNuevaPassword] = useState("");
  const [confirmacion, setConfirmacion] = useState("");
  const [mensaje, setMensaje] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  async function enviar(e) {
    e.preventDefault();
    setError(""); setMensaje("");
    if (nuevaPassword !== confirmacion) {
      setError("Las contraseñas no coinciden");
      return;
    }
    try {
      const { data } = await api.post("/auth/restablecer-password", { token, nuevaPassword });
      setMensaje(data.mensaje + " Ya puedes iniciar sesión.");
      setTimeout(() => navigate("/login"), 2000);
    } catch (err) {
      setError(err.response?.data?.error || "No se pudo restablecer la contraseña");
    }
  }

  if (!token) {
    return (
      <div className="container-narrow">
        <div className="card">
          <div className="alert alert-error">Enlace inválido: falta el token de recuperación.</div>
          <Link to="/recuperar-password">Solicitar un nuevo enlace</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container-narrow">
      <div className="card">
        <h2>Restablecer contraseña</h2>
        {error && <div className="alert alert-error">{error}</div>}
        {mensaje && <div className="alert alert-success">{mensaje}</div>}
        <form onSubmit={enviar}>
          <div className="form-field">
            <label>Nueva contraseña</label>
            <input type="password" value={nuevaPassword} onChange={(e) => setNuevaPassword(e.target.value)} required />
          </div>
          <div className="form-field">
            <label>Confirma la contraseña</label>
            <input type="password" value={confirmacion} onChange={(e) => setConfirmacion(e.target.value)} required />
          </div>
          <button className="btn btn-primary btn-block" type="submit">Restablecer contraseña</button>
        </form>
      </div>
    </div>
  );
}
