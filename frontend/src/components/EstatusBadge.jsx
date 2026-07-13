const ETIQUETAS = {
  en_revision: "En revisión",
  evaluacion_pendiente: "Evaluación pendiente",
  entrevista_programada: "Entrevista programada",
  aceptado: "Aceptado",
  rechazado: "Rechazado",
  pendiente: "Pendiente",
  aprobada: "Aprobada",
  rechazada: "Rechazada",
  borrador: "Borrador",
  publicada: "Publicada",
  pausada: "Pausada",
  cerrada: "Cerrada",
};

export default function EstatusBadge({ estatus }) {
  return <span className={`badge badge-${estatus}`}>{ETIQUETAS[estatus] || estatus}</span>;
}
