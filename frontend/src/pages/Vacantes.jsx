import { useEffect, useState } from "react";
import api from "../api/client";
import { useAuth } from "../context/AuthContext";

export default function Vacantes() {
  const [vacantes, setVacantes] = useState([]);
  const [filtros, setFiltros] = useState({ q: "", modalidad: "", ubicacion: "" });
  const [cargando, setCargando] = useState(true);
  const [mensaje, setMensaje] = useState("");
  const { rol } = useAuth();

  async function buscar() {
    setCargando(true);
    const params = Object.fromEntries(Object.entries(filtros).filter(([, v]) => v));
    const { data } = await api.get("/vacantes", { params });
    setVacantes(data);
    setCargando(false);
  }

  useEffect(() => { buscar(); }, []);

  async function postularse(id_vacante) {
    setMensaje("");
    try {
      await api.post("/postulaciones", { id_vacante });
      setMensaje("Postulación enviada correctamente.");
    } catch (err) {
      setMensaje(err.response?.data?.error || "No se pudo completar la postulación");
    }
  }

  return (
    <div className="container">
      <h2>Vacantes disponibles</h2>

      <div className="card" style={{ marginBottom: 24 }}>
        <div className="grid grid-2">
          <div className="form-field">
            <label>Palabra clave</label>
            <input value={filtros.q} onChange={(e) => setFiltros({ ...filtros, q: e.target.value })} placeholder="Ej. desarrollador, marketing..." />
          </div>
          <div className="form-field">
            <label>Modalidad</label>
            <select value={filtros.modalidad} onChange={(e) => setFiltros({ ...filtros, modalidad: e.target.value })}>
              <option value="">Todas</option>
              <option value="presencial">Presencial</option>
              <option value="remoto">Remoto</option>
              <option value="hibrido">Híbrido</option>
            </select>
          </div>
          <div className="form-field">
            <label>Ubicación</label>
            <input value={filtros.ubicacion} onChange={(e) => setFiltros({ ...filtros, ubicacion: e.target.value })} />
          </div>
        </div>
        <button className="btn btn-primary" onClick={buscar}>Buscar</button>
      </div>

      {mensaje && <div className="alert alert-success">{mensaje}</div>}

      {cargando ? (
        <p>Cargando vacantes…</p>
      ) : vacantes.length === 0 ? (
        <div className="empty-state">No se encontraron vacantes con esos filtros.</div>
      ) : (
        <div className="grid grid-2">
          {vacantes.map((v) => (
            <div key={v.id_vacante} className="card vacante-card">
              <h3 style={{ fontSize: 18 }}>{v.titulo}</h3>
              <span className="empresa">{v.Empresa?.nombre_empresa}</span>
              <div className="tags">
                <span className="tag">{v.modalidad}</span>
                {v.ubicacion && <span className="tag">{v.ubicacion}</span>}
                {v.duracion_meses && <span className="tag">{v.duracion_meses} meses</span>}
              </div>
              <p style={{ fontSize: 14, color: "var(--color-ink-soft)" }}>{v.requisitos?.slice(0, 140)}</p>
              {rol === "estudiante" && (
                <button className="btn btn-outline" onClick={() => postularse(v.id_vacante)}>Postularme</button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
