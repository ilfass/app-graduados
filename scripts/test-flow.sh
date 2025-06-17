#!/bin/bash

# Colores para output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m'

# Función para manejar errores
handle_error() {
    echo -e "${RED}❌ Error: $1${NC}"
    echo -e "${YELLOW}Limpiando recursos...${NC}"
    docker-compose down
    exit 1
}

# Función para esperar a que un servicio esté listo
wait_for_service() {
    local service=$1
    local max_attempts=30
    local attempt=1
    
    echo "Esperando a que $service esté listo..."
    while [ $attempt -le $max_attempts ]; do
        if curl -s "http://localhost:3000/api/graduados/mapa" > /dev/null; then
            echo "✅ $service está listo"
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
        echo "Creando archivo .env..."
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
        echo "✅ Archivo .env creado"
    fi
}

echo "🚀 Iniciando prueba del flujo completo del sistema..."

# 1. Verificar dependencias
echo -e "\n${GREEN}1. Verificando dependencias...${NC}"
command -v docker >/dev/null 2>&1 || handle_error "Docker no está instalado"
command -v docker-compose >/dev/null 2>&1 || handle_error "Docker Compose no está instalado"
command -v curl >/dev/null 2>&1 || handle_error "curl no está instalado"
command -v jq >/dev/null 2>&1 || handle_error "jq no está instalado"

# 2. Crear archivo .env si no existe
create_env_file

# 3. Iniciar los servicios
echo -e "\n${GREEN}2. Iniciando servicios...${NC}"
docker-compose up -d --build || handle_error "Error al iniciar los servicios"

# Esperar a que los servicios estén listos
wait_for_service "backend"

# 4. Probar registro de graduado
echo -e "\n${GREEN}3. Probando registro de graduado...${NC}"
GRADUADO_DATA='{
  "nombre": "Test Graduado",
  "apellido": "Test",
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

RESPONSE=$(curl -s -X POST http://localhost:3000/api/graduados/register \
  -H "Content-Type: application/json" \
  -d "$GRADUADO_DATA")

if [[ $RESPONSE == *"success"* ]]; then
  echo "✅ Registro de graduado exitoso"
  GRADUADO_ID=$(echo $RESPONSE | jq -r '.id')
else
  handle_error "Error en registro de graduado: $RESPONSE"
fi

# 5. Probar login de graduado
echo -e "\n${GREEN}4. Probando login de graduado...${NC}"
GRADUADO_LOGIN_DATA='{
  "email": "test@example.com",
  "password": "Test123!"
}'

RESPONSE=$(curl -s -X POST http://localhost:3000/api/graduados/login \
  -H "Content-Type: application/json" \
  -d "$GRADUADO_LOGIN_DATA")

if [[ $RESPONSE == *"token"* ]]; then
  echo "✅ Login de graduado exitoso"
  GRADUADO_TOKEN=$(echo $RESPONSE | jq -r '.token')
else
  handle_error "Error en login de graduado: $RESPONSE"
fi

# 6. Probar login de administrador
echo -e "\n${GREEN}5. Probando login de administrador...${NC}"
ADMIN_LOGIN_DATA='{
  "email": "admin@unicen.edu.ar",
  "password": "Admin123!"
}'

RESPONSE=$(curl -s -X POST http://localhost:3000/api/auth/login/admin \
  -H "Content-Type: application/json" \
  -d "$ADMIN_LOGIN_DATA")

if [[ $RESPONSE == *"token"* ]]; then
  echo "✅ Login de administrador exitoso"
  ADMIN_TOKEN=$(echo $RESPONSE | jq -r '.token')
else
  handle_error "Error en login de administrador: $RESPONSE"
fi

# 7. Aprobar graduado
echo -e "\n${GREEN}6. Aprobando graduado...${NC}"
RESPONSE=$(curl -s -X PUT http://localhost:3000/api/graduados/$GRADUADO_ID/estado \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"estado": "aprobado"}')

if [[ $RESPONSE == *"success"* ]]; then
  echo "✅ Graduado aprobado exitosamente"
else
  handle_error "Error al aprobar graduado: $RESPONSE"
fi

# 8. Verificar graduado en el mapa
echo -e "\n${GREEN}7. Verificando graduado en el mapa...${NC}"
RESPONSE=$(curl -s -X GET http://localhost:3000/api/graduados/mapa)

if [[ $RESPONSE == *"Test Graduado"* ]]; then
  echo "✅ Graduado encontrado en el mapa"
else
  handle_error "Error al verificar graduado en el mapa: $RESPONSE"
fi

# 9. Probar búsqueda de graduados
echo -e "\n${GREEN}8. Probando búsqueda de graduados...${NC}"
RESPONSE=$(curl -s -X GET "http://localhost:3000/api/graduados?q=Test" \
  -H "Authorization: Bearer $ADMIN_TOKEN")

if [[ $RESPONSE == *"Test Graduado"* ]]; then
  echo "✅ Búsqueda de graduados exitosa"
else
  handle_error "Error en búsqueda de graduados: $RESPONSE"
fi

# 10. Probar actualización de perfil
echo -e "\n${GREEN}9. Probando actualización de perfil...${NC}"
UPDATE_DATA='{
  "ciudad": "Azul",
  "latitud": -36.7769,
  "longitud": -59.8587
}'

RESPONSE=$(curl -s -X PUT http://localhost:3000/api/graduados/$GRADUADO_ID \
  -H "Authorization: Bearer $GRADUADO_TOKEN" \
  -H "Content-Type: application/json" \
  -d "$UPDATE_DATA")

if [[ $RESPONSE == *"success"* ]]; then
  echo "✅ Actualización de perfil exitosa"
else
  handle_error "Error al actualizar perfil: $RESPONSE"
fi

# 11. Limpieza
echo -e "\n${GREEN}10. Limpiando...${NC}"
docker-compose down

echo -e "\n${GREEN}✅ Prueba del flujo completo finalizada exitosamente${NC}" 