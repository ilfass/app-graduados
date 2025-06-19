import express from 'express'
import cors from 'cors'
import path from 'path'
import graduadoRoutes from './routes/graduadoRoutes'
import adminRoutes from './routes/adminRoutes'

const app = express()

app.use(cors())
app.use(express.json())

// Servir archivos estáticos desde la carpeta uploads
app.use('/uploads', express.static(path.join(__dirname, '../uploads')))

// Rutas
app.use('/api/graduados', graduadoRoutes)
app.use('/api/admin', adminRoutes)

export default app 