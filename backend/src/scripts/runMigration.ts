import { sequelize } from '../config/database'
import { up } from '../migrations/add_coordinates'

async function runMigration() {
  try {
    await up(sequelize.getQueryInterface())
    console.log('Migración completada exitosamente')
    process.exit(0)
  } catch (error) {
    console.error('Error al ejecutar la migración:', error)
    process.exit(1)
  }
}

runMigration() 