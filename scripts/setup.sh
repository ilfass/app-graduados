#!/bin/bash

# Colores para output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m'

# Función para manejar errores
handle_error() {
    echo -e "${RED}❌ Error: $1${NC}"
    exit 1
}

# Función para esperar a que un servicio esté listo
wait_for_service() {
    local service=$1
    local url=$2
    local max_attempts=30
    local attempt=1
    
    echo -e "${YELLOW}Esperando a que $service esté listo...${NC}"
    while [ $attempt -le $max_attempts ]; do
        if curl -s "$url" > /dev/null; then
            echo -e "${GREEN}✅ $service está listo${NC}"
            return 0
        fi
        echo "Intento $attempt/$max_attempts..."
        sleep 2
        attempt=$((attempt + 1))
    done
    handle_error "El servicio $service no está disponible después de $max_attempts intentos"
}

# Función para crear archivo .env si no existe
create_env_file() {
    local env_file="backend/.env"
    if [ ! -f "$env_file" ]; then
        echo -e "${YELLOW}Creando archivo .env...${NC}"
        cat > "$env_file" << EOL
# Configuración de la base de datos
DB_TYPE=sqlite
DB_PATH=database.sqlite

# Configuración del servidor
PORT=3000
NODE_ENV=development

# Configuración de JWT
JWT_SECRET=test_secret_key
JWT_EXPIRES_IN=24h

# Configuración de CORS
CORS_ORIGIN=http://localhost:80

# Configuración de administrador por defecto
ADMIN_EMAIL=admin@unicen.edu.ar
ADMIN_PASSWORD=Admin123!
EOL
        echo -e "${GREEN}✅ Archivo .env creado${NC}"
    fi
}

# Función para verificar dependencias
check_dependencies() {
    echo -e "${YELLOW}Verificando dependencias...${NC}"
    command -v docker >/dev/null 2>&1 || handle_error "Docker no está instalado"
    command -v docker-compose >/dev/null 2>&1 || handle_error "Docker Compose no está instalado"
    command -v curl >/dev/null 2>&1 || handle_error "curl no está instalado"
    echo -e "${GREEN}✅ Todas las dependencias están instaladas${NC}"
}

# Función para limpiar recursos
cleanup() {
    echo -e "${YELLOW}Limpiando recursos...${NC}"
    docker-compose down
    echo -e "${GREEN}✅ Recursos limpiados${NC}"
}

# Función para verificar servicios
check_services() {
    echo -e "${YELLOW}Verificando servicios...${NC}"
    
    # Verificar backend
    if curl -s "http://localhost:3000/api/graduados/mapa" > /dev/null; then
        echo -e "${GREEN}✅ Backend está funcionando${NC}"
    else
        handle_error "Backend no está respondiendo"
    fi
    
    # Verificar frontend
    if curl -s "http://localhost" > /dev/null; then
        echo -e "${GREEN}✅ Frontend está funcionando${NC}"
    else
        handle_error "Frontend no está respondiendo"
    fi
}

# Función principal
main() {
    echo -e "${GREEN}🚀 Iniciando setup automático...${NC}"
    
    # Verificar dependencias
    check_dependencies
    
    # Crear archivo .env si no existe
    create_env_file
    
    # Limpiar recursos existentes
    cleanup
    
    # Construir y levantar servicios
    echo -e "${YELLOW}Construyendo y levantando servicios...${NC}"
    docker-compose up --build -d || handle_error "Error al construir y levantar servicios"
    
    # Esperar a que los servicios estén listos
    wait_for_service "backend" "http://localhost:3000/api/graduados/mapa"
    wait_for_service "frontend" "http://localhost"
    
    # Verificar servicios
    check_services
    
    echo -e "${GREEN}✅ Setup completado exitosamente${NC}"
    echo -e "${YELLOW}La aplicación está disponible en:${NC}"
    echo -e "Frontend: ${GREEN}http://localhost${NC}"
    echo -e "Backend: ${GREEN}http://localhost:3000${NC}"
}

# Ejecutar función principal
main
