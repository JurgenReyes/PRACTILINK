import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/client";

export default function Registro() {
  const [rol, setRol] = useState("estudiante");
  const [form, setForm] = useState({ correo: "", password: "" });
  const [mensaje, setMensaje] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  function actualizar(campo, valor) {
    setForm((f) => ({ ...f, [campo]: valor }));
  }

  async function manejarSubmit(e) {
    e.preventDefault();
    setError(""); setMensaje("");
    try {
      const { data } = await api.post("/auth/registro", { ...form, rol });
      setMensaje(data.mensaje);
      setTimeout(() => navigate("/login"), 2500);
    } catch (err) {
      setError(err.response?.data?.error || "No se pudo completar el registro");
    }
  }

  return (
    <div className="container-narrow">
      <div className="card">
        <h2>Crear cuenta</h2>

        <div className="form-field">
          <label>Tipo de cuenta</label>
          <select value={rol} onChange={(e) => setRol(e.target.value)}>
            <option value="estudiante">Estudiante</option>
            <option value="empresa">Empresa</option>
          </select>
        </div>

        {error && <div className="alert alert-error">{error}</div>}
        {mensaje && <div className="alert alert-success">{mensaje}</div>}

        <form onSubmit={manejarSubmit}>
          {rol === "estudiante" ? (
            <>
              <div className="form-field">
                <label>Nombre completo</label>
                <input required onChange={(e) => actualizar("nombre_completo", e.target.value)} />
              </div>
              <div className="form-field">
                <label>Universidad</label>
                <input onChange={(e) => actualizar("universidad", e.target.value)} />
              </div>
              <div className="form-field">
                <label>Carrera</label>
                <input onChange={(e) => actualizar("carrera", e.target.value)} />
              </div>
              <div className="form-field">
                <label>Semestre actual</label>
                <input type="number" onChange={(e) => actualizar("semestre", e.target.value)} />
              </div>
            </>
          ) : (
            <>
              <div className="form-field">
                <label>Nombre de la empresa</label>
                <input required onChange={(e) => actualizar("nombre_empresa", e.target.value)} />
              </div>
              <div className="form-field">
                <label>RFC</label>
                <input required maxLength={13} onChange={(e) => actualizar("rfc", e.target.value)} />
              </div>
              <div className="form-field">
                <label>Giro empresarial</label>
                <input onChange={(e) => actualizar("giro", e.target.value)} />
              </div>
              <div className="form-field">
                <label>Responsable de reclutamiento</label>
                <input onChange={(e) => actualizar("responsable", e.target.value)} />
              </div>
              <div className="form-field">
                <label>Teléfono de contacto</label>
                <input onChange={(e) => actualizar("telefono", e.target.value)} />
              </div>
            </>
          )}

          <div className="form-field">
            <label>Correo {rol === "estudiante" ? "institucional" : "corporativo"}</label>
            <input type="email" required onChange={(e) => actualizar("correo", e.target.value)} />
          </div>
          <div className="form-field">
            <label>Contraseña (mín. 8 caracteres, mayúscula, número y carácter especial)</label>
            <input type="password" required onChange={(e) => actualizar("password", e.target.value)} />
          </div>

          <button className="btn btn-primary btn-block" type="submit">Registrarme</button>
        </form>
      </div>
    </div>
  );
}
