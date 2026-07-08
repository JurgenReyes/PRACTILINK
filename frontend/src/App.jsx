import { Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import RutaProtegida from "./components/RutaProtegida";
import Inicio from "./pages/Inicio";
import Login from "./pages/Login";
import Registro from "./pages/Registro";
import Vacantes from "./pages/Vacantes";
import PerfilEstudiante from "./pages/PerfilEstudiante";
import DashboardEmpresa from "./pages/DashboardEmpresa";
import DashboardAdmin from "./pages/DashboardAdmin";

export default function App() {
  return (
    <div className="app-shell">
      <Navbar />
      <Routes>
        <Route path="/" element={<Inicio />} />
        <Route path="/login" element={<Login />} />
        <Route path="/registro" element={<Registro />} />
        <Route path="/vacantes" element={<Vacantes />} />
        <Route
          path="/estudiante"
          element={<RutaProtegida rolesPermitidos={["estudiante"]}><PerfilEstudiante /></RutaProtegida>}
        />
        <Route
          path="/empresa"
          element={<RutaProtegida rolesPermitidos={["empresa"]}><DashboardEmpresa /></RutaProtegida>}
        />
        <Route
          path="/admin"
          element={<RutaProtegida rolesPermitidos={["administrador"]}><DashboardAdmin /></RutaProtegida>}
        />
      </Routes>
    </div>
  );
}
