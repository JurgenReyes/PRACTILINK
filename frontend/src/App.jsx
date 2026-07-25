import { Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import Sidebar from "./components/Sidebar";
import Footer from "./components/Footer";
import RutaProtegida from "./components/RutaProtegida";
import Inicio from "./pages/Inicio";
import Login from "./pages/Login";
import Registro from "./pages/Registro";
import RecuperarPassword from "./pages/RecuperarPassword";
import RestablecerPassword from "./pages/RestablecerPassword";
import VerificarCorreo from "./pages/VerificarCorreo";
import Vacantes from "./pages/Vacantes";
import PerfilEstudiante from "./pages/PerfilEstudiante";
import Examenes from "./pages/Examenes";
import Entrevistas from "./pages/Entrevistas";
import DashboardEmpresa from "./pages/DashboardEmpresa";
import DashboardAdmin from "./pages/DashboardAdmin";

export default function App() {
  return (
    <div className="app-shell">
      <Navbar />
      <div className="body-wrap">
        <Sidebar />
        <div className="with-sidebar-content">
          <Routes>
            <Route path="/" element={<Inicio />} />
            <Route path="/login" element={<Login />} />
            <Route path="/registro" element={<Registro />} />
            <Route path="/recuperar-password" element={<RecuperarPassword />} />
            <Route path="/restablecer" element={<RestablecerPassword />} />
            <Route path="/verificar" element={<VerificarCorreo />} />
            <Route path="/vacantes" element={<Vacantes />} />
            <Route
              path="/estudiante"
              element={<RutaProtegida rolesPermitidos={["estudiante"]}><PerfilEstudiante /></RutaProtegida>}
            />
            <Route
              path="/examenes"
              element={<RutaProtegida rolesPermitidos={["estudiante"]}><Examenes /></RutaProtegida>}
            />
            <Route
              path="/entrevistas"
              element={<RutaProtegida rolesPermitidos={["estudiante"]}><Entrevistas /></RutaProtegida>}
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
      </div>
      <Footer />
    </div>
  );
}
