#!/bin/bash

# Script para desplegar la aplicación en Kubernetes
# Autor: Assistant
# Fecha: $(date)

set -e  # Salir si hay algún error

# Configuración
NAMESPACE="web-internacionales-appgraduados"
K8S_DIR="k8s"

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

# Verificar que kubectl esté disponible
check_kubectl() {
    print_status "Verificando kubectl..."
    if ! command -v kubectl &> /dev/null; then
        print_error "kubectl no está instalado o no está en el PATH"
        exit 1
    fi
    print_success "kubectl está disponible"
}

# Verificar que estemos en el directorio correcto
check_directory() {
    print_status "Verificando directorio de trabajo..."
    if [ ! -d "$K8S_DIR" ]; then
        print_error "No se encontró el directorio $K8S_DIR. Asegúrate de estar en el directorio raíz del proyecto."
        exit 1
    fi
    print_success "Directorio correcto"
}

# Verificar el contexto de Kubernetes
check_context() {
    print_status "Verificando contexto de Kubernetes..."
    CURRENT_CONTEXT=$(kubectl config current-context)
    print_status "Contexto actual: $CURRENT_CONTEXT"
    
    read -p "¿Deseas continuar con este contexto? (y/N): " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        print_warning "Operación cancelada por el usuario"
        exit 0
    fi
}

# Verificar que el namespace existe
check_namespace() {
    print_status "Verificando namespace $NAMESPACE..."
    if ! kubectl get namespace $NAMESPACE &> /dev/null; then
        print_error "El namespace $NAMESPACE no existe"
        exit 1
    fi
    print_success "Namespace $NAMESPACE existe"
}

# Aplicar configuración
apply_config() {
    print_status "Aplicando configuración..."
    kubectl apply -f $K8S_DIR/configmap.yaml
    print_success "ConfigMap aplicado"
}

# Aplicar secretos
apply_secrets() {
    print_status "Aplicando secretos..."
    kubectl apply -f $K8S_DIR/secretharbor.yaml
    print_success "Secretos aplicados"
}

# Aplicar PVC
apply_pvc() {
    print_status "Aplicando PersistentVolumeClaim..."
    kubectl apply -f $K8S_DIR/pvc.yaml
    print_success "PVC aplicado"
}

# Aplicar servicios
apply_services() {
    print_status "Aplicando servicios..."
    kubectl apply -f $K8S_DIR/services.yaml
    print_success "Servicios aplicados"
}

# Aplicar deployments
apply_deployments() {
    print_status "Aplicando deployments..."
    
    # Backend
    kubectl apply -f $K8S_DIR/backend-deployment.yaml
    print_success "Deployment del backend aplicado"
    
    # Frontend
    kubectl apply -f $K8S_DIR/frontend-deployment.yaml
    print_success "Deployment del frontend aplicado"
}

# Aplicar ingress
apply_ingress() {
    print_status "Aplicando ingress..."
    kubectl apply -f $K8S_DIR/ingress.yaml
    print_success "Ingress aplicado"
}

# Verificar el estado de los deployments
check_deployments() {
    print_status "Verificando estado de los deployments..."
    
    echo ""
    print_status "Estado del deployment del backend:"
    kubectl rollout status deployment/graduados-backend -n $NAMESPACE --timeout=300s
    
    echo ""
    print_status "Estado del deployment del frontend:"
    kubectl rollout status deployment/graduados-frontend -n $NAMESPACE --timeout=300s
}

# Mostrar información de los pods
show_pods() {
    print_status "Información de los pods:"
    kubectl get pods -n $NAMESPACE -l app=graduados-backend
    kubectl get pods -n $NAMESPACE -l app=graduados-frontend
}

# Mostrar información de los servicios
show_services() {
    print_status "Información de los servicios:"
    kubectl get services -n $NAMESPACE
}

# Mostrar información del ingress
show_ingress() {
    print_status "Información del ingress:"
    kubectl get ingress -n $NAMESPACE
}

# Función principal
main() {
    echo "=========================================="
    echo "  DESPLIEGUE EN KUBERNETES"
    echo "=========================================="
    echo ""
    
    check_kubectl
    check_directory
    check_context
    check_namespace
    
    echo ""
    print_status "Iniciando despliegue..."
    echo ""
    
    apply_config
    apply_secrets
    apply_pvc
    apply_services
    apply_deployments
    apply_ingress
    
    echo ""
    print_status "Verificando estado del despliegue..."
    echo ""
    
    check_deployments
    show_pods
    show_services
    show_ingress
    
    echo ""
    print_success "=== DESPLIEGUE COMPLETADO ==="
    echo ""
    print_status "Versión desplegada: 5.3.0"
    print_status "Namespace: $NAMESPACE"
    echo ""
    print_warning "Recuerda verificar que la aplicación esté funcionando correctamente"
    echo ""
    print_success "¡Despliegue completado exitosamente!"
}

# Ejecutar función principal
main "$@" 