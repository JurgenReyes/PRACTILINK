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
import VacanteDetalle from "./pages/VacanteDetalle";
import DashboardEstudiante from "./pages/DashboardEstudiante";
import PerfilEstudiante from "./pages/PerfilEstudiante";
import Postulaciones from "./pages/Postulaciones";
import PerfilEmpresa from "./pages/PerfilEmpresa";
import Configuracion from "./pages/Configuracion";
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
            <Route path="/vacantes/:id" element={<VacanteDetalle />} />
            <Route
              path="/estudiante/inicio"
              element={<RutaProtegida rolesPermitidos={["estudiante"]}><DashboardEstudiante /></RutaProtegida>}
            />
            <Route
              path="/estudiante"
              element={<RutaProtegida rolesPermitidos={["estudiante"]}><PerfilEstudiante /></RutaProtegida>}
            />
            <Route
              path="/postulaciones"
              element={<RutaProtegida rolesPermitidos={["estudiante"]}><Postulaciones /></RutaProtegida>}
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
              path="/empresa/perfil"
              element={<RutaProtegida rolesPermitidos={["empresa"]}><PerfilEmpresa /></RutaProtegida>}
            />
            <Route
              path="/configuracion"
              element={<RutaProtegida rolesPermitidos={["estudiante", "empresa"]}><Configuracion /></RutaProtegida>}
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
