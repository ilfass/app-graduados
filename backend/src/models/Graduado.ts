import { Model, DataTypes } from 'sequelize'
import { sequelize } from '../config/database'

export class Graduado extends Model {
  declare id: number
  declare nombre: string
  declare apellido: string
  declare email: string
  declare password: string
  declare carrera: string
  declare anio_graduacion: number
  declare ciudad: string
  declare pais: string
  declare institucion?: string
  declare linkedin?: string
  declare biografia?: string
  declare foto?: string
  declare estado: 'pendiente' | 'aprobado' | 'rechazado'
  declare observaciones_admin?: string
  declare latitud?: number
  declare longitud?: number
  declare created_at: Date
  declare updated_at: Date
}

Graduado.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
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
        isEmail: true,
      },
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    carrera: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    anio_graduacion: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    ciudad: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    pais: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    institucion: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    linkedin: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    biografia: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    foto: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    estado: {
      type: DataTypes.ENUM('pendiente', 'aprobado', 'rechazado'),
      defaultValue: 'pendiente',
    },
    observaciones_admin: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    latitud: {
      type: DataTypes.FLOAT,
      allowNull: true,
    },
    longitud: {
      type: DataTypes.FLOAT,
      allowNull: true,
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
    modelName: 'Graduado',
    tableName: 'graduados',
    timestamps: true,
    underscored: true,
  }
) 