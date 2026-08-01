import { Link, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const ITEMS_ESTUDIANTE = [
  { to: "/estudiante/inicio", label: "🏠 Inicio" },
  { to: "/estudiante", label: "👤 Mi Perfil" },
  { to: "/vacantes", label: "💼 Vacantes" },
  { to: "/postulaciones", label: "🚀 Postulaciones" },
  { to: "/entrevistas", label: "🗓️ Entrevistas" },
  { to: "/examenes", label: "🧠 Evaluación IA" },
  { to: "/configuracion", label: "⚙️ Configuración" },
];

export default function Sidebar() {
  const { rol } = useAuth();
  const location = useLocation();

  if (rol !== "estudiante") return null;

  return (
    <aside className="sidebar">
      {ITEMS_ESTUDIANTE.map((item) => (
        <Link
          key={item.label}
          to={item.to}
          className={"side-item" + (location.pathname === item.to ? " active" : "")}
        >
          {item.label}
        </Link>
      ))}
    </aside>
  );
}
