// Círculo de progreso reutilizable (coincidencia con vacantes, puntaje de
// examen, etc.) — replica el indicador circular azul que aparece en varios
// mockups de PractiLink.
export default function CirculoProgreso({ porcentaje = 0, tamano = 100, grosor = 10, color = "var(--color-primary)" }) {
  const radio = (tamano - grosor) / 2;
  const circunferencia = 2 * Math.PI * radio;
  const valor = Math.max(0, Math.min(100, porcentaje));
  const offset = circunferencia - (valor / 100) * circunferencia;

  return (
    <svg width={tamano} height={tamano} viewBox={`0 0 ${tamano} ${tamano}`}>
      <circle
        cx={tamano / 2} cy={tamano / 2} r={radio}
        fill="none" stroke="var(--color-primary-light)" strokeWidth={grosor}
      />
      <circle
        cx={tamano / 2} cy={tamano / 2} r={radio}
        fill="none" stroke={color} strokeWidth={grosor}
        strokeDasharray={circunferencia}
        strokeDashoffset={offset}
        strokeLinecap="round"
        transform={`rotate(-90 ${tamano / 2} ${tamano / 2})`}
        style={{ transition: "stroke-dashoffset 0.4s ease" }}
      />
      <text
        x="50%" y="50%" textAnchor="middle" dominantBaseline="central"
        fontSize={tamano * 0.22} fontWeight="800" fill="var(--color-ink)"
        fontFamily="var(--font-display)"
      >
        {Math.round(valor)}%
      </text>
    </svg>
  );
}
