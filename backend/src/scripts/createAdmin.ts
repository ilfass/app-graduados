import { sequelize } from '../config/database';
import { Administrador } from '../models/Administrador';
import bcrypt from 'bcryptjs';

async function createAdmin() {
  try {
    await sequelize.sync();

    const adminExists = await Administrador.findOne({
      where: { email: 'admin@unicen.edu.ar' }
    });

    if (adminExists) {
      console.log('El administrador ya existe');
      process.exit(0);
    }

    const hashedPassword = await bcrypt.hash('admin123', 10);

    await Administrador.create({
      nombre: 'Admin',
      apellido: 'UNICEN',
      email: 'admin@unicen.edu.ar',
      password: hashedPassword
    });

    console.log('Administrador creado exitosamente');
    process.exit(0);
  } catch (error) {
    console.error('Error al crear el administrador:', error);
    process.exit(1);
  }
}

createAdmin(); 