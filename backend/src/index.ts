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
const io = new Server(httpServer, {
  cors: {
    origin: env.frontendUrl,
    methods: ['GET', 'POST']
  }
})

// Hacer el objeto io disponible en toda la aplicación
app.set('io', io)

// Middleware
app.use(cors())
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

// Rutas
app.use('/api/graduados', graduadoRoutes)
app.use('/api/auth', authRoutes)
app.use('/api/admin', adminRoutes)

// Ruta de prueba
app.get('/', (req, res) => {
  res.json({ message: 'API de Graduados UNICEN' })
})

// Manejo de errores
app.use((err: Error, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error(err.stack)
  res.status(500).json({ error: 'Error interno del servidor' })
})

// Sincronizar base de datos
sequelize.sync()
  .then(() => {
    console.log('Base de datos sincronizada correctamente')
  })
  .catch((error) => {
    console.error('Error al sincronizar la base de datos:', error)
  })

// Iniciar servidor
const PORT = env.port || 3000
httpServer.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`)
}) 