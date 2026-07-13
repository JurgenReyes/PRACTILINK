import { useEffect, useState } from "react";
import api from "../api/client";
import EstatusBadge from "../components/EstatusBadge";

const VACIA = { titulo: "", area: "", modalidad: "remoto", ubicacion: "", carrera_solicitada: "", requisitos: "", duracion_meses: "", apoyo_economico: "" };

export default function DashboardEmpresa() {
  const [vacantes, setVacantes] = useState([]);
  const [form, setForm] = useState(VACIA);
  const [mensaje, setMensaje] = useState("");
  const [error, setError] = useState("");

  async function cargar() {
    // Nota: en el prototipo /api/vacantes solo lista publicadas; para un panel de
    // empresa completo se añadiría un endpoint /api/vacantes/mias con todos los estatus.
    const { data } = await api.get("/vacantes");
    setVacantes(data);
  }

  useEffect(() => { cargar(); }, []);

  async function crearVacante(e, estatus) {
    e.preventDefault();
    setError(""); setMensaje("");
    try {
      await api.post("/vacantes", { ...form, estatus });
      setMensaje(estatus === "publicada" ? "Vacante publicada." : "Vacante guardada como borrador.");
      setForm(VACIA);
      cargar();
    } catch (err) {
      setError(err.response?.data?.error || "No se pudo crear la vacante");
    }
  }

  return (
    <div className="container">
      <h2>Panel de empresa</h2>

      {error && <div className="alert alert-error">{error}</div>}
      {mensaje && <div className="alert alert-success">{mensaje}</div>}

      <div className="card" style={{ marginBottom: 32 }}>
        <h3 style={{ fontSize: 16 }}>Publicar nueva vacante</h3>
        <form>
          <div className="grid grid-2">
            <div className="form-field">
              <label>Título del puesto</label>
              <input value={form.titulo} onChange={(e) => setForm({ ...form, titulo: e.target.value })} required />
            </div>
            <div className="form-field">
              <label>Área</label>
              <input value={form.area} onChange={(e) => setForm({ ...form, area: e.target.value })} />
            </div>
            <div className="form-field">
              <label>Modalidad</label>
              <select value={form.modalidad} onChange={(e) => setForm({ ...form, modalidad: e.target.value })}>
                <option value="remoto">Remoto</option>
                <option value="presencial">Presencial</option>
                <option value="hibrido">Híbrido</option>
              </select>
            </div>
            <div className="form-field">
              <label>Ubicación</label>
              <input value={form.ubicacion} onChange={(e) => setForm({ ...form, ubicacion: e.target.value })} />
            </div>
            <div className="form-field">
              <label>Carrera solicitada</label>
              <input value={form.carrera_solicitada} onChange={(e) => setForm({ ...form, carrera_solicitada: e.target.value })} />
            </div>
            <div className="form-field">
              <label>Duración (meses)</label>
              <input type="number" value={form.duracion_meses} onChange={(e) => setForm({ ...form, duracion_meses: e.target.value })} />
            </div>
            <div className="form-field">
              <label>Apoyo económico (MXN, opcional)</label>
              <input type="number" value={form.apoyo_economico} onChange={(e) => setForm({ ...form, apoyo_economico: e.target.value })} />
            </div>
          </div>
          <div className="form-field">
            <label>Requisitos y descripción</label>
            <textarea rows={4} value={form.requisitos} onChange={(e) => setForm({ ...form, requisitos: e.target.value })} />
          </div>
          <div style={{ display: "flex", gap: 10 }}>
            <button className="btn btn-outline" onClick={(e) => crearVacante(e, "borrador")}>Guardar borrador</button>
            <button className="btn btn-primary" onClick={(e) => crearVacante(e, "publicada")}>Publicar vacante</button>
          </div>
        </form>
      </div>

      <h3>Vacantes publicadas</h3>
      {vacantes.length === 0 ? (
        <div className="empty-state">Aún no tienes vacantes publicadas.</div>
      ) : (
        <table>
          <thead><tr><th>Título</th><th>Modalidad</th><th>Ubicación</th><th>Estatus</th></tr></thead>
          <tbody>
            {vacantes.map((v) => (
              <tr key={v.id_vacante}>
                <td>{v.titulo}</td><td>{v.modalidad}</td><td>{v.ubicacion}</td>
                <td><EstatusBadge estatus={v.estatus} /></td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
