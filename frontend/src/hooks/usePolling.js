import { useEffect, useRef } from "react";

/**
 * Ejecuta `callback` de inmediato y luego cada `intervaloMs` mientras el
 * componente esté montado. Sustituye a WebSockets en este prototipo (chat
 * y notificaciones se refrescan por polling, ver README).
 *
 * @param {() => void} callback
 * @param {number} intervaloMs
 * @param {any[]} deps - se reinicia el intervalo si cambian (ej. el id del chat)
 */
export function usePolling(callback, intervaloMs, deps = []) {
  const callbackRef = useRef(callback);
  callbackRef.current = callback;

  useEffect(() => {
    callbackRef.current();
    const id = setInterval(() => callbackRef.current(), intervaloMs);
    return () => clearInterval(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);
}
