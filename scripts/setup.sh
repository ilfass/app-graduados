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
