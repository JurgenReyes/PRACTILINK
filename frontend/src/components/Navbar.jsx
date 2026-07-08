import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Navbar() {
  const { rol, logout } = useAuth();
  const navigate = useNavigate();

  function salir() {
    logout();
    navigate("/login");
  }

  return (
    <header className="navbar">
      <Link to="/" className="brand">PractiLink</Link>
      <nav>
        <Link to="/vacantes">Vacantes</Link>
        {rol === "estudiante" && <Link to="/estudiante">Mi perfil</Link>}
        {rol === "empresa" && <Link to="/empresa">Mis vacantes</Link>}
        {rol === "administrador" && <Link to="/admin">Administración</Link>}
        {!rol && <Link to="/login">Iniciar sesión</Link>}
        {!rol && <Link to="/registro" className="btn btn-primary">Crear cuenta</Link>}
        {rol && <button onClick={salir}>Cerrar sesión</button>}
      </nav>
    </header>
  );
}
