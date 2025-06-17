#!/bin/bash

# Mover archivos restantes del frontend
mv package.json frontend/
mv package-lock.json frontend/
mv tsconfig.tsbuildinfo frontend/

# Mover archivos de configuración
mv nginx.conf docker/nginx/
mv Dockerfile docker/frontend/

# Limpiar directorios vacíos
rm -rf src public docker-compose

# Actualizar .gitignore
cat > .gitignore << 'EOL'
# Dependencies
node_modules/
.pnp/
.pnp.js

# Testing
coverage/

# Production
build/
dist/

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

# Logs
logs/
*.log
EOL

echo "Limpieza completada." 