import { useState } from "react";

// Muestra la foto/logo si existe y carga bien; si la URL falla (404, archivo
// borrado, etc.) cae automáticamente a un círculo con iniciales en vez de
// mostrar el ícono de "imagen rota" del navegador.
export default function AvatarFoto({ src, nombre, tamano = 46, radio = "50%", ajuste = "cover", estiloExtra = {} }) {
  const [fallo, setFallo] = useState(false);
  const iniciales = (nombre || "?").split(" ").slice(0, 2).map((s) => s[0]).join("").toUpperCase();

  if (!src || fallo) {
    return (
      <div
        style={{
          width: tamano, height: tamano, borderRadius: radio, background: "var(--color-primary-light)",
          color: "var(--color-primary-dark)", display: "flex", alignItems: "center", justifyContent: "center",
          fontWeight: 800, fontSize: tamano * 0.36, flexShrink: 0, ...estiloExtra,
        }}
      >
        {iniciales}
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={nombre}
      onError={() => setFallo(true)}
      style={{ width: tamano, height: tamano, borderRadius: radio, objectFit: ajuste, objectPosition: "center", display: "block", flexShrink: 0, ...estiloExtra }}
    />
  );
}
