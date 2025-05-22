import { syncDatabase } from '../config/database'
import { AdministradorModel } from '../models/Administrador'
import bcrypt from 'bcryptjs'
import { sequelize } from '../config/database'

const updateAdmin = async () => {
  try {
    await syncDatabase()

    // Buscar el admin existente
    const existingAdmin = await AdministradorModel.findByEmail('admin@unicen.edu.ar')

    if (!existingAdmin) {
      console.log('No se encontró el administrador existente')
      return
    }

    // Actualizar las credenciales usando el método updatePassword
    const hashedPassword = await bcrypt.hash('internacionales1900', 10)
    await sequelize.query(
      'UPDATE administradores SET email = ?, password = ? WHERE id = ?',
      {
        replacements: ['relaciones.internacionales@rec.unicen.edu.ar', hashedPassword, existingAdmin.id]
      }
    )

    console.log('Administrador actualizado exitosamente')
  } catch (error) {
    console.error('Error al actualizar el administrador:', error)
    process.exit(1)
  }
}

updateAdmin() 