import { sequelize } from '../config/database';
import { Graduado } from '../models/Graduado';

async function syncDatabase() {
  try {
    await sequelize.sync({ force: true });
    console.log('✅ Base de datos sincronizada exitosamente');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error al sincronizar la base de datos:', error);
    process.exit(1);
  }
}

syncDatabase(); 