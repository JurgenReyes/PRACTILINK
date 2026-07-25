FROM node:20-alpine

WORKDIR /app

# Copiamos primero solo los manifiestos para aprovechar el cache de capas de
# Docker: si package.json no cambia, no se reinstalan dependencias.
COPY package*.json ./
RUN npm ci --omit=dev

COPY . .

ENV NODE_ENV=production
EXPOSE 4000

CMD ["node", "src/server.js"]
