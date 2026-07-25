import { useEffect, useRef, useState } from "react";
import api from "../api/client";
import { usePolling } from "../hooks/usePolling";

export default function Chat({ idPostulacion, miIdUsuario }) {
  const [mensajes, setMensajes] = useState([]);
  const [texto, setTexto] = useState("");
  const [error, setError] = useState("");
  const finRef = useRef(null);

  async function cargar() {
    try {
      const { data } = await api.get(`/mensajes/${idPostulacion}`);
      setMensajes(data);
    } catch (err) {
      setError(err.response?.data?.error || "No se pudo cargar la conversación");
    }
  }

  usePolling(cargar, 8000, [idPostulacion]);

  useEffect(() => {
    finRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [mensajes.length]);

  async function enviar(e) {
    e.preventDefault();
    if (!texto.trim()) return;
    try {
      await api.post(`/mensajes/${idPostulacion}`, { contenido: texto });
      setTexto("");
      cargar();
    } catch (err) {
      setError(err.response?.data?.error || "No se pudo enviar el mensaje");
    }
  }

  return (
    <div className="card" style={{ display: "flex", flexDirection: "column", height: 360 }}>
      {error && <div className="alert alert-error">{error}</div>}
      <div style={{ flex: 1, overflowY: "auto", display: "flex", flexDirection: "column", gap: 8, marginBottom: 10 }}>
        {mensajes.length === 0 ? (
          <p style={{ fontSize: 13, color: "var(--color-ink-soft)" }}>Aún no hay mensajes. Escribe el primero.</p>
        ) : (
          mensajes.map((m) => {
            const esMio = m.id_usuario_emisor === miIdUsuario;
            return (
              <div key={m.id_mensaje} style={{
                alignSelf: esMio ? "flex-end" : "flex-start",
                background: esMio ? "var(--color-primary)" : "var(--color-bg)",
                color: esMio ? "white" : "var(--color-ink)",
                padding: "8px 12px", borderRadius: 12, maxWidth: "75%", fontSize: 14,
              }}>
                {m.contenido}
                <div style={{ fontSize: 10, opacity: 0.7, marginTop: 2 }}>{new Date(m.fecha_creacion).toLocaleTimeString()}</div>
              </div>
            );
          })
        )}
        <div ref={finRef} />
      </div>
      <form onSubmit={enviar} style={{ display: "flex", gap: 8 }}>
        <input style={{ flex: 1, padding: "8px 12px", border: "1px solid var(--color-border)", borderRadius: 8 }}
          value={texto} onChange={(e) => setTexto(e.target.value)} placeholder="Escribe un mensaje…" />
        <button className="btn btn-primary" type="submit">Enviar</button>
      </form>
    </div>
  );
}
