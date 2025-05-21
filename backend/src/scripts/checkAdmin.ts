import { sequelize } from '../config/database';
import { AdministradorModel } from '../models/Administrador';

async function checkAdmin() {
  try {
    await sequelize.sync();

    const admin = await AdministradorModel.findByEmail('admin@unicen.edu.ar');

    if (admin) {
      console.log('El administrador existe en la base de datos:');
      console.log('ID:', admin.id);
      console.log('Nombre:', admin.nombre);
      console.log('Apellido:', admin.apellido);
      console.log('Email:', admin.email);
    } else {
      console.log('El administrador NO existe en la base de datos');
    }

    process.exit(0);
  } catch (error) {
    console.error('Error al verificar el administrador:', error);
    process.exit(1);
  }
}

checkAdmin(); 