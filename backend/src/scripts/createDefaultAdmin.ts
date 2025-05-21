import { syncDatabase } from '../config/database'
import { Administrador } from '../models'
import bcrypt from 'bcryptjs'

const createDefaultAdmin = async () => {
  try {
    await syncDatabase()

    // Verificar si ya existe un administrador
    const existingAdmin = await Administrador.findOne({
      where: { email: 'admin@unicen.edu.ar' }
    })

    if (existingAdmin) {
      console.log('El administrador por defecto ya existe')
      return
    }

    // Crear el administrador por defecto
    const hashedPassword = await bcrypt.hash('admin123', 10)
    await Administrador.create({
      email: 'admin@unicen.edu.ar',
      password: hashedPassword
    })

    console.log('Administrador por defecto creado exitosamente')
  } catch (error) {
    console.error('Error al crear el administrador por defecto:', error)
    process.exit(1)
  }
}

createDefaultAdmin() 