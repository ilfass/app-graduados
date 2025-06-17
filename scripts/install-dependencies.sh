#!/bin/bash

# Colores para output
GREEN='\033[0;32m'
RED='\033[0;31m'
NC='\033[0m'

echo "🔧 Instalando dependencias del sistema..."

# Verificar si estamos en Ubuntu/Debian
if [ -f /etc/debian_version ]; then
    # Actualizar repositorios
    echo "Actualizando repositorios..."
    sudo apt-get update

    # Instalar Docker
    echo "Instalando Docker..."
    sudo apt-get install -y docker.io

    # Instalar Docker Compose
    echo "Instalando Docker Compose..."
    sudo apt-get install -y docker-compose

    # Instalar curl
    echo "Instalando curl..."
    sudo apt-get install -y curl

    # Instalar jq para procesamiento JSON
    echo "Instalando jq..."
    sudo apt-get install -y jq

    # Agregar usuario al grupo docker
    echo "Agregando usuario al grupo docker..."
    sudo usermod -aG docker $USER

    echo -e "\n${GREEN}✅ Dependencias instaladas${NC}"
    echo -e "\n${RED}⚠️ IMPORTANTE: Por favor, cierra sesión y vuelve a iniciar sesión para que los cambios de grupo surtan efecto${NC}"
else
    echo -e "${RED}❌ Este script solo está soportado en sistemas Ubuntu/Debian${NC}"
    exit 1
fi 