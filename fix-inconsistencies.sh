#!/bin/bash

# Corregir estructura del backend
cd backend
if [ -d "backend" ]; then
    mv backend/src/* src/ 2>/dev/null || true
    rm -rf backend
fi
if [ -f ".env .production" ]; then
    mv ".env .production" .env.production
fi
rm -f .gitignore

# Crear .env.example en el frontend
cd ../frontend
cat > .env.example << 'EOL'
# API URLs
VITE_API_URL=/api
VITE_SOCKET_URL=/socket.io

# Google Maps
VITE_GOOGLE_MAPS_API_KEY=your_api_key

# reCAPTCHA
VITE_RECAPTCHA_SITE_KEY=your_site_key
EOL

# Crear .gitignore específico para el frontend
cat > .gitignore << 'EOL'
# Dependencies
node_modules/
.pnp/
.pnp.js

# Testing
coverage/

# Production
dist/
build/

# Misc
.DS_Store
.env
.env.local
.env.development.local
.env.test.local
.env.production.local

npm-debug.log*
yarn-debug.log*
yarn-error.log*

# IDE
.idea/
.vscode/
*.swp
*.swo

# TypeScript
*.tsbuildinfo
EOL

# Verificar y corregir Dockerfiles
cd ../docker
if [ ! -f "frontend/Dockerfile" ]; then
    echo "FROM node:18-alpine as build
WORKDIR /app
COPY frontend/package*.json ./
RUN npm install
COPY frontend/ .
RUN npm run build

FROM nginx:alpine
COPY --from=build /app/dist /usr/share/nginx/html
COPY nginx/nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD [\"nginx\", \"-g\", \"daemon off;\"]" > frontend/Dockerfile
fi

if [ ! -f "backend/Dockerfile" ]; then
    echo "FROM node:18-alpine
WORKDIR /app
COPY backend/package*.json ./
RUN npm install
COPY backend/ .
EXPOSE 3000
CMD [\"npm\", \"start\"]" > backend/Dockerfile
fi

# Verificar y corregir configuración de Kubernetes
cd ../k8s
if [ ! -d "shared" ]; then
    mkdir -p shared
fi

# Crear namespace si no existe
if [ ! -f "shared/namespace.yaml" ]; then
    echo "apiVersion: v1
kind: Namespace
metadata:
  name: web-internacionales-appgraduados" > shared/namespace.yaml
fi

# Actualizar docker-compose.yml en la raíz
cd ..
if [ -f "docker-compose.yml" ]; then
    cat > docker-compose.yml << 'EOL'
version: '3.8'

services:
  frontend:
    build:
      context: .
      dockerfile: docker/frontend/Dockerfile
    ports:
      - "80:80"
    depends_on:
      - backend

  backend:
    build:
      context: .
      dockerfile: docker/backend/Dockerfile
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=development
    volumes:
      - ./backend:/app
      - /app/node_modules
EOL
fi

echo "Correcciones aplicadas. Por favor, verifica los cambios." 