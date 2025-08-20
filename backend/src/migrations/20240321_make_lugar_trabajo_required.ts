import { QueryInterface, DataTypes } from 'sequelize'

export async function up(queryInterface: QueryInterface) {
  // Primero, establecer un valor por defecto para registros existentes que tengan lugar_trabajo NULL
  await queryInterface.sequelize.query(`
    UPDATE graduados 
    SET lugar_trabajo = 'No especificado' 
    WHERE lugar_trabajo IS NULL OR lugar_trabajo = ''
  `)

  // Luego, hacer el campo NOT NULL
  await queryInterface.changeColumn('graduados', 'lugar_trabajo', {
    type: DataTypes.STRING,
    allowNull: false,
    defaultValue: 'No especificado'
  })
}

export async function down(queryInterface: QueryInterface) {
  await queryInterface.changeColumn('graduados', 'lugar_trabajo', {
    type: DataTypes.STRING,
    allowNull: true
  })
} 