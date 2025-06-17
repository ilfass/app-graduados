import express from 'express'
import cors from 'cors'
import { createServer } from 'http'
import { Server } from 'socket.io'
import { sequelize } from './config/database'
import graduadoRoutes from './routes/graduadoRoutes'
import authRoutes from './routes/authRoutes'
import adminRoutes from './routes/adminRoutes'
import { env } from './config/env'

const app = express()
const httpServer = createServer(app)

// Configuración de CORS
const corsOptions = {
  origin: ['http://localhost:80', 'http://localhost', env.frontendUrl],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
}

app.use(cors(corsOptions))

// Configuración de Socket.IO
const io = new Server(httpServer, {
  cors: corsOptions,
  transports: ['websocket', 'polling']
})

// Hacer el objeto io disponible en toda la aplicación
app.set('io', io)

// Middleware
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

// Rutas
app.use('/api/auth', authRoutes)
app.use('/api/graduados', graduadoRoutes)
app.use('/api/admin', adminRoutes)

// Ruta de prueba
app.get('/', (req, res) => {
  res.json({ message: 'API de Graduados UNICEN' })
})

// Endpoint de salud
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok' })
})

// Manejo de errores
app.use((err: Error, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error(err.stack)
  res.status(500).json({ error: 'Error interno del servidor' })
})

// Función para iniciar el servidor
const startServer = async () => {
  try {
    await sequelize.sync()
    const port = typeof env.port === 'string' ? parseInt(env.port) : env.port
    httpServer.listen(port, '0.0.0.0', () => {
      console.log(`Servidor corriendo en http://0.0.0.0:${port}`)
    })
  } catch (error) {
    console.error('Error al iniciar el servidor:', error)
    process.exit(1)
  }
}

// Iniciar el servidor
startServer() 