# Cambios de diseño aplicados (para que se vea igual a los mockups)

No se tocó nada de la lógica de negocio (rutas del backend, modelos, controladores,
autenticación, IA, etc.). Todo lo que cambió es visual/estructural en el frontend:

- `frontend/src/index.css` — paleta y layout: navbar convertida en banner azul
  (#2563EB), footer oscuro (#1F2937) en toda la app, layout de sidebar, estilo de
  tarjetas con encabezado azul, anillos de progreso circulares, grid de 3 columnas
  para vacantes.
- `frontend/src/components/Footer.jsx` — nuevo. Barra oscura con el copyright,
  igual a la de los mockups. Se agregó a `App.jsx`.
- `frontend/src/components/Sidebar.jsx` — nuevo. Menú lateral para el rol
  **estudiante** (Inicio / Mi Perfil / Vacantes / Postulaciones / Evaluación IA),
  igual a las pantallas del estudiante en los mockups.
- `frontend/src/components/Navbar.jsx` — sin cambios de lógica, solo hereda el
  nuevo estilo de banner azul del CSS.
- `frontend/src/pages/Login.jsx` y `Registro.jsx` — reordenados visualmente para
  que la tarjeta quede centrada con el logo arriba y el botón rojo de
  "Regístrate" debajo del azul de "Iniciar sesión", tal como en el mockup.
- `frontend/src/pages/Vacantes.jsx` — grid de 3 columnas, botón rojo
  "Postularme" a todo lo ancho, muestra el apoyo económico si la vacante lo tiene.
- `frontend/src/pages/PerfilEstudiante.jsx` — encabezado con avatar circular +
  anillo de progreso de "Perfil completado", igual al mockup del dashboard.
- `frontend/src/pages/DashboardEmpresa.jsx` — las pestañas (Resumen / Mis
  vacantes / Candidatos) ahora se ven como un sidebar vertical dentro del panel,
  igual al mockup "Dashboard Empresarial".

## Cómo levantarlo

```bash
# 1) Base de datos (Docker real, tal como ya la tenías configurada)
docker compose up -d

# 2) Backend
cd backend
cp .env.docker.example .env   # usa el Mysql del contenedor (puerto 3307)
npm install
npm run dev

# 3) Frontend (en otra terminal)
cd frontend
npm install
npm run dev
```

Frontend en `http://localhost:5173`, backend en `http://localhost:4000`.
Las cuentas de ejemplo siguen siendo las mismas del `README.md` original
(contraseña `Demo1234!` para todas).
