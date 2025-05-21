import dotenv from 'dotenv'
import path from 'path'

// Cargar variables de entorno
dotenv.config({ path: path.join(__dirname, '../../.env') })

export const env = {
  // Servidor
  port: process.env.PORT || 3000,

  // Base de datos
  dbPath: process.env.DB_PATH || './database.sqlite',

  // JWT
  jwtSecret: process.env.JWT_SECRET || 'your-secret-key',

  // Email
  smtp: {
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port: parseInt(process.env.SMTP_PORT || '587'),
    secure: process.env.SMTP_SECURE === 'true',
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
    from: process.env.SMTP_FROM || 'graduados@unicen.edu.ar'
  },

  // Frontend URL
  frontendUrl: process.env.FRONTEND_URL || 'http://localhost:5173'
}

// Validar variables de entorno requeridas
const requiredEnvVars = ['JWT_SECRET', 'SMTP_USER', 'SMTP_PASS']

for (const envVar of requiredEnvVars) {
  if (!process.env[envVar]) {
    console.warn(`⚠️  Advertencia: La variable de entorno ${envVar} no está definida`)
  }
} 