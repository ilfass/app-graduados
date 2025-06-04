import { QueryInterface, DataTypes } from 'sequelize'

export async function up(queryInterface: QueryInterface) {
  // Primero eliminamos la columna existente
  await queryInterface.removeColumn('graduados', 'sector_trabajo')

  // Luego la volvemos a crear con las nuevas opciones
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

export async function down(queryInterface: QueryInterface) {
  // Eliminamos la columna con las nuevas opciones
  await queryInterface.removeColumn('graduados', 'sector_trabajo')

  // Restauramos la columna con las opciones originales
  await queryInterface.addColumn('graduados', 'sector_trabajo', {
    type: DataTypes.ENUM(
      'Sector privado',
      'Sector público',
      'Organismos No Gubernamentales/Asociaciones Civiles'
    ),
    allowNull: true
  })
} 