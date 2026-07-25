# Base de datos en Docker

La base de datos MySQL corre en un contenedor Docker, ya con el esquema,
los datos de ejemplo y la cuenta de administrador cargados (usa el mismo
volcado `backend/database/practilink_dump_completo.sql` que respalda tu
base de datos local actual).

Esto **no reemplaza** tu MySQL nativo de Windows — corre en el puerto
**3307** para no chocar con el 3306 que ya usa tu instalación local.

## Requisito

Docker Desktop debe estar abierto y corriendo (ícono de la ballena en la
barra de tareas). Ahora mismo está instalado pero apagado en tu máquina.

## Levantar el contenedor

Desde la raíz del proyecto (`PractiLink_Completo/`):

```bash
docker compose up -d
```

La primera vez construye la imagen (tarda un poco en descargar `mysql:8.0`)
y crea el volumen con los datos ya cargados. Para confirmar que está sano:

```bash
docker compose ps
```

Debe decir `healthy`.

## Apuntar el backend al contenedor

```bash
cd backend
cp .env.docker.example .env
npm run dev
```

Esto usa `DB_PORT=3307` y la contraseña `Practilink2026!` (definida en
`docker-compose.yml`). El frontend no cambia — sigue igual.

Para volver a usar tu MySQL nativo de Windows en vez del contenedor,
simplemente restaura tu `.env` original (`DB_PORT=3306`, tu contraseña).

## Comandos útiles

```bash
docker compose down       # detiene el contenedor, conserva los datos
docker compose down -v    # detiene el contenedor y BORRA los datos (reinicio limpio)
docker compose logs -f    # ver logs de MySQL
```
