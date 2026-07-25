import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import api from "../api/client";

export default function VerificarCorreo() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token") || "";
  const [estado, setEstado] = useState("verificando"); // verificando | ok | error
  const [mensaje, setMensaje] = useState("");

  useEffect(() => {
    if (!token) { setEstado("error"); setMensaje("Enlace inválido: falta el token de verificación."); return; }
    api.post("/auth/verificar-correo", { token })
      .then(({ data }) => { setEstado("ok"); setMensaje(data.mensaje); })
      .catch((err) => { setEstado("error"); setMensaje(err.response?.data?.error || "No se pudo verificar el correo"); });
  }, [token]);

  return (
    <div className="container-narrow">
      <div className="card" style={{ textAlign: "center" }}>
        <h2>Verificación de correo</h2>
        {estado === "verificando" && <p>Verificando tu cuenta…</p>}
        {estado === "ok" && <div className="alert alert-success">{mensaje}</div>}
        {estado === "error" && <div className="alert alert-error">{mensaje}</div>}
        <Link to="/login" className="btn btn-primary" style={{ marginTop: 12 }}>Ir a iniciar sesión</Link>
      </div>
    </div>
  );
}
