import { useState } from "react";
import { useNavigate, useSearchParams, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Login() {
  const [correo, setCorreo] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const { login } = useAuth();
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const sesionExpirada = params.get("expirada") === "1";

  async function manejarSubmit(e) {
    e.preventDefault();
    setError("");
    try {
      const rol = await login(correo, password);
      if (rol === "estudiante") navigate("/estudiante");
      else if (rol === "empresa") navigate("/empresa");
      else navigate("/admin");
    } catch (err) {
      setError(err.response?.data?.error || "No se pudo iniciar sesión");
    }
  }

  return (
    <div className="auth-wrap">
      <div className="card auth-box">
        <div className="auth-brand">
          <img src="/logo2.png" alt="PractiLink" style={{ height: 90, width: "auto" }} />
        </div>
        {sesionExpirada && !error && (
          <div className="alert alert-error">Tu sesión expiró. Inicia sesión de nuevo para continuar.</div>
        )}
        {error && <div className="alert alert-error">{error}</div>}
        <form onSubmit={manejarSubmit}>
          <div className="form-field">
            <label>Correo electrónico</label>
            <input type="email" value={correo} onChange={(e) => setCorreo(e.target.value)} required />
          </div>
          <div className="form-field">
            <label>Contraseña</label>
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
          </div>
          <p style={{ textAlign: "right", marginTop: -8 }}>
            <Link to="/recuperar-password" style={{ fontSize: 12.5 }}>¿Olvidaste tu contraseña?</Link>
          </p>
          <button className="btn btn-primary btn-block" type="submit">Iniciar sesión</button>
        </form>
        <Link to="/registro" className="btn btn-accent btn-block" style={{ marginTop: 10 }}>Regístrate</Link>
      </div>
    </div>
  );
}
