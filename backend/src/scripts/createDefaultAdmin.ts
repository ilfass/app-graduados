import { syncDatabase } from '../config/database'
import { AdministradorModel } from '../models/Administrador'
import bcrypt from 'bcryptjs'

const createDefaultAdmin = async () => {
  try {
    await syncDatabase()

    // Verificar si ya existe un administrador
    const existingAdmin = await AdministradorModel.findByEmail('relaciones.internacionales@rec.unicen.edu.ar')

    if (existingAdmin) {
      console.log('El administrador por defecto ya existe')
      return
    }

    // Crear el administrador por defecto
    await AdministradorModel.create({
      nombre: 'Admin',
      apellido: 'UNICEN',
      email: 'relaciones.internacionales@rec.unicen.edu.ar',
      password: 'internacionales1900'
    })

    console.log('Administrador por defecto creado exitosamente')
  } catch (error) {
    console.error('Error al crear el administrador por defecto:', error)
    process.exit(1)
  }
}

createDefaultAdmin() 