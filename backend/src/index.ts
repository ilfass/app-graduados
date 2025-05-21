import express from 'express'
import cors from 'cors'
import { sequelize } from './config/database'
import graduadoRoutes from './routes/graduadoRoutes'
import authRoutes from './routes/authRoutes'
import adminRoutes from './routes/adminRoutes'

const app = express()

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
const PORT = process.env.PORT || 3000
app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`)
}) 