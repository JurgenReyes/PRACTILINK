# Despliegue a Azure + CI/CD — Guía paso a paso

Esta guía cubre, en orden, cada reactivo de la rúbrica **F-71-I (Tecnologías de la
Virtualización, UA3)**. Los archivos de código (Dockerfiles, workflow de GitHub
Actions) ya están listos en el repo; aquí están los pasos que solo tú/tu equipo
pueden hacer porque dependen de sus propias cuentas.

Marca cada casilla conforme la vayas completando — están en el mismo orden que
la tabla de la rúbrica.

---

## 0. Requisitos previos

- Cuenta de GitHub con el repositorio del equipo.
- [Azure for Students](https://azure.microsoft.com/free/students/) — actívala con tu
  correo institucional (`@upa.edu.mx` o el que use tu universidad). No pide
  tarjeta de crédito y da $100 USD de crédito.
- [Azure CLI](https://learn.microsoft.com/cli/azure/install-azure-cli) instalado
  (`az --version` para confirmar) o usa el **Cloud Shell** dentro del portal de
  Azure (portal.azure.com → ícono de terminal arriba) para no instalar nada.
- Docker Desktop (ya lo tienes).

---

## 1 y 2 — Estructura del repositorio y ramas (15 pts + 10 pts)

**Reactivo:** *"El repositorio presenta una estructura organizada"* y
*"El equipo utiliza ramas para administrar el desarrollo"*.

1. Como tu repo está vacío/desactualizado, sube el código actual:
   ```bash
   cd PractiLink_Completo
   git init
   git remote add origin https://github.com/TU-ORG/practilink.git
   git add .
   git commit -m "Estructura inicial del proyecto: backend, frontend, docs"
   git branch -M main
   git push -u origin main
   ```
2. Crea una rama de desarrollo y trabajen ahí (no directo en `main`):
   ```bash
   git checkout -b develop
   git push -u origin develop
   ```
3. De ahí en adelante, cada quien crea su rama por función y hace Pull Request
   hacia `develop`:
   ```bash
   git checkout -b feature/nombre-de-la-funcionalidad
   ```

La estructura que ya tienes (`backend/`, `frontend/`, `.github/workflows/`,
`DESPLIEGUE_AZURE.md`) ya es clara y está organizada por capa — no necesitas
tocar nada más ahí.

---

## 3. Reglas/restricciones en la rama principal (10 pts)

**Reactivo:** *"La rama principal cuenta con reglas o restricciones para evitar
modificaciones directas no autorizadas"*.

En GitHub → tu repositorio → **Settings → Branches → Add branch ruleset** (o
"Add rule" si ves la versión clásica):

1. Branch name pattern: `main`
2. Marca:
   - ✅ Require a pull request before merging
   - ✅ Require approvals (mínimo 1)
   - ✅ Require status checks to pass before merging → selecciona el job
     `build-and-validate` (aparecerá después de tu primer workflow run)
3. Guarda. Con esto nadie puede hacer `git push` directo a `main`, tiene que
   pasar por Pull Request y el pipeline debe pasar en verde.

---

## 4. Permisos del equipo (5 pts)

**Reactivo:** *"Los integrantes del equipo cuentan con los permisos
adecuados"*.

GitHub → **Settings → Collaborators and teams → Add people** → agrega a cada
integrante con rol **Write** (no Admin, para que respeten las reglas de la
rama principal).

---

## 5. Crear los recursos en Azure (15 pts)

**Reactivo:** *"Los recursos, servicios y variables de configuración
utilizados en Azure están configurados correctamente"*.

Corre esto en Azure CLI (ajusta nombres — deben ser únicos globalmente en
Azure, agrega tus iniciales o número de equipo):

```bash
az login

# Variables (ajusta estos nombres)
RG=practilink-rg
LOCATION=eastus2
ACR_NAME=practilinkacr123        # solo minúsculas/números, único global
PLAN_NAME=practilink-plan
BACKEND_APP=practilink-backend-123
FRONTEND_APP=practilink-frontend-123
MYSQL_SERVER=practilink-mysql-123
MYSQL_ADMIN=practilinkadmin
MYSQL_PASSWORD='EligeUnaContraseñaSegura123!'

# 1. Grupo de recursos (contenedor lógico de todo)
az group create --name $RG --location $LOCATION

# 2. Azure Container Registry (aquí GitHub Actions sube las imágenes)
az acr create --resource-group $RG --name $ACR_NAME --sku Basic --admin-enabled true

# 3. Azure Database for MySQL Flexible Server (administrado, capa gratuita/burstable)
az mysql flexible-server create \
  --resource-group $RG --name $MYSQL_SERVER \
  --location $LOCATION --admin-user $MYSQL_ADMIN --admin-password "$MYSQL_PASSWORD" \
  --sku-name Standard_B1ms --tier Burstable --storage-size 32 --version 8.0 \
  --public-access 0.0.0.0-255.255.255.255   # permite acceso desde otros servicios de Azure; para producción real conviene restringir

az mysql flexible-server db create \
  --resource-group $RG --server-name $MYSQL_SERVER --database-name practilink

# 4. Plan de App Service para contenedores Linux
az appservice plan create --resource-group $RG --name $PLAN_NAME --is-linux --sku B1

# 5. Web App del backend (arranca con una imagen "placeholder"; GitHub Actions
#    la reemplaza por la real en el primer deploy)
az webapp create --resource-group $RG --plan $PLAN_NAME --name $BACKEND_APP \
  --deployment-container-image-name mcr.microsoft.com/appsvc/staticsite:latest

# 6. Web App del frontend
az webapp create --resource-group $RG --plan $PLAN_NAME --name $FRONTEND_APP \
  --deployment-container-image-name mcr.microsoft.com/appsvc/staticsite:latest

# 7. Variables de entorno del backend (usa el host real que te da el paso 3)
az webapp config appsettings set --resource-group $RG --name $BACKEND_APP --settings \
  DB_HOST="$MYSQL_SERVER.mysql.database.azure.com" \
  DB_PORT=3306 \
  DB_NAME=practilink \
  DB_USER="$MYSQL_ADMIN" \
  DB_PASSWORD="$MYSQL_PASSWORD" \
  JWT_SECRET="cambia_esto_por_un_valor_seguro" \
  JWT_EXPIRES_IN=8h \
  FRONTEND_URL="https://$FRONTEND_APP.azurewebsites.net" \
  WEBSITES_PORT=4000

az webapp config appsettings set --resource-group $RG --name $FRONTEND_APP --settings \
  WEBSITES_PORT=80

echo "Backend:  https://$BACKEND_APP.azurewebsites.net"
echo "Frontend: https://$FRONTEND_APP.azurewebsites.net"
```

Después, carga el esquema y los datos de ejemplo a la base de datos en Azure
(desde tu máquina, apuntando al host de Azure):

```bash
mysql -h $MYSQL_SERVER.mysql.database.azure.com -u $MYSQL_ADMIN -p practilink < backend/database/schema.sql
mysql -h $MYSQL_SERVER.mysql.database.azure.com -u $MYSQL_ADMIN -p practilink < backend/database/seed.sql
```

---

## 6. Credenciales para que GitHub Actions pueda desplegar

Crea un *service principal* (la "llave" que le da permiso a GitHub Actions
para publicar en tu suscripción de Azure):

```bash
az ad sp create-for-rbac --name "practilink-github-actions" \
  --role contributor \
  --scopes /subscriptions/$(az account show --query id -o tsv)/resourceGroups/$RG \
  --sdk-auth
```

Esto imprime un JSON — cópialo completo, lo vas a necesitar en el siguiente
paso.

Obtén también las credenciales del ACR:
```bash
az acr credential show --name $ACR_NAME
```

---

## 7. Configurar los Secrets en GitHub

GitHub → tu repo → **Settings → Secrets and variables → Actions → New
repository secret**. Crea uno por cada fila:

| Nombre del secret | Valor |
|---|---|
| `AZURE_CREDENTIALS` | el JSON completo del paso 6 |
| `ACR_LOGIN_SERVER` | `$ACR_NAME.azurecr.io` |
| `ACR_USERNAME` | el `username` que mostró `az acr credential show` |
| `ACR_PASSWORD` | el `password` (`passwords[0].value`) del mismo comando |
| `AZURE_WEBAPP_BACKEND` | el valor que pusiste en `$BACKEND_APP` |
| `AZURE_WEBAPP_FRONTEND` | el valor que pusiste en `$FRONTEND_APP` |
| `VITE_API_URL` | `https://TU-BACKEND_APP.azurewebsites.net/api` |

---

## 8, 9, 10 — El pipeline (10 + 10 + 5 + 5 pts)

Ya está en `.github/workflows/ci-cd.yml` y cubre exactamente estos reactivos:

- **Se activa con push, pull request o manualmente** → bloque `on:` con
  `push`, `pull_request` y `workflow_dispatch`.
- **Restaura dependencias, compila y valida sin errores** → job
  `build-and-validate` (`npm ci`, `node --check`, `npm run build`). Corre en
  cada push/PR, incluso antes de que configures Azure, así el equipo ve el
  pipeline funcionando desde el primer commit.
- **Despliegue automático a Azure** → job `build-and-deploy`, solo en push a
  `main`, hace `docker build` + `docker push` al ACR y despliega con
  `azure/webapps-deploy`.

Para que corra por primera vez, sube un cambio a `main` (por ejemplo, vía
Pull Request de `develop` → `main` una vez que tengan los secrets
configurados):

```bash
git checkout main
git pull
git merge develop
git push
```

---

## 11. Evidencia de ejecuciones exitosas (5 pts)

Ve a la pestaña **Actions** de tu repositorio en GitHub. Ahí queda el
historial de cada corrida del workflow con ✅ o ❌. Para la entrega:

- Deja al menos un run en verde (✅) tanto del job de validación como del de
  despliegue.
- Toma captura de esa pantalla para incluirla como evidencia si el profesor
  la pide, y ten la pestaña abierta el día de la presentación.

---

## Checklist final

- [ ] Código subido a `main`, con historial de commits del equipo
- [ ] Rama `develop` + ramas `feature/*` usadas durante el desarrollo
- [ ] Regla de protección en `main` (PR + aprobación + status check)
- [ ] Todos los integrantes agregados como colaboradores (Write)
- [ ] Grupo de recursos, ACR, MySQL Flexible Server, App Service Plan y 2 Web
      Apps creados en Azure
- [ ] Secrets configurados en GitHub (`AZURE_CREDENTIALS`, `ACR_*`,
      `AZURE_WEBAPP_*`, `VITE_API_URL`)
- [ ] Workflow corrido exitosamente al menos una vez (verde en la pestaña
      Actions)
- [ ] `https://TU-FRONTEND_APP.azurewebsites.net` carga la app y puedes
      iniciar sesión de verdad
