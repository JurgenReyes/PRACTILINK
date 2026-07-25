# Cómo instalar PractiLink en otra computadora

Este ZIP incluye el código completo (frontend + backend) **sin** las carpetas
`node_modules` (para que pese poco). Necesitas volver a instalarlas ahí.

## Requisitos en la nueva computadora
- Node.js (18 o superior) — https://nodejs.org
- MySQL Server 8 — puede ser MySQL Server, XAMPP, etc.

## 1. Base de datos

Importa el volcado ya listo (incluye estructura + datos de ejemplo + la cuenta
de administrador, todo tal como quedó configurado):

```bash
mysql -u root -p -e "CREATE DATABASE practilink CHARACTER SET utf8mb4;"
mysql -u root -p --default-character-set=utf8mb4 practilink < backend/database/practilink_dump_completo.sql
```

(Si tu cliente de MySQL no soporta `--default-character-set`, asegúrate de
todos modos de que la conexión use `utf8mb4`, o los acentos se verán mal).

## 2. Backend

```bash
cd backend
npm install
```

Edita `backend/.env` y ajusta **DB_PASSWORD** con la contraseña de root de
MySQL en la nueva computadora (los demás valores pueden quedar igual).

```bash
npm run dev        # http://localhost:4000
```

## 3. Frontend

```bash
cd frontend
npm install
npm run dev         # http://localhost:5173
```

## Cuentas para entrar (todas con contraseña Demo1234!)

| Rol | Correo |
|---|---|
| Administrador | admin@practilink.com |
| Empresa (aprobada) | contacto@techsolutions.com |
| Empresa (aprobada) | rh@datacorp.mx |
| Empresa (aprobada) | reclutamiento@softquality.com |
| Empresa (pendiente de aprobar) | contacto@innovatx.com |
| Estudiante | jose.martinez@alumnos.mx |
| Estudiante | maria.gonzalez@alumnos.mx |
| Estudiante | luis.ramirez@alumnos.mx |
| Estudiante | andrea.lopez@alumnos.mx |

Para más detalle sobre el flujo de prueba completo, ve `README.md` en la raíz
de este proyecto.
