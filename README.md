# App Graduados

## Estructura del Proyecto

```
app-graduados/
├── frontend/                 # Aplicación React + TypeScript
├── backend/                  # Servidor Node.js + TypeScript
├── k8s/                      # Configuración de Kubernetes
├── docker/                   # Configuración de Docker
├── scripts/                  # Scripts de utilidad
├── docs/                     # Documentación
└── .github/                  # Configuración de GitHub Actions
```

## Desarrollo Local

1. Clonar el repositorio
2. Instalar dependencias:
   ```bash
   # Frontend
   cd frontend
   npm install
   
   # Backend
   cd ../backend
   npm install
   ```
3. Configurar variables de entorno:
   - Copiar `.env.example` a `.env` en frontend y backend
   - Ajustar las variables según sea necesario

4. Iniciar el entorno de desarrollo:
   ```bash
   docker-compose up
   ```

## Despliegue

Ver la documentación en `docs/deployment/` para instrucciones detalladas de despliegue.

## Documentación

- API: `docs/api/`
- Despliegue: `docs/deployment/`
