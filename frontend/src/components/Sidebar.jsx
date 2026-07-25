import { Link, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const ITEMS_ESTUDIANTE = [
  { to: "/", label: "🏠 Inicio", match: "/" },
  { to: "/estudiante", label: "👤 Mi Perfil", match: "/estudiante" },
  { to: "/vacantes", label: "💼 Vacantes", match: "/vacantes" },
  { to: "/estudiante#postulaciones", label: "🚀 Postulaciones", match: "#postulaciones" },
  { to: "/entrevistas", label: "🗓️ Entrevistas", match: "/entrevistas" },
  { to: "/examenes", label: "🧠 Evaluación IA", match: "/examenes" },
];

export default function Sidebar() {
  const { rol } = useAuth();
  const location = useLocation();

  if (rol !== "estudiante") return null;

  const actual = location.pathname + location.hash;

  return (
    <aside className="sidebar">
      {ITEMS_ESTUDIANTE.map((item) => (
        <Link
          key={item.label}
          to={item.to}
          className={"side-item" + (actual === item.match || (item.match !== "#postulaciones" && location.pathname === item.match && !location.hash) ? " active" : "")}
        >
          {item.label}
        </Link>
      ))}
    </aside>
  );
}
