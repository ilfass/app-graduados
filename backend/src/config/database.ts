import { Sequelize } from 'sequelize'
import { env } from './env'

export const sequelize = new Sequelize({
  dialect: 'sqlite',
  storage: env.dbPath,
  logging: false
})

// Sincronizar modelos con la base de datos
export const syncDatabase = async () => {
  try {
    await sequelize.sync()
    console.log('Base de datos sincronizada correctamente')
  } catch (error) {
    console.error('Error al sincronizar la base de datos:', error)
    throw error
  }
} 