FROM node:18

WORKDIR /app

# Instalar dependencias del sistema
RUN apt-get update && apt-get install -y \
    sqlite3 \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Copiar archivos de configuración y dependencias
COPY backend/package*.json ./
COPY backend/tsconfig.json ./

# Instalar dependencias
RUN npm install

# Copiar el código fuente
COPY backend/src ./src

# Compilar TypeScript
RUN npm run build

# Crear directorio para la base de datos y establecer permisos
RUN mkdir -p /app/data && \
    chown -R node:node /app

EXPOSE 3000

USER node

# Healthcheck
HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
    CMD curl -f http://localhost:3000/api/health || exit 1

CMD ["npm", "start"] 