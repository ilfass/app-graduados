import { Model, DataTypes, Op } from 'sequelize'
import { sequelize } from '../config/database'
import { Graduado } from './Graduado'

export interface TokenAttributes {
  id: number
  graduado_id: number
  token: string
  expires_at: Date
  created_at: Date
  updated_at: Date
}

export class Token extends Model<TokenAttributes> implements TokenAttributes {
  public id!: number
  public graduado_id!: number
  public token!: string
  public expires_at!: Date
  public readonly created_at!: Date
  public readonly updated_at!: Date
}

Token.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true
    },
    graduado_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: Graduado,
        key: 'id'
      }
    },
    token: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true
    },
    expires_at: {
      type: DataTypes.DATE,
      allowNull: false
    },
    created_at: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW
    },
    updated_at: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW
    }
  },
  {
    sequelize,
    tableName: 'tokens',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at'
  }
)

// Establecer la relación con Graduado
Token.belongsTo(Graduado, { foreignKey: 'graduado_id' })
Graduado.hasMany(Token, { foreignKey: 'graduado_id' })

export class TokenModel {
  // Crear un nuevo token
  static async create(token: Omit<TokenAttributes, 'id' | 'created_at' | 'updated_at'>): Promise<TokenAttributes> {
    const result = await Token.create(token)
    return result.toJSON()
  }

  // Obtener un token por su valor
  static async findByToken(token: string): Promise<TokenAttributes | null> {
    const result = await Token.findOne({ where: { token } })
    return result ? result.toJSON() : null
  }

  // Verificar si un token es válido
  static async isValid(token: string): Promise<boolean> {
    const result = await Token.findOne({ where: { token, expires_at: { [Op.gt]: new Date() } } })
    return result !== null
  }

  // Eliminar un token
  static async delete(token: string): Promise<boolean> {
    const result = await Token.destroy({ where: { token } })
    return result > 0
  }

  // Eliminar tokens expirados
  static async deleteExpired(): Promise<number> {
    const result = await Token.destroy({ where: { expires_at: { [Op.lte]: new Date() } } })
    return result
  }
} 