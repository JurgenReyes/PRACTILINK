# PractiLink — Prototipo

Prototipo funcional de PractiLink: plataforma de vinculación estudiante–empresa con
evaluación por IA. Stack: **React (Vite) + Node.js/Express + MySQL + AWS**.

Este prototipo implementa el flujo núcleo (autenticación, perfiles, vacantes,
postulaciones, validación de empresas) descrito en el documento
`PractiLink_Arquitectura.docx`. No es el sistema completo de 90+ requerimientos,
sino la base sobre la cual se construye siguiendo el mismo patrón de código.

## Estructura

```
practilink/
├── backend/           # API REST (Node.js + Express + Sequelize/MySQL)
│   ├── database/schema.sql   # Esquema completo de la BD (todas las entidades de RD-01)
│   └── src/
│       ├── models/            # Usuario, Estudiante, Empresa, Vacante, Postulacion
│       ├── controllers/       # Lógica de negocio
│       ├── routes/            # Definición de endpoints
│       ├── middleware/auth.js # JWT + control de roles
│       └── services/
│           ├── aws/           # Integración con S3 (archivos) y SES (correo)
│           └── ia/            # Orquestador de análisis de CV y cálculo de matching
└── frontend/          # SPA en React
    └── src/
        ├── pages/             # Login, Registro, Vacantes, Perfil, Dashboards
        ├── components/        # Navbar, EstatusBadge, RutaProtegida
        └── context/AuthContext.jsx
```

## Puesta en marcha local

### 1. Base de datos
```bash
mysql -u root -p < backend/database/schema.sql
```

### 2. Backend
```bash
cd backend
cp .env.example .env      # edita las credenciales de MySQL y JWT_SECRET
npm install
npm run dev                # http://localhost:4000
```

En modo `NODE_ENV=development` sin credenciales de AWS, el envío de correo (SES) se
**simula por consola** para poder probar el flujo de registro/login sin cuenta de AWS.
La subida de CV a S3 sí requiere credenciales válidas (o se puede mockear igual, ver
`src/services/aws/s3.js`).

### 3. Frontend
```bash
cd frontend
npm install
npm run dev                 # http://localhost:5173
```

## Cómo probar el flujo completo

1. Regístrate como **empresa** en `/registro`. Revisa la consola del backend para
   copiar el enlace de verificación simulado y "confirmar" el correo.
2. Un administrador debe existir manualmente en la BD (por RF-A20/RNF, los admins no
   se autorregistran) y aprobar la empresa desde `/admin`.
3. Regístrate como **estudiante**, verifica tu correo, sube un CV (PDF) en `/estudiante`
   para ver el análisis simulado de IA.
4. Publica una vacante desde `/empresa` una vez la empresa esté aprobada.
5. Postúlate a la vacante desde `/vacantes` con la cuenta de estudiante.

Para crear el primer administrador manualmente:
```sql
INSERT INTO usuarios (correo, password_hash, rol, correo_verificado)
VALUES ('admin@practilink.com', '<hash_bcrypt>', 'administrador', true);
INSERT INTO administradores (id_usuario, nombre_completo, nivel_permiso)
VALUES (LAST_INSERT_ID(), 'Admin Principal', 'superadministrador');
```
(Genera el hash con `node -e "console.log(require('bcryptjs').hashSync('TuPassword1!',10))"`.)

## Conectar los servicios reales de AWS

| Servicio | Dónde conectarlo | Notas |
|---|---|---|
| Amazon RDS (MySQL) | `backend/.env` (`DB_HOST`, etc.) | Usa el endpoint de tu instancia RDS |
| Amazon S3 | `backend/src/services/aws/s3.js` | Ya implementado con el SDK v3; solo faltan credenciales/bucket |
| Amazon SES | `backend/src/services/aws/ses.js` | Ya implementado; requiere dominio/correo verificado en SES |
| Amazon Textract / Comprehend / Bedrock | `backend/src/services/ia/analisisCV.js` | Actualmente **simulado**; la firma de la función ya es la definitiva, solo hay que sustituir el cuerpo por las llamadas a los SDKs correspondientes (comentarios incluidos en el archivo) |
| Amazon ElastiCache (Redis) | No incluido en el prototipo | Recomendado para rate-limiting distribuido en producción (el prototipo usa `express-rate-limit` en memoria) |

## Qué falta para producción (fuera del alcance de este prototipo)

- Integración real con Textract/Comprehend/Bedrock (hoy simulada).
- Motor de generación y calificación de exámenes por IA (RF-E36 a RF-E42).
- Chat en tiempo real estudiante–empresa (RF-E44/RF-EM23) — requiere WebSockets.
- Endpoints completos de administrador (gestión de usuarios, moderación de vacantes,
  configuración de parámetros de IA, reportes exportables).
- Infraestructura como código (Terraform/CloudFormation) para desplegar en AWS.
- Suite de pruebas automatizadas (unitarias e integración).

Consulta `PractiLink_Arquitectura.docx` para el diseño completo de estos componentes.
