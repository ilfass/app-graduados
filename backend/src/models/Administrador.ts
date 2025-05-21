import { Model, DataTypes } from 'sequelize'
import { sequelize } from '../config/database'
import bcrypt from 'bcryptjs'

export interface AdministradorAttributes {
  id: number
  nombre: string
  apellido: string
  email: string
  password: string
  createdAt?: Date
  updatedAt?: Date
}

export class Administrador extends Model<AdministradorAttributes> implements AdministradorAttributes {
  public id!: number
  public nombre!: string
  public apellido!: string
  public email!: string
  public password!: string
  public readonly createdAt!: Date
  public readonly updatedAt!: Date
}

Administrador.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true
    },
    nombre: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    apellido: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
      validate: {
        isEmail: true
      }
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false
    },
  },
  {
    sequelize,
    tableName: 'administradores',
  }
)

export class AdministradorModel {
  // Crear un nuevo administrador
  static async create(admin: Omit<AdministradorAttributes, 'id' | 'createdAt' | 'updatedAt'>): Promise<AdministradorAttributes> {
    const hashedPassword = await bcrypt.hash(admin.password, 10)

    const result = await sequelize.query(
      'INSERT INTO administradores (nombre, apellido, email, password) VALUES (?, ?, ?, ?) RETURNING *',
      {
        replacements: [admin.nombre, admin.apellido, admin.email, hashedPassword]
      }
    )

    return result[0][0]
  }

  // Obtener un administrador por email
  static async findByEmail(email: string): Promise<AdministradorAttributes | null> {
    const result = await sequelize.query(
      'SELECT * FROM administradores WHERE email = ?',
      {
        replacements: [email]
      }
    )

    return result[0][0] as AdministradorAttributes | null
  }

  // Verificar contraseña
  static async verifyPassword(admin: AdministradorAttributes, password: string): Promise<boolean> {
    return await bcrypt.compare(password, admin.password)
  }

  // Actualizar contraseña
  static async updatePassword(id: number, newPassword: string): Promise<boolean> {
    const hashedPassword = await bcrypt.hash(newPassword, 10)

    const result = await sequelize.query(
      'UPDATE administradores SET password = ? WHERE id = ? RETURNING *',
      {
        replacements: [hashedPassword, id]
      }
    )

    return result[0].length > 0
  }

  // Eliminar un administrador
  static async delete(id: number): Promise<boolean> {
    const result = await sequelize.query(
      'DELETE FROM administradores WHERE id = ? RETURNING *',
      {
        replacements: [id]
      }
    )

    return result[0].length > 0
  }
} 