# PractiLink — Plataforma completa

Plataforma de vinculación estudiante–empresa con evaluación por IA.
Stack: **React (Vite) + Node.js/Express + MySQL + AWS**.

A diferencia de un prototipo mínimo, esta versión implementa **las funciones completas
de los 3 módulos** descritos en el documento de requerimientos original:

- **Estudiante**: registro/login, perfil, carga y análisis de CV, búsqueda y postulación
  a vacantes, favoritos, seguimiento de estatus, **exámenes generados y calificados
  automáticamente**, **chat en tiempo real (polling) con la empresa**, notificaciones
  in-app y por correo, confirmación/reprogramación de entrevistas.
- **Empresa**: registro con validación por RFC, gestión completa de vacantes (crear,
  pausar, reactivar, cerrar, duplicar), **panel de candidatos con filtros, notas internas
  y programación de entrevistas**, **dashboard con gráficas** (postulaciones por vacante
  y por estatus), exportación de candidatos a CSV, chat con estudiantes.
- **Administrador**: gestión de usuarios (suspender/reactivar/eliminar/restablecer
  contraseña), validación de empresas, **moderación de vacantes**, **configuración de
  los parámetros de IA** (pesos de matching, dificultad de exámenes), **bitácora de
  auditoría**, catálogos administrables, gestión de subadministradores, avisos
  generales, dashboard global y reportes exportables.

## Estructura

```
practilink/
├── backend/
│   ├── database/
│   │   ├── schema.sql   # Esquema completo (todas las entidades + parámetros de IA)
│   │   └── seed.sql     # Datos de ejemplo: empresas, vacantes, estudiantes, postulaciones
│   └── src/
│       ├── models/          # 17 modelos Sequelize (uno por entidad)
│       ├── controllers/     # authController, vacanteController, postulacionController,
│       │                     adminController, empresaPanelController, examenController,
│       │                     mensajeController
│       ├── routes/          # Un archivo de rutas por módulo, más publicoRoutes (catálogos/avisos)
│       ├── middleware/auth.js
│       └── services/
│           ├── aws/         # S3 (archivos) y SES (correo)
│           ├── ia/          # analisisCV.js, examenes.js (genera y califica), matching.js
│           ├── auditoria.js     # registra acciones críticas de administradores
│           └── notificaciones.js # crea notificación in-app + correo en un solo paso
└── frontend/
    └── src/
        ├── pages/     # Inicio, Login, Registro, Vacantes, PerfilEstudiante, Examenes,
        │               DashboardEmpresa (con pestañas: Resumen/Vacantes/Candidatos),
        │               DashboardAdmin (con pestañas: Resumen/Empresas/Usuarios/
        │               Vacantes/ConfigIA/Bitácora/Avisos)
        ├── components/  # Navbar, Notificaciones (campana), Chat, EstatusBadge, RutaProtegida
        └── context/AuthContext.jsx
```

## Puesta en marcha local

### 1. Base de datos

```bash
mysql -u root -p < backend/database/schema.sql
mysql -u root -p < backend/database/seed.sql
```

**Todas las cuentas de ejemplo usan la contraseña `Demo1234!`:**

| Rol | Correo | Nota |
|---|---|---|
| Empresa (aprobada) | contacto@techsolutions.com | Ya puede publicar vacantes |
| Empresa (aprobada) | rh@datacorp.mx | Ya puede publicar vacantes |
| Empresa (aprobada) | reclutamiento@softquality.com | Ya puede publicar vacantes |
| Empresa (pendiente) | contacto@innovatx.com | Para probar la aprobación desde /admin |
| Estudiante | jose.martinez@alumnos.mx | Con habilidades y una entrevista programada |
| Estudiante | maria.gonzalez@alumnos.mx | Con evaluación pendiente (puede presentar examen) |
| Estudiante | luis.ramirez@alumnos.mx | En revisión |
| Estudiante | andrea.lopez@alumnos.mx | Aceptada en una vacante |

El administrador **no** viene en el seed. Créalo con:
```bash
cd backend
node -e "console.log(require('bcryptjs').hashSync('TuPassword1!',10))"
```
Copia el hash y en MySQL:
```sql
USE practilink;
INSERT INTO usuarios (correo, password_hash, rol, correo_verificado, fecha_creacion, fecha_modificacion)
VALUES ('admin@practilink.com', '<pega_aquí_el_hash>', 'administrador', true, NOW(), NOW());
INSERT INTO administradores (id_usuario, nombre_completo, nivel_permiso, fecha_creacion)
VALUES (LAST_INSERT_ID(), 'Admin Principal', 'superadministrador', NOW());
```

### 2. Backend
```bash
cd backend
cp .env.example .env      # edita DB_PASSWORD y JWT_SECRET
npm install
npm run dev                # http://localhost:4000
```
En desarrollo (`NODE_ENV=development`), sin credenciales de AWS:
- El envío de correo (SES) se **simula por consola** — revisa la terminal del backend
  para ver los enlaces de verificación y las notificaciones.
- El CORS acepta automáticamente cualquier `http://localhost:<puerto>` (Vite puede
  cambiar de puerto si 5173 está ocupado).

### 3. Frontend
```bash
cd frontend
npm install
npm run dev                 # http://localhost:5173 (o el puerto que asigne Vite)
```

## Cómo probar el flujo completo

1. Inicia sesión como `jose.martinez@alumnos.mx` (contraseña `Demo1234!`) — ya tiene
   una entrevista programada con Tech Solutions. Ve a "Mi perfil" y abre el chat de esa
   postulación para escribirle a la empresa.
2. Inicia sesión como `contacto@techsolutions.com` — ve al Panel de empresa, pestaña
   "Candidatos", selecciona la vacante de Frontend y responde el mensaje de José.
3. Cambia el estatus de una postulación a "Evaluación pendiente" — esto genera
   automáticamente un examen. Inicia sesión con ese estudiante y preséntalo en "Exámenes".
4. Inicia sesión como administrador y revisa: la empresa pendiente ("InnovaTX"), el
   dashboard global, la bitácora (verás las acciones que has hecho), y ajusta algún
   parámetro en "Parámetros de IA" (por ejemplo `peso_carrera`) — afecta el cálculo de
   matching de nuevas postulaciones.

## Conectar los servicios reales de AWS

| Servicio | Dónde conectarlo | Notas |
|---|---|---|
| Amazon RDS (MySQL) | `backend/.env` (`DB_HOST`, etc.) | Usa el endpoint de tu instancia RDS |
| Amazon S3 | `backend/src/services/aws/s3.js` | Ya implementado con el SDK v3; solo faltan credenciales/bucket |
| Amazon SES | `backend/src/services/aws/ses.js` | Ya implementado; requiere dominio/correo verificado en SES |
| Amazon Textract/Comprehend/Bedrock | `backend/src/services/ia/analisisCV.js` | El análisis de CV está simulado; la firma ya es la definitiva |
| Amazon Bedrock (exámenes) | `backend/src/services/ia/examenes.js` | La generación/calificación usa un banco de reactivos determinístico; sustituir por prompts a Bedrock cuando haya cuenta de AWS |

## Qué falta para producción real

- Sustituir los servicios de IA simulados (CV, exámenes) por llamadas reales a AWS.
- Migrar el chat de "polling" (refresco cada pocos segundos) a WebSockets para mensajería instantánea real.
- Infraestructura como código (Terraform/CloudFormation) y pipeline de despliegue.
- Suite de pruebas automatizadas (unitarias e integración).
- Panel de administrador para editar/crear preguntas del examen desde la interfaz (hoy el banco vive en código, `services/ia/examenes.js`).

Consulta `PractiLink_Arquitectura.docx` para el diseño completo de estos componentes.
