import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import Notificaciones from "./Notificaciones";

export default function Navbar() {
  const { rol, logout } = useAuth();
  const navigate = useNavigate();

  function salir() {
    logout();
    navigate("/login");
  }

  return (
    <header className="navbar">
      <Link to="/" className="brand">
        <img src="/logo1.png" alt="PractiLink" style={{ height: 34, width: "auto" }} />
      </Link>
      <nav>
        <Link to="/vacantes">Vacantes</Link>
        {rol === "estudiante" && <Link to="/estudiante">Mi perfil</Link>}
        {rol === "estudiante" && <Link to="/examenes">Exámenes</Link>}
        {rol === "empresa" && <Link to="/empresa/perfil">Mi empresa</Link>}
        {rol === "administrador" && <Link to="/admin">Administración</Link>}
        {rol && <Notificaciones />}
        {!rol && <Link to="/login">Iniciar sesión</Link>}
        {!rol && <Link to="/registro" className="btn btn-primary">Crear cuenta</Link>}
        {rol && <button onClick={salir}>Cerrar sesión</button>}
      </nav>
    </header>
  );
}
