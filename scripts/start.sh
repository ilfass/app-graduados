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

# Función para crear usuario de prueba
create_test_user() {
    echo -e "${YELLOW}Creando usuario de prueba...${NC}"
    
    # Datos del usuario de prueba
    local user_data='{
        "nombre": "Usuario",
        "apellido": "Prueba",
        "email": "test@example.com",
        "password": "Test123!",
        "pais": "Argentina",
        "ciudad": "Tandil",
        "latitud": -37.3217,
        "longitud": -59.1332,
        "carrera": "Ingeniería en Sistemas",
        "anioGraduacion": 2023,
        "institucion": "Universidad Nacional del Centro"
    }'
    
    # Registrar usuario
    local response=$(curl -s -X POST http://localhost:3000/api/graduados/register \
        -H "Content-Type: application/json" \
        -d "$user_data")
    
    if [[ $response == *"success"* ]]; then
        echo -e "${GREEN}✅ Usuario de prueba creado${NC}"
    else
        echo -e "${YELLOW}⚠️ Usuario de prueba ya existe o hubo un error${NC}"
    fi
}

# Función para mostrar información de acceso
show_access_info() {
    echo -e "\n${GREEN}=== Información de Acceso ===${NC}"
    echo -e "\n${YELLOW}URLs:${NC}"
    echo -e "Frontend: ${GREEN}http://localhost${NC}"
    echo -e "Backend: ${GREEN}http://localhost:3000${NC}"
    
    echo -e "\n${YELLOW}Credenciales de Administrador:${NC}"
    echo -e "Email: ${GREEN}admin@unicen.edu.ar${NC}"
    echo -e "Contraseña: ${GREEN}Admin123!${NC}"
    
    echo -e "\n${YELLow}Credenciales de Usuario de Prueba:${NC}"
    echo -e "Email: ${GREEN}test@example.com${NC}"
    echo -e "Contraseña: ${GREEN}Test123!${NC}"
    
    echo -e "\n${YELLOW}Para detener la aplicación:${NC}"
    echo -e "Ejecuta: ${GREEN}docker-compose down${NC}"
}

# Función principal
main() {
    echo -e "${GREEN}🚀 Iniciando aplicación...${NC}"
    
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
    
    # Crear usuario de prueba
    create_test_user
    
    # Mostrar información de acceso
    show_access_info
    
    echo -e "\n${GREEN}✅ Aplicación iniciada exitosamente${NC}"
}

# Ejecutar función principal
main 