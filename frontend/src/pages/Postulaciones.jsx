import { useState } from "react";
import EstatusBadge from "../components/EstatusBadge";
import Chat from "../components/Chat";
import { useAuth } from "../context/AuthContext";
import { useApi } from "../hooks/useApi";

export default function Postulaciones() {
  const { idUsuario } = useAuth();
  const { datos: postulaciones, cargando, error } = useApi("/postulaciones/mias");
  const [chatAbierto, setChatAbierto] = useState(null);

  return (
    <div className="container">
      <h2>Mis postulaciones</h2>

      {error && <div className="alert alert-error">{error}</div>}
      {cargando ? (
        <p>Cargando postulaciones…</p>
      ) : !postulaciones || postulaciones.length === 0 ? (
        <div className="empty-state">Aún no te has postulado a ninguna vacante.</div>
      ) : (
        <table>
          <thead>
            <tr><th>Vacante</th><th>Empresa</th><th>Matching</th><th>Estatus</th><th>Fecha</th><th></th></tr>
          </thead>
          <tbody>
            {postulaciones.map((p) => (
              <tr key={p.id_postulacion}>
                <td>{p.Vacante?.titulo}</td>
                <td>{p.Vacante?.Empresa?.nombre_empresa}</td>
                <td>{p.matching_score}%</td>
                <td><EstatusBadge estatus={p.estatus} /></td>
                <td>{new Date(p.fecha_postulacion).toLocaleDateString("es-MX")}</td>
                <td>
                  <button className="btn btn-outline" onClick={() => setChatAbierto(chatAbierto === p.id_postulacion ? null : p.id_postulacion)}>
                    {chatAbierto === p.id_postulacion ? "Cerrar chat" : "Chat"}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {chatAbierto && (
        <div style={{ marginTop: 16 }}>
          <Chat idPostulacion={chatAbierto} miIdUsuario={idUsuario} />
        </div>
      )}
    </div>
  );
}
