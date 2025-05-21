# Backend de la Red de Graduados UNICEN

Este es el backend de la aplicación de la Red de Graduados UNICEN, desarrollado con Node.js, Express, TypeScript y SQLite.

## Requisitos

- Node.js 18 o superior
- npm 9 o superior

## Instalación

1. Clonar el repositorio
2. Instalar dependencias:
   ```bash
   npm install
   ```
3. Copiar el archivo de variables de entorno:
   ```bash
   cp .env.example .env
   ```
4. Configurar las variables de entorno en el archivo `.env`
5. Crear el administrador por defecto:
   ```bash
   npm run create-admin
   ```

## Configuración del correo electrónico

Para que las notificaciones por correo electrónico funcionen correctamente, necesitas configurar un servidor SMTP. Si usas Gmail, puedes seguir estos pasos:

1. Activar la verificación en dos pasos en tu cuenta de Gmail
2. Generar una contraseña de aplicación:
   - Ve a la configuración de tu cuenta de Google
   - Seguridad
   - Verificación en dos pasos
   - Contraseñas de aplicación
   - Genera una nueva contraseña para la aplicación
3. Usa esa contraseña en la variable `SMTP_PASS` del archivo `.env`

## Scripts disponibles

- `npm run dev`: Inicia el servidor en modo desarrollo
- `npm run build`: Compila el código TypeScript
- `npm start`: Inicia el servidor en modo producción
- `npm test`: Ejecuta las pruebas
- `npm run create-admin`: Crea el administrador por defecto

## Estructura del proyecto

```
src/
  ├── config/         # Configuración de la aplicación
  ├── controllers/    # Controladores de las rutas
  ├── middleware/     # Middleware de Express
  ├── models/         # Modelos de la base de datos
  ├── routes/         # Rutas de la API
  ├── services/       # Servicios de la aplicación
  ├── scripts/        # Scripts de utilidad
  └── index.ts        # Punto de entrada de la aplicación
```

## API Endpoints

### Graduados

- `POST /api/graduados`: Registrar un nuevo graduado
- `GET /api/graduados`: Obtener todos los graduados
- `GET /api/graduados/:id`: Obtener un graduado por ID
- `PUT /api/graduados/:id`: Actualizar un graduado
- `DELETE /api/graduados/:id`: Eliminar un graduado

### Autenticación

- `POST /api/auth/login`: Iniciar sesión
- `POST /api/auth/register`: Registrar un nuevo graduado
- `POST /api/auth/logout`: Cerrar sesión
- `POST /api/auth/reset-password`: Solicitar restablecimiento de contraseña
- `POST /api/auth/reset-password/:token`: Restablecer contraseña

### Administradores

- `POST /api/admin/login`: Iniciar sesión como administrador
- `GET /api/admin/graduados`: Obtener todos los graduados (solo administradores)
- `PUT /api/admin/graduados/:id`: Actualizar estado de un graduado
- `DELETE /api/admin/graduados/:id`: Eliminar un graduado 