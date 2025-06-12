# React + TypeScript + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Babel](https://babeljs.io/) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

## Expanding the ESLint configuration

If you are developing a production application, we recommend updating the configuration to enable type-aware lint rules:

```js
export default tseslint.config({
  extends: [
    // Remove ...tseslint.configs.recommended and replace with this
    ...tseslint.configs.recommendedTypeChecked,
    // Alternatively, use this for stricter rules
    ...tseslint.configs.strictTypeChecked,
    // Optionally, add this for stylistic rules
    ...tseslint.configs.stylisticTypeChecked,
  ],
  languageOptions: {
    // other options...
    parserOptions: {
      project: ['./tsconfig.node.json', './tsconfig.app.json'],
      tsconfigRootDir: import.meta.dirname,
    },
  },
})
```

You can also install [eslint-plugin-react-x](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-x) and [eslint-plugin-react-dom](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-dom) for React-specific lint rules:

```js
// eslint.config.js
import reactX from 'eslint-plugin-react-x'
import reactDom from 'eslint-plugin-react-dom'

export default tseslint.config({
  plugins: {
    // Add the react-x and react-dom plugins
    'react-x': reactX,
    'react-dom': reactDom,
  },
  rules: {
    // other rules...
    // Enable its recommended typescript rules
    ...reactX.configs['recommended-typescript'].rules,
    ...reactDom.configs.recommended.rules,
  },
})
```

# App Graduados

## Configuración del Proyecto

### Variables de Entorno

El proyecto requiere las siguientes variables de entorno:

#### Frontend (.env)
```env
# API URLs
VITE_API_URL=/api                    # URL base para las llamadas a la API
VITE_SOCKET_URL=/socket.io           # URL para la conexión WebSocket

#### Backend (.env)
```env
# Servidor
PORT=3000                            # Puerto del servidor backend
JWT_SECRET=your_secret              # Secreto para firmar tokens JWT

# Base de Datos (SQLite)
DB_PATH=/app/data/database.sqlite    # Ruta al archivo de la base de datos

# Email
SMTP_USER=your_user                 # Usuario SMTP
SMTP_PASS=your_pass                 # Contraseña SMTP
SMTP_HOST=smtp.gmail.com            # Servidor SMTP
SMTP_PORT=587                       # Puerto SMTP
SMTP_SECURE=false                   # Usar SSL/TLS
SMTP_FROM=your@email.com           # Email remitente

# URLs
FRONTEND_URL=https://your-domain.com # URL del frontend
ADMIN_EMAIL=admin@example.com       # Email del administrador
```

### Desarrollo Local

1. Clonar el repositorio
2. Instalar dependencias:
   ```bash
   npm install
   ```
3. Copiar `.env.example` a `.env` y configurar las variables
4. Iniciar el servidor de desarrollo:
   ```bash
   npm run dev
   ```

### Producción

1. Construir la aplicación:
   ```bash
   npm run build
   ```
2. Configurar las variables de entorno en el servidor
3. Iniciar el servidor:
   ```bash
   npm start
   ```

### Kubernetes

La aplicación está configurada para ejecutarse en Kubernetes:

1. Namespace: `web-internacionales-appgraduados`
2. Servicios:
   - Frontend: `graduados-frontend`
   - Backend: `graduados-backend`
3. Almacenamiento:
   - PVC: `graduados-db-pvc` (2Gi)
4. Ingress:
   - Host: `internacionalesgraduados.unicen.edu.ar`
   - Rutas:
     - `/api/*` → Backend
     - `/socket.io/*` → Backend
     - `/*` → Frontend
