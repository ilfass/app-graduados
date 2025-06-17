FROM node:18

WORKDIR /app

# Instalar sqlite3
RUN apt-get update && apt-get install -y sqlite3

# Copiar archivos de configuración y dependencias
COPY backend/package*.json ./
COPY backend/tsconfig.json ./

# Instalar dependencias
RUN npm install

# Copiar el código fuente
COPY backend/src ./src
COPY backend/.env ./

# Compilar TypeScript
RUN npm run build

# Crear directorio para la base de datos y establecer permisos
RUN mkdir -p /app/data && chown -R node:node /app

EXPOSE 3000

USER node

CMD ["npm", "start"] 