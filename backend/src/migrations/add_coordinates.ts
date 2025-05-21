import { QueryInterface, DataTypes } from 'sequelize'

export async function up(queryInterface: QueryInterface) {
  await queryInterface.addColumn('graduados', 'latitud', {
    type: DataTypes.FLOAT,
    allowNull: true
  })
  await queryInterface.addColumn('graduados', 'longitud', {
    type: DataTypes.FLOAT,
    allowNull: true
  })
}

export async function down(queryInterface: QueryInterface) {
  await queryInterface.removeColumn('graduados', 'latitud')
  await queryInterface.removeColumn('graduados', 'longitud')
} 