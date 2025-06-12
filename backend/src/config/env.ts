import dotenv from 'dotenv'
import path from 'path'

// Cargar variables de entorno
const result = dotenv.config({ path: path.join(__dirname, '../../.env') })

if (result.error) {
  console.error('Error al cargar el archivo .env:', result.error)
  process.exit(1)
}

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
  frontendUrl: process.env.FRONTEND_URL || 'local:5173'
}

// Validar variables de entorno requeridas
const requiredEnvVars = ['JWT_SECRET', 'SMTP_USER', 'SMTP_PASS']

for (const envVar of requiredEnvVars) {
  if (!process.env[envVar]) {
    console.warn(`⚠️  Advertencia: La variable de entorno ${envVar} no está definida`)
  }
} 