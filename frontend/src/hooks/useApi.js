import { useCallback, useEffect, useState } from "react";
import api from "../api/client";

/**
 * Hook para peticiones GET. Centraliza el patrón que antes se repetía en
 * cada página (useState + useEffect + try/catch a mano), así toda la app
 * maneja "cargando" y "error" de la misma forma en vez de dejar la
 * pantalla colgada si la petición falla.
 *
 * @param {string|null} ruta - si es null/"" la petición queda desactivada
 *   (útil cuando depende de un filtro que el usuario aún no eligió).
 * @param {object} [params] - query params, se re-consulta si cambian.
 */
export function useApi(ruta, params) {
  const [datos, setDatos] = useState(null);
  const [cargando, setCargando] = useState(Boolean(ruta));
  const [error, setError] = useState("");
  const paramsKey = JSON.stringify(params || {});

  const recargar = useCallback(async () => {
    if (!ruta) return;
    setCargando(true);
    setError("");
    try {
      const { data } = await api.get(ruta, { params });
      setDatos(data);
    } catch (err) {
      const detalle = err.response?.data?.detalle;
      const base = err.response?.data?.error || "No se pudo cargar la información. Intenta de nuevo.";
      setError(detalle ? `${base} — DETALLE: ${detalle}` : base);
    } finally {
      setCargando(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ruta, paramsKey]);

  useEffect(() => { recargar(); }, [recargar]);

  return { datos, setDatos, cargando, error, recargar };
}
