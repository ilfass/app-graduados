# Etapa de construcción
FROM node:18 as build

WORKDIR /app

# Instalar dependencias del sistema
RUN apt-get update && apt-get install -y \
    sqlite3 \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Copiar archivos de configuración
COPY backend/package*.json ./
COPY backend/tsconfig.json ./

# Instalar dependencias
RUN npm install

# Copiar el código fuente
COPY backend/src ./src

# Construir la aplicación
RUN npm run build

# Etapa de producción
FROM node:18-slim

WORKDIR /app

# Instalar dependencias del sistema
RUN apt-get update && apt-get install -y \
    sqlite3 \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Copiar archivos necesarios
COPY --from=build /app/dist ./dist
COPY --from=build /app/node_modules ./node_modules
COPY backend/package*.json ./

# Crear directorio para la base de datos
RUN mkdir -p /app/data && \
    chown -R node:node /app

# Cambiar al usuario node
USER node

# Exponer el puerto
EXPOSE 3000

# Comando para verificar la salud
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
    CMD curl -f ${API_URL:-/api}/health || exit 1

# Iniciar la aplicación
CMD ["node", "dist/index.js"] 