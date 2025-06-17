#!/bin/bash

# Colores para output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${BLUE}Configuración del entorno de desarrollo${NC}\n"

# Backend .env
echo -e "${GREEN}Configurando variables de entorno del backend...${NC}"
cat > backend/.env << 'EOL'
# Servidor
PORT=3000
JWT_SECRET=test_secret_key_123

# Base de Datos (SQLite)
DB_PATH=/app/data/database.sqlite

# Email
SMTP_USER=test@example.com
SMTP_PASS=test_password
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_FROM=test@example.com

# URLs
FRONTEND_URL=http://localhost:80
ADMIN_EMAIL=admin@unicen.edu.ar
EOL

# Frontend .env
echo -e "${GREEN}Configurando variables de entorno del frontend...${NC}"
cat > frontend/.env << 'EOL'
# API URLs
VITE_API_URL=http://localhost:3000/api
VITE_SOCKET_URL=http://localhost:3000/socket.io

# reCAPTCHA (opcional)
VITE_RECAPTCHA_SITE_KEY=your_recaptcha_site_key
EOL

echo -e "\n${GREEN}✅ Archivos .env configurados${NC}"
echo -e "\n${BLUE}Nota: Por favor, actualiza las siguientes variables si las necesitas:${NC}"
echo "1. VITE_RECAPTCHA_SITE_KEY en frontend/.env (si usas reCAPTCHA)"
echo "2. SMTP_USER y SMTP_PASS en backend/.env (si planeas usar el envío de emails)" 