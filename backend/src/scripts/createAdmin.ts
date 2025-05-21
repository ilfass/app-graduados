import { sequelize } from '../config/database';
import { AdministradorModel } from '../models/Administrador';

async function createAdmin() {
  try {
    await sequelize.sync();

    const adminExists = await AdministradorModel.findByEmail('admin@unicen.edu.ar');

    if (adminExists) {
      console.log('El administrador ya existe, eliminando...');
      await AdministradorModel.delete(adminExists.id!);
    }

    const password = 'admin123';
    console.log('Contraseña original:', password);

    const admin = await AdministradorModel.create({
      nombre: 'Admin',
      apellido: 'UNICEN',
      email: 'admin@unicen.edu.ar',
      password: password
    });

    console.log('Administrador creado exitosamente:', admin);
    process.exit(0);
  } catch (error) {
    console.error('Error al crear el administrador:', error);
    process.exit(1);
  }
}

createAdmin(); 