import { useEffect, useState } from "react";
import api from "../api/client";

export default function DashboardAdmin() {
  const [pendientes, setPendientes] = useState([]);
  const [mensaje, setMensaje] = useState("");

  async function cargar() {
    const { data } = await api.get("/admin/empresas/pendientes");
    setPendientes(data);
  }

  useEffect(() => { cargar(); }, []);

  async function validar(id, aprobar) {
    let motivo = null;
    if (!aprobar) {
      motivo = prompt("Motivo del rechazo (obligatorio):");
      if (!motivo) return;
    }
    await api.put(`/admin/empresas/${id}/validar`, { aprobar, motivo });
    setMensaje(aprobar ? "Empresa aprobada." : "Empresa rechazada.");
    cargar();
  }

  return (
    <div className="container">
      <h2>Panel de administrador</h2>
      {mensaje && <div className="alert alert-success">{mensaje}</div>}

      <h3>Empresas pendientes de validación</h3>
      {pendientes.length === 0 ? (
        <div className="empty-state">No hay empresas pendientes por validar.</div>
      ) : (
        <table>
          <thead><tr><th>Empresa</th><th>RFC</th><th>Giro</th><th>Correo</th><th>Acciones</th></tr></thead>
          <tbody>
            {pendientes.map((e) => (
              <tr key={e.id_empresa}>
                <td>{e.nombre_empresa}</td>
                <td>{e.rfc}</td>
                <td>{e.giro}</td>
                <td>{e.Usuario?.correo}</td>
                <td style={{ display: "flex", gap: 8 }}>
                  <button className="btn btn-primary" onClick={() => validar(e.id_empresa, true)}>Aprobar</button>
                  <button className="btn btn-outline" onClick={() => validar(e.id_empresa, false)}>Rechazar</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      <p style={{ marginTop: 24, fontSize: 13, color: "var(--color-ink-soft)" }}>
        Este panel cubre la validación de empresas (RF-A06/RF-A07). El resto de funciones de
        administrador (gestión de usuarios, moderación de vacantes, parámetros de IA, reportes
        globales) siguen el mismo patrón: nuevas rutas en <code>adminRoutes.js</code> + una
        vista en React que las consuma.
      </p>
    </div>
  );
}
