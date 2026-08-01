import { useMemo, useState } from "react";
import api from "../api/client";
import { useApi } from "../hooks/useApi";

const MESES = [
  "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
  "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre",
];
const DIAS_SEMANA = ["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom"];

// Iconitos mínimos en SVG (sin dependencias nuevas) para las filas de detalle.
const IconoReloj = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 3" />
  </svg>
);
const IconoVideo = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="2" y="6" width="14" height="12" rx="2" /><path d="M16 10l6-3v10l-6-3" />
  </svg>
);
const IconoMapa = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 21s7-6.5 7-12a7 7 0 1 0-14 0c0 5.5 7 12 7 12z" /><circle cx="12" cy="9" r="2.5" />
  </svg>
);
const IconoNota = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M4 4h16v16H4z" /><path d="M8 9h8M8 13h5" />
  </svg>
);
const IconoCheck = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="9" /><path d="M8.5 12.5l2.5 2.5 4.5-5" />
  </svg>
);

function claveDia(fecha) {
  return fecha.toISOString().slice(0, 10);
}

// Arma la cuadrícula del mes (empezando en lunes), rellenando con null los
// huecos antes del día 1 y después del último día para que las columnas
// de la semana siempre cuadren.
function armarCuadricula(anio, mes) {
  const primerDia = new Date(anio, mes, 1);
  const ultimoDia = new Date(anio, mes + 1, 0);
  const offset = (primerDia.getDay() + 6) % 7; // 0=lunes..6=domingo

  const celdas = [];
  for (let i = 0; i < offset; i++) celdas.push(null);
  for (let d = 1; d <= ultimoDia.getDate(); d++) celdas.push(new Date(anio, mes, d));
  while (celdas.length % 7 !== 0) celdas.push(null);
  return celdas;
}

function iniciales(nombre) {
  return (nombre || "?").split(" ").slice(0, 2).map((s) => s[0]).join("").toUpperCase();
}

export default function Entrevistas() {
  const { datos: postulaciones, cargando, error, recargar } = useApi("/postulaciones/mias");
  const hoy = new Date();
  const [mesActual, setMesActual] = useState(hoy.getMonth());
  const [anioActual, setAnioActual] = useState(hoy.getFullYear());
  const [diaSeleccionado, setDiaSeleccionado] = useState(null);
  const [accionando, setAccionando] = useState(false);
  const [mensaje, setMensaje] = useState("");

  const entrevistas = useMemo(
    () => (postulaciones || []).filter((p) => p.fecha_entrevista),
    [postulaciones]
  );

  const entrevistasPorDia = useMemo(() => {
    const mapa = {};
    for (const e of entrevistas) {
      const clave = claveDia(new Date(e.fecha_entrevista));
      if (!mapa[clave]) mapa[clave] = [];
      mapa[clave].push(e);
    }
    return mapa;
  }, [entrevistas]);

  const proximaEntrevista = useMemo(() => {
    const futuras = entrevistas
      .filter((e) => new Date(e.fecha_entrevista) >= new Date(hoy.toDateString()))
      .sort((a, b) => new Date(a.fecha_entrevista) - new Date(b.fecha_entrevista));
    return futuras[0] || null;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [entrevistas]);

  const celdas = armarCuadricula(anioActual, mesActual);
  const claveHoy = claveDia(hoy);
  const entrevistasDelDiaSeleccionado = diaSeleccionado ? entrevistasPorDia[diaSeleccionado] || [] : [];

  function irMesAnterior() {
    setDiaSeleccionado(null);
    if (mesActual === 0) { setMesActual(11); setAnioActual((a) => a - 1); }
    else setMesActual((m) => m - 1);
  }
  function irMesSiguiente() {
    setDiaSeleccionado(null);
    if (mesActual === 11) { setMesActual(0); setAnioActual((a) => a + 1); }
    else setMesActual((m) => m + 1);
  }
  function irHoy() {
    setMesActual(hoy.getMonth()); setAnioActual(hoy.getFullYear()); setDiaSeleccionado(claveHoy);
  }

  async function responderEntrevista(idPostulacion, accion) {
    setAccionando(true); setMensaje("");
    try {
      await api.put(`/postulaciones/${idPostulacion}/entrevista`, { accion });
      setMensaje(accion === "confirmar" ? "Entrevista confirmada." : "Se solicitó reprogramar la entrevista.");
      recargar();
    } catch (err) {
      setMensaje(err.response?.data?.error || "No se pudo actualizar la entrevista.");
    } finally {
      setAccionando(false);
    }
  }

  function tarjetaEntrevista(e) {
    const fecha = new Date(e.fecha_entrevista);
    const confirmada = e.entrevista_confirmada;
    return (
      <div
        key={e.id_postulacion}
        className={`card interview-spotlight${confirmada ? " is-confirmed" : ""}`}
        style={{ display: "flex", gap: 16 }}
      >
        <div className="interview-avatar">{iniciales(e.Vacante?.Empresa?.nombre_empresa)}</div>

        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 8, flexWrap: "wrap" }}>
            <div>
              <h4 style={{ margin: "0 0 2px", fontSize: 15.5 }}>{e.Vacante?.Empresa?.nombre_empresa}</h4>
              <div style={{ fontSize: 13, color: "var(--color-ink-soft)" }}>{e.Vacante?.titulo}</div>
            </div>
            <span className={`badge ${confirmada ? "badge-aceptado" : "badge-pendiente"}`}>
              {confirmada ? "Confirmada" : "Por confirmar"}
            </span>
          </div>

          <div style={{ marginTop: 10 }}>
            <div className="interview-row"><span className="ico"><IconoReloj /></span>
              {fecha.toLocaleDateString("es-MX", { weekday: "long", day: "numeric", month: "long" })} · {fecha.toLocaleTimeString("es-MX", { hour: "2-digit", minute: "2-digit" })}
            </div>
            <div className="interview-row">
              <span className="ico">{e.modalidad_entrevista === "videollamada" ? <IconoVideo /> : <IconoMapa />}</span>
              {e.modalidad_entrevista === "videollamada" ? "Videollamada" : "Presencial"}
            </div>
            {e.notas_entrevista && (
              <div className="interview-row" style={{ alignItems: "flex-start" }}>
                <span className="ico"><IconoNota /></span>
                <span style={{ color: "var(--color-ink-soft)" }}>{e.notas_entrevista}</span>
              </div>
            )}
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap", marginTop: 14 }}>
            {e.modalidad_entrevista === "videollamada" && (
              e.enlace_videollamada ? (
                <a className="btn btn-primary" href={e.enlace_videollamada} target="_blank" rel="noreferrer">Unirse a videollamada</a>
              ) : (
                <button className="btn btn-primary" disabled title="La empresa aún no comparte el enlace de la videollamada">Unirse a videollamada</button>
              )
            )}
            {!confirmada && (
              <button className="btn btn-accent" disabled={accionando} onClick={() => responderEntrevista(e.id_postulacion, "confirmar")}>
                <span style={{ display: "inline-flex", alignItems: "center", gap: 6 }}><IconoCheck /> Confirmar</span>
              </button>
            )}
            <button className="btn btn-outline" disabled={accionando} onClick={() => responderEntrevista(e.id_postulacion, "reprogramar")}>
              Solicitar reprogramar
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (cargando) return <div className="container">Cargando entrevistas…</div>;
  if (error) return <div className="container"><div className="alert alert-error">{error}</div></div>;

  return (
    <div className="container">
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", flexWrap: "wrap", gap: 8 }}>
        <h2 style={{ margin: 0 }}>Entrevistas</h2>
        <span style={{ fontSize: 13, color: "var(--color-ink-soft)" }}>
          {entrevistas.length === 0 ? "Sin entrevistas registradas" : `${entrevistas.length} en total`}
        </span>
      </div>

      {mensaje && <div className="alert alert-success" style={{ marginTop: 12 }}>{mensaje}</div>}

      <div className="card" style={{ marginTop: 16 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 18 }}>
          <button className="cal-nav-btn" onClick={irMesAnterior} aria-label="Mes anterior">‹</button>
          <div style={{ textAlign: "center" }}>
            <div className="cal-title">{MESES[mesActual]} {anioActual}</div>
            <button
              onClick={irHoy}
              style={{ border: "none", background: "none", cursor: "pointer", color: "var(--color-primary)", fontSize: 12, fontWeight: 600, padding: "2px 0" }}
            >
              Ir a hoy
            </button>
          </div>
          <button className="cal-nav-btn" onClick={irMesSiguiente} aria-label="Mes siguiente">›</button>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: 6 }}>
          {DIAS_SEMANA.map((d) => <div key={d} className="cal-weekday">{d}</div>)}

          {celdas.map((fecha, i) => {
            if (!fecha) return <div key={`vacio-${i}`} />;
            const clave = claveDia(fecha);
            const eventosDia = entrevistasPorDia[clave];
            const tieneEntrevista = Boolean(eventosDia);
            const todasConfirmadas = tieneEntrevista && eventosDia.every((e) => e.entrevista_confirmada);
            const esHoy = clave === claveHoy;
            const seleccionado = clave === diaSeleccionado;

            return (
              <button
                key={clave}
                onClick={() => setDiaSeleccionado(tieneEntrevista ? clave : null)}
                className={
                  "cal-day" +
                  (tieneEntrevista ? " has-event" : "") +
                  (esHoy ? " is-today" : "") +
                  (seleccionado ? " is-selected" : "")
                }
              >
                {fecha.getDate()}
                {tieneEntrevista && (
                  <span className={"cal-dot" + (todasConfirmadas ? " is-confirmed" : "")} />
                )}
              </button>
            );
          })}
        </div>
      </div>

      <div style={{ marginTop: 22 }}>
        {diaSeleccionado && entrevistasDelDiaSeleccionado.length > 0 ? (
          <>
            <h3 style={{ fontSize: 14.5, textTransform: "uppercase", letterSpacing: ".04em", color: "var(--color-ink-soft)", marginBottom: 12 }}>
              {new Date(diaSeleccionado + "T00:00:00").toLocaleDateString("es-MX", { weekday: "long", day: "numeric", month: "long" })}
            </h3>
            <div className="grid" style={{ gap: 14 }}>
              {entrevistasDelDiaSeleccionado.map((e) => tarjetaEntrevista(e))}
            </div>
          </>
        ) : proximaEntrevista ? (
          <>
            <h3 style={{ fontSize: 14.5, textTransform: "uppercase", letterSpacing: ".04em", color: "var(--color-ink-soft)", marginBottom: 12 }}>
              Próxima entrevista
            </h3>
            {tarjetaEntrevista(proximaEntrevista)}
          </>
        ) : (
          <div className="interview-empty">
            <div style={{ fontSize: 28, marginBottom: 8 }}>🗓️</div>
            No tienes entrevistas programadas por el momento.
          </div>
        )}
      </div>
    </div>
  );
}
