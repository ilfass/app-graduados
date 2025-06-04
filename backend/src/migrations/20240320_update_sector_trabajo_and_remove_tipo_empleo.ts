import { QueryInterface, DataTypes } from 'sequelize'

export async function up(queryInterface: QueryInterface) {
  // Primero eliminamos la columna tipo_empleo
  await queryInterface.removeColumn('graduados', 'tipo_empleo')

  // Luego actualizamos la columna sector_trabajo
  await queryInterface.removeColumn('graduados', 'sector_trabajo')
  await queryInterface.addColumn('graduados', 'sector_trabajo', {
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
    allowNull: true
  })
}

export async function down(queryInterface: QueryInterface) {
  // Restauramos la columna tipo_empleo
  await queryInterface.addColumn('graduados', 'tipo_empleo', {
    type: DataTypes.ENUM(
      'Relación de dependencia',
      'Trabajo Independiente',
      'Cooperativa',
      'Internacional',
      'Nacional',
      'Provincial',
      'Local'
    ),
    allowNull: true
  })

  // Restauramos la columna sector_trabajo a su estado anterior
  await queryInterface.removeColumn('graduados', 'sector_trabajo')
  await queryInterface.addColumn('graduados', 'sector_trabajo', {
    type: DataTypes.ENUM(
      'Sector privado - Relación de dependencia',
      'Sector privado - Trabajo Independiente',
      'Sector privado - Cooperativa',
      'Sector público - Internacional',
      'Sector público - Nacional',
      'Sector público - Provincial',
      'Sector público - Local'
    ),
    allowNull: true
  })
} 