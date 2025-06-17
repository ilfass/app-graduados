#!/bin/bash

# Crear nueva estructura de directorios
mkdir -p frontend/src frontend/public
mkdir -p backend/src
mkdir -p k8s/{frontend,backend,shared}
mkdir -p docker/{frontend,backend,nginx}
mkdir -p scripts
mkdir -p docs/{api,deployment}
mkdir -p .github/workflows

# Mover archivos del frontend
mv src/* frontend/src/
mv public/* frontend/public/
mv index.html frontend/
mv vite.config.ts frontend/
mv vite.config.d.ts frontend/
mv tsconfig.app.json frontend/
mv tsconfig.json frontend/
mv tsconfig.node.json frontend/
mv tailwind.config.js frontend/
mv eslint.config.js frontend/

# Mover archivos del backend
mv backend/src/* backend/src/
mv backend/package.json backend/
mv backend/tsconfig.json backend/
mv backend/Dockerfile backend/

# Mover archivos de Kubernetes
mv k8s/*.yaml k8s/shared/
mv k8s/frontend-*.yaml k8s/frontend/ 2>/dev/null || true
mv k8s/backend-*.yaml k8s/backend/ 2>/dev/null || true

# Mover archivos de Docker
mv docker-compose/Dockerfile.frontend docker/frontend/Dockerfile
mv docker-compose/Dockerfile.backend docker/backend/Dockerfile
mv docker-compose/nginx.conf docker/nginx/
mv docker-compose/docker-compose.yml ./

# Crear archivos de configuración necesarios
echo "# Frontend Environment Variables" > frontend/.env.example
echo "# Backend Environment Variables" > backend/.env.example

# Actualizar README principal
cat > README.md << 'EOL'
# App Graduados

## Estructura del Proyecto

```
app-graduados/
├── frontend/                 # Aplicación React + TypeScript
├── backend/                  # Servidor Node.js + TypeScript
├── k8s/                      # Configuración de Kubernetes
├── docker/                   # Configuración de Docker
├── scripts/                  # Scripts de utilidad
├── docs/                     # Documentación
└── .github/                  # Configuración de GitHub Actions
```

## Desarrollo Local

1. Clonar el repositorio
2. Instalar dependencias:
   ```bash
   # Frontend
   cd frontend
   npm install
   
   # Backend
   cd ../backend
   npm install
   ```
3. Configurar variables de entorno:
   - Copiar `.env.example` a `.env` en frontend y backend
   - Ajustar las variables según sea necesario

4. Iniciar el entorno de desarrollo:
   ```bash
   docker-compose up
   ```

## Despliegue

Ver la documentación en `docs/deployment/` para instrucciones detalladas de despliegue.

## Documentación

- API: `docs/api/`
- Despliegue: `docs/deployment/`
EOL

# Crear script de setup
cat > scripts/setup.sh << 'EOL'
#!/bin/bash

# Instalar dependencias del frontend
cd frontend
npm install

# Instalar dependencias del backend
cd ../backend
npm install

# Copiar archivos de ejemplo de entorno
cp .env.example .env
cd ../frontend
cp .env.example .env

echo "Setup completado. Por favor, revisa y configura los archivos .env"
EOL

chmod +x scripts/setup.sh

# Crear script de despliegue
cat > scripts/deploy.sh << 'EOL'
#!/bin/bash

# Construir imágenes Docker
docker-compose build

# Desplegar en Kubernetes
kubectl apply -f k8s/shared/
kubectl apply -f k8s/backend/
kubectl apply -f k8s/frontend/
EOL

chmod +x scripts/deploy.sh

echo "Reestructuración completada. Por favor, revisa los cambios y ajusta según sea necesario." 