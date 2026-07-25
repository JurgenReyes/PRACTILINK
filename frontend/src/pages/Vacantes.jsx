import { useEffect, useState } from "react";
import api from "../api/client";
import { useAuth } from "../context/AuthContext";
import { useApi } from "../hooks/useApi";

export default function Vacantes() {
  const [filtrosAplicados, setFiltrosAplicados] = useState({});
  const [filtros, setFiltros] = useState({ q: "", modalidad: "", ubicacion: "" });
  const [mensaje, setMensaje] = useState("");
  const [favoritos, setFavoritos] = useState([]);
  const { rol } = useAuth();

  const { datos: vacantes, cargando, error: errorCarga } = useApi("/vacantes", filtrosAplicados);

  function buscar() {
    setFiltrosAplicados(Object.fromEntries(Object.entries(filtros).filter(([, v]) => v)));
  }

  async function cargarFavoritos() {
    if (rol !== "estudiante") return;
    try {
      const { data } = await api.get("/favoritos");
      setFavoritos(data.map((f) => f.id_vacante));
    } catch { /* si falla, simplemente no se marcan favoritos existentes */ }
  }

  useEffect(() => { cargarFavoritos(); }, []);

  async function postularse(id_vacante) {
    setMensaje("");
    try {
      await api.post("/postulaciones", { id_vacante });
      setMensaje("Postulación enviada correctamente.");
    } catch (err) {
      setMensaje(err.response?.data?.error || "No se pudo completar la postulación");
    }
  }

  async function alternarFavorito(id_vacante) {
    try {
      if (favoritos.includes(id_vacante)) {
        await api.delete(`/favoritos/${id_vacante}`);
        setFavoritos((f) => f.filter((id) => id !== id_vacante));
      } else {
        await api.post(`/favoritos/${id_vacante}`);
        setFavoritos((f) => [...f, id_vacante]);
      }
    } catch (err) {
      setMensaje(err.response?.data?.error || "No se pudo actualizar tus favoritos");
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
      {errorCarga && <div className="alert alert-error">{errorCarga}</div>}

      {cargando ? (
        <p>Cargando vacantes…</p>
      ) : !vacantes || vacantes.length === 0 ? (
        <div className="empty-state">No se encontraron vacantes con esos filtros.</div>
      ) : (
        <div className="grid grid-3">
          {vacantes.map((v) => (
            <div key={v.id_vacante} className="card vacante-card">
              <h3 style={{ fontSize: 16 }}>{v.titulo}</h3>
              <span className="empresa">🏢 {v.Empresa?.nombre_empresa}</span>
              <div className="tags">
                <span className="tag">{v.modalidad}</span>
                {v.ubicacion && <span className="tag">{v.ubicacion}</span>}
                {v.duracion_meses && <span className="tag">{v.duracion_meses} meses</span>}
              </div>
              {v.apoyo_economico && (
                <div style={{ fontWeight: 700, fontSize: 14 }}>${Number(v.apoyo_economico).toLocaleString()} MXN / mes</div>
              )}
              <p style={{ fontSize: 13, color: "var(--color-ink-soft)" }}>{v.requisitos?.slice(0, 110)}</p>
              {rol === "estudiante" && (
                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                  <button className="btn btn-accent" onClick={() => postularse(v.id_vacante)}>Postularme</button>
                  <button className="btn btn-outline" onClick={() => alternarFavorito(v.id_vacante)}>
                    {favoritos.includes(v.id_vacante) ? "★ Guardada" : "☆ Guardar"}
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
