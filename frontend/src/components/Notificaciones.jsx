import { useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import api from "../api/client";
import { usePolling } from "../hooks/usePolling";
import { cargarNotificaciones, marcarTodasLeidas, seleccionarNoLeidas } from "../store/notificacionesSlice";

export default function Notificaciones() {
  const [abierto, setAbierto] = useState(false);
  const ref = useRef(null);
  const dispatch = useDispatch();
  const items = useSelector((state) => state.notificaciones.items);
  const noLeidas = useSelector(seleccionarNoLeidas);

  usePolling(() => dispatch(cargarNotificaciones()), 20000, []);

  useEffect(() => {
    function fuera(e) { if (ref.current && !ref.current.contains(e.target)) setAbierto(false); }
    document.addEventListener("click", fuera);
    return () => document.removeEventListener("click", fuera);
  }, []);

  return (
    <div ref={ref} style={{ position: "relative" }}>
      <button onClick={() => setAbierto((a) => !a)} style={{ position: "relative", fontSize: 18, background: "none", border: "none", cursor: "pointer" }}>
        🔔
        {noLeidas > 0 && (
          <span style={{ position: "absolute", top: -4, right: -6, background: "var(--color-accent)", color: "white", borderRadius: 999, fontSize: 10, padding: "1px 5px" }}>
            {noLeidas}
          </span>
        )}
      </button>
      {abierto && (
        <div className="card" style={{ position: "absolute", right: 0, top: 30, width: 320, maxHeight: 380, overflowY: "auto", zIndex: 20, padding: 12 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
            <strong style={{ fontSize: 14 }}>Notificaciones</strong>
            <button onClick={() => dispatch(marcarTodasLeidas())} style={{ fontSize: 12, background: "none", border: "none", color: "var(--color-primary)", cursor: "pointer" }}>Marcar todas leídas</button>
          </div>
          {items.length === 0 ? (
            <p style={{ fontSize: 13, color: "var(--color-ink-soft)" }}>Sin notificaciones por ahora.</p>
          ) : (
            items.map((n) => (
              <div key={n.id_notificacion} style={{ padding: "8px 0", borderBottom: "1px solid var(--color-border)", fontSize: 13, opacity: n.leido ? 0.6 : 1 }}>
                {n.mensaje}
                <div style={{ fontSize: 11, color: "var(--color-ink-soft)" }}>{new Date(n.fecha_creacion).toLocaleString()}</div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}
