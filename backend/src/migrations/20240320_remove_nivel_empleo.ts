import { QueryInterface, DataTypes } from 'sequelize'

export async function up(queryInterface: QueryInterface) {
  await queryInterface.removeColumn('graduados', 'nivel_empleo')
}

export async function down(queryInterface: QueryInterface) {
  await queryInterface.addColumn('graduados', 'nivel_empleo', {
    type: DataTypes.ENUM('Internacional', 'Nacional', 'Local'),
    allowNull: true
  })
} 