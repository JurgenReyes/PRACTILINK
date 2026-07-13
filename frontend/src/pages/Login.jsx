import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Login() {
  const [correo, setCorreo] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const { login } = useAuth();
  const navigate = useNavigate();

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
    <div className="container-narrow">
      <div className="card">
        <h2>Iniciar sesión</h2>
        {error && <div className="alert alert-error">{error}</div>}
        <form onSubmit={manejarSubmit}>
          <div className="form-field">
            <label>Correo institucional o corporativo</label>
            <input type="email" value={correo} onChange={(e) => setCorreo(e.target.value)} required />
          </div>
          <div className="form-field">
            <label>Contraseña</label>
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
          </div>
          <button className="btn btn-primary btn-block" type="submit">Entrar</button>
        </form>
        <p style={{ marginTop: 16, fontSize: 13 }}>
          ¿No tienes cuenta? <Link to="/registro">Regístrate aquí</Link>
        </p>
      </div>
    </div>
  );
}
