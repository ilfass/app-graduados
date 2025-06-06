import { Sequelize } from 'sequelize'
import { env } from './env'
import path from 'path'
import fs from 'fs'

// Asegurar que el directorio de la base de datos existe
const dbPath = path.join(__dirname, '../../database.sqlite')
const dbDir = path.dirname(dbPath)

if (!fs.existsSync(dbDir)) {
  fs.mkdirSync(dbDir, { recursive: true })
}

export const sequelize = new Sequelize({
  dialect: 'sqlite',
  storage: dbPath,
  logging: false,
  sync: { force: false }
})

// Función para sincronizar la base de datos
export const syncDatabase = async () => {
  try {
    await sequelize.sync()
    console.log('Base de datos sincronizada correctamente')
  } catch (error) {
    console.error('Error al sincronizar la base de datos:', error)
    throw error
  }
} 