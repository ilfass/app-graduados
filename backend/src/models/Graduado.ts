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
  declare lugar_trabajo: string
  declare area_desempeno?: 'Ciencias Agrarias, de Ingeniería y de Materiales' | 'Ciencias Biológicas y de la Salud' | 'Ciencias Exactas y Naturales' | 'Ciencias Sociales y Humanidades'
  declare sector_trabajo?: 'Sector privado - Relación de dependencia' | 'Sector privado - Trabajo Independiente' | 'Sector privado - Cooperativa' | 'Sector público - Internacional' | 'Sector público - Nacional' | 'Sector público - Provincial' | 'Sector público - Local' | 'Organismos No Gubernamentales/Asociaciones Civiles - Internacional' | 'Organismos No Gubernamentales/Asociaciones Civiles - Nacional' | 'Organismos No Gubernamentales/Asociaciones Civiles - Local'
  declare vinculado_unicen?: boolean
  declare areas_vinculacion?: string
  declare interes_proyectos?: boolean
  declare linkedin?: string
  declare foto?: string
  declare estado: 'pendiente' | 'aprobado' | 'rechazado'
  declare observaciones_admin?: string
  declare latitud?: number
  declare longitud?: number
  declare created_at: Date
  declare updated_at: Date
  declare biografia?: string
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
    lugar_trabajo: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    area_desempeno: {
      type: DataTypes.ENUM(
        'Ciencias Agrarias, de Ingeniería y de Materiales',
        'Ciencias Biológicas y de la Salud',
        'Ciencias Exactas y Naturales',
        'Ciencias Sociales y Humanidades'
      ),
      allowNull: true,
    },
    sector_trabajo: {
      type: DataTypes.ENUM(
        'Sector privado - Relación de dependencia',
        'Sector privado - Trabajo Independiente',
        'Sector privado - Cooperativa',
        'Sector público - Internacional',
        'Sector público - Nacional',
        'Sector público - Provincial',
        'Sector público - Local',
        'Organismos No Gubernamentales/Asociaciones Civiles - Internacional',
        'Organismos No Gubernamentales/Asociaciones Civiles - Nacional',
        'Organismos No Gubernamentales/Asociaciones Civiles - Local'
      ),
      allowNull: true,
    },
    vinculado_unicen: {
      type: DataTypes.BOOLEAN,
      allowNull: true,
    },
    areas_vinculacion: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    interes_proyectos: {
      type: DataTypes.BOOLEAN,
      allowNull: true,
    },
    linkedin: {
      type: DataTypes.STRING,
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
    },
    biografia: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
  },
  {
    sequelize,
    modelName: 'Graduado',
    tableName: 'graduados',
    timestamps: true,
    underscored: true,
  }
) 