import { sequelize } from '../config/database';
import { Graduado } from '../models/Graduado';

async function checkGraduados() {
  try {
    await sequelize.sync();

    const graduados = await Graduado.findAll();

    if (graduados.length > 0) {
      console.log('Graduados encontrados en la base de datos:');
      graduados.forEach(graduado => {
        console.log('------------------------');
        console.log('ID:', graduado.id);
        console.log('Nombre:', graduado.nombre);
        console.log('Apellido:', graduado.apellido);
        console.log('Email:', graduado.email);
        console.log('Carrera:', graduado.carrera);
        console.log('Año de graduación:', graduado.anio_graduacion);
        console.log('Estado:', graduado.estado);
      });
    } else {
      console.log('No hay graduados en la base de datos');
    }

    process.exit(0);
  } catch (error) {
    console.error('Error al verificar los graduados:', error);
    process.exit(1);
  }
}

checkGraduados(); 