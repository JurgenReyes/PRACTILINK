import { useState } from "react";
import api from "../api/client";

// Los endpoints de exportación (CSV/PDF) requieren el token de sesión, así
// que no pueden ser un simple <a href>: se piden con el cliente autenticado
// de siempre (que sí manda el Authorization: Bearer) y se descargan como blob.
async function descargarArchivo(ruta, nombreArchivo) {
  const { data } = await api.get(ruta, { responseType: "blob" });
  const url = window.URL.createObjectURL(data);
  const a = document.createElement("a");
  a.href = url;
  a.download = nombreArchivo;
  document.body.appendChild(a);
  a.click();
  a.remove();
  window.URL.revokeObjectURL(url);
}

export default function BotonExportar({ ruta, nombreArchivo, children, primario, disabled, title }) {
  const [descargando, setDescargando] = useState(false);

  async function manejarClick() {
    setDescargando(true);
    try {
      await descargarArchivo(ruta, nombreArchivo);
    } catch {
      alert("No se pudo generar el archivo. Intenta de nuevo.");
    } finally {
      setDescargando(false);
    }
  }

  return (
    <button
      className={primario ? "btn btn-primary" : "btn btn-outline"}
      onClick={manejarClick}
      disabled={disabled || descargando}
      title={title}
    >
      {descargando ? "Generando…" : children}
    </button>
  );
}
