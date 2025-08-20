#!/bin/bash

# Script para construir y subir las imágenes Docker
# Autor: Assistant
# Fecha: $(date)

set -e  # Salir si hay algún error

# Configuración
REGISTRY="harbor.unicen.edu.ar"
PROJECT="web"
BACKEND_IMAGE="graduados-backend"
FRONTEND_IMAGE="graduados-frontend"
VERSION="5.3.0"  # Incrementar versión para los nuevos cambios

# Colores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Función para imprimir mensajes con colores
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Verificar que Docker esté corriendo
check_docker() {
    print_status "Verificando que Docker esté corriendo..."
    if ! docker info > /dev/null 2>&1; then
        print_error "Docker no está corriendo. Por favor, inicia Docker y vuelve a intentar."
        exit 1
    fi
    print_success "Docker está corriendo"
}

# Verificar que estemos en el directorio correcto
check_directory() {
    print_status "Verificando directorio de trabajo..."
    if [ ! -f "docker-compose.yml" ]; then
        print_error "No se encontró docker-compose.yml. Asegúrate de estar en el directorio raíz del proyecto."
        exit 1
    fi
    print_success "Directorio correcto"
}

# Login al registro Harbor
login_to_registry() {
    print_status "Iniciando sesión en el registro Harbor..."
    if ! docker login $REGISTRY; then
        print_error "Error al iniciar sesión en el registro. Verifica tus credenciales."
        exit 1
    fi
    print_success "Sesión iniciada en Harbor"
}

# Construir imagen del backend
build_backend() {
    print_status "Construyendo imagen del backend..."
    
    # Construir la imagen
    docker build \
        -f docker/backend/Dockerfile \
        -t $REGISTRY/$PROJECT/$BACKEND_IMAGE:$VERSION \
        -t $REGISTRY/$PROJECT/$BACKEND_IMAGE:latest \
        .
    
    if [ $? -eq 0 ]; then
        print_success "Imagen del backend construida exitosamente"
    else
        print_error "Error al construir la imagen del backend"
        exit 1
    fi
}

# Construir imagen del frontend
build_frontend() {
    print_status "Construyendo imagen del frontend..."
    
    # Construir la imagen
    docker build \
        -f docker/frontend/Dockerfile \
        -t $REGISTRY/$PROJECT/$FRONTEND_IMAGE:$VERSION \
        -t $REGISTRY/$PROJECT/$FRONTEND_IMAGE:latest \
        .
    
    if [ $? -eq 0 ]; then
        print_success "Imagen del frontend construida exitosamente"
    else
        print_error "Error al construir la imagen del frontend"
        exit 1
    fi
}

# Subir imagen del backend
push_backend() {
    print_status "Subiendo imagen del backend..."
    
    # Subir versión específica
    docker push $REGISTRY/$PROJECT/$BACKEND_IMAGE:$VERSION
    
    if [ $? -eq 0 ]; then
        print_success "Versión $VERSION del backend subida exitosamente"
    else
        print_error "Error al subir la versión $VERSION del backend"
        exit 1
    fi
    
    # Subir tag latest
    docker push $REGISTRY/$PROJECT/$BACKEND_IMAGE:latest
    
    if [ $? -eq 0 ]; then
        print_success "Tag latest del backend subido exitosamente"
    else
        print_error "Error al subir el tag latest del backend"
        exit 1
    fi
}

# Subir imagen del frontend
push_frontend() {
    print_status "Subiendo imagen del frontend..."
    
    # Subir versión específica
    docker push $REGISTRY/$PROJECT/$FRONTEND_IMAGE:$VERSION
    
    if [ $? -eq 0 ]; then
        print_success "Versión $VERSION del frontend subida exitosamente"
    else
        print_error "Error al subir la versión $VERSION del frontend"
        exit 1
    fi
    
    # Subir tag latest
    docker push $REGISTRY/$PROJECT/$FRONTEND_IMAGE:latest
    
    if [ $? -eq 0 ]; then
        print_success "Tag latest del frontend subido exitosamente"
    else
        print_error "Error al subir el tag latest del frontend"
        exit 1
    fi
}

# Limpiar imágenes locales
cleanup() {
    print_status "Limpiando imágenes locales..."
    
    # Eliminar imágenes construidas localmente
    docker rmi $REGISTRY/$PROJECT/$BACKEND_IMAGE:$VERSION 2>/dev/null || true
    docker rmi $REGISTRY/$PROJECT/$BACKEND_IMAGE:latest 2>/dev/null || true
    docker rmi $REGISTRY/$PROJECT/$FRONTEND_IMAGE:$VERSION 2>/dev/null || true
    docker rmi $REGISTRY/$PROJECT/$FRONTEND_IMAGE:latest 2>/dev/null || true
    
    print_success "Limpieza completada"
}

# Mostrar resumen
show_summary() {
    echo ""
    print_success "=== RESUMEN DE LA OPERACIÓN ==="
    echo ""
    print_status "Versión construida: $VERSION"
    print_status "Registro: $REGISTRY"
    print_status "Proyecto: $PROJECT"
    echo ""
    print_status "Imágenes subidas:"
    echo "  - $REGISTRY/$PROJECT/$BACKEND_IMAGE:$VERSION"
    echo "  - $REGISTRY/$PROJECT/$BACKEND_IMAGE:latest"
    echo "  - $REGISTRY/$PROJECT/$FRONTEND_IMAGE:$VERSION"
    echo "  - $REGISTRY/$PROJECT/$FRONTEND_IMAGE:latest"
    echo ""
    print_warning "Recuerda actualizar las versiones en los archivos de Kubernetes:"
    echo "  - k8s/backend-deployment.yaml"
    echo "  - k8s/frontend-deployment.yaml"
    echo ""
}

# Función principal
main() {
    echo "=========================================="
    echo "  CONSTRUCCIÓN Y SUBIDA DE IMÁGENES DOCKER"
    echo "=========================================="
    echo ""
    
    check_docker
    check_directory
    login_to_registry
    
    echo ""
    print_status "Iniciando proceso de construcción y subida..."
    echo ""
    
    build_backend
    build_frontend
    
    echo ""
    print_status "Iniciando proceso de subida..."
    echo ""
    
    push_backend
    push_frontend
    
    cleanup
    show_summary
    
    print_success "¡Proceso completado exitosamente!"
}

# Ejecutar función principal
main "$@" 