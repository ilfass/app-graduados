#!/bin/bash

# Colores para output
GREEN='\033[0;32m'
RED='\033[0;31m'
NC='\033[0m'

echo "🚀 Iniciando prueba del flujo completo del sistema..."

# 1. Iniciar los servicios
echo -e "\n${GREEN}1. Iniciando servicios...${NC}"
docker-compose up -d --build

# Esperar a que los servicios estén listos
echo "Esperando a que los servicios estén listos..."
sleep 10

# 2. Probar registro de graduado
echo -e "\n${GREEN}2. Probando registro de graduado...${NC}"
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

RESPONSE=$(curl -s -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d "$GRADUADO_DATA")

if [[ $RESPONSE == *"success"* ]]; then
  echo "✅ Registro de graduado exitoso"
else
  echo -e "${RED}❌ Error en registro de graduado${NC}"
  echo $RESPONSE
fi

# 3. Probar login de administrador
echo -e "\n${GREEN}3. Probando login de administrador...${NC}"
ADMIN_LOGIN_DATA='{
  "email": "admin@unicen.edu.ar",
  "password": "Admin123!"
}'

RESPONSE=$(curl -s -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d "$ADMIN_LOGIN_DATA")

if [[ $RESPONSE == *"token"* ]]; then
  echo "✅ Login de administrador exitoso"
  ADMIN_TOKEN=$(echo $RESPONSE | jq -r '.token')
else
  echo -e "${RED}❌ Error en login de administrador${NC}"
  echo $RESPONSE
fi

# 4. Aprobar graduado
echo -e "\n${GREEN}4. Aprobando graduado...${NC}"
RESPONSE=$(curl -s -X PUT http://localhost:3000/api/admin/graduados/1/estado \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"estado": "aprobado"}')

if [[ $RESPONSE == *"success"* ]]; then
  echo "✅ Graduado aprobado exitosamente"
else
  echo -e "${RED}❌ Error al aprobar graduado${NC}"
  echo $RESPONSE
fi

# 5. Verificar graduado en el mapa
echo -e "\n${GREEN}5. Verificando graduado en el mapa...${NC}"
RESPONSE=$(curl -s -X GET http://localhost:3000/api/graduados/mapa)

if [[ $RESPONSE == *"Test Graduado"* ]]; then
  echo "✅ Graduado encontrado en el mapa"
else
  echo -e "${RED}❌ Error al verificar graduado en el mapa${NC}"
  echo $RESPONSE
fi

# 6. Limpieza
echo -e "\n${GREEN}6. Limpiando...${NC}"
docker-compose down

echo -e "\n${GREEN}✅ Prueba del flujo completo finalizada${NC}" 