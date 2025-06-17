import dotenv from 'dotenv'
import path from 'path'

// Intentar cargar variables de entorno, pero no fallar si no existe
dotenv.config({ path: path.join(__dirname, '../../.env') })

console.log('Variables de entorno cargadas:', {
  port: process.env.PORT,
  jwtSecret: process.env.JWT_SECRET ? 'Configurado' : 'No configurado',
  smtpUser: process.env.SMTP_USER ? 'Configurado' : 'No configurado',
  smtpPass: process.env.SMTP_PASS ? 'Configurado' : 'No configurado'
})

export const env = {
  // Servidor
  port: process.env.PORT || 3000,

  // Base de datos
  dbPath: process.env.DB_PATH || './database.sqlite',

  // JWT
  jwtSecret: process.env.JWT_SECRET || 'test_secret_key_123',

  // Email
  smtp: {
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port: parseInt(process.env.SMTP_PORT || '587'),
    secure: process.env.SMTP_SECURE === 'true',
    user: process.env.SMTP_USER || 'test@example.com',
    pass: process.env.SMTP_PASS || 'test_password',
    from: process.env.SMTP_FROM || 'graduados@unicen.edu.ar'
  },

  // Frontend URL
  frontendUrl: process.env.FRONTEND_URL || 'http://localhost:80'
}

// Validar variables de entorno requeridas
const requiredEnvVars = ['JWT_SECRET', 'SMTP_USER', 'SMTP_PASS']

for (const envVar of requiredEnvVars) {
  if (!process.env[envVar]) {
    console.warn(`⚠️  Advertencia: La variable de entorno ${envVar} no está definida, usando valor por defecto`)
  }
} 