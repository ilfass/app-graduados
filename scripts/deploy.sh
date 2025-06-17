#!/bin/bash

# Construir imágenes Docker
docker-compose build

# Desplegar en Kubernetes
kubectl apply -f k8s/shared/
kubectl apply -f k8s/backend/
kubectl apply -f k8s/frontend/
