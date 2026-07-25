# --- Etapa 1: build de la app con Vite ---
FROM node:20-alpine AS build
WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .

# Vite incrusta las variables VITE_* en el bundle en tiempo de build, por eso
# se recibe como build-arg (viene del workflow de GitHub Actions) y no como
# variable de entorno normal en runtime.
ARG VITE_API_URL
ENV VITE_API_URL=$VITE_API_URL
RUN npm run build

# --- Etapa 2: servir los archivos estáticos con Nginx ---
FROM nginx:1.27-alpine
COPY --from=build /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
