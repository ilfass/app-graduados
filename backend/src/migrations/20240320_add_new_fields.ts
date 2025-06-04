import { QueryInterface, DataTypes } from 'sequelize'

export async function up(queryInterface: QueryInterface) {
  await queryInterface.addColumn('graduados', 'lugar_trabajo', {
    type: DataTypes.STRING,
    allowNull: true
  })

  await queryInterface.addColumn('graduados', 'area_desempeno', {
    type: DataTypes.ENUM(
      'Ciencias Agrarias, de Ingeniería y de Materiales',
      'Ciencias Biológicas y de la Salud',
      'Ciencias Exactas y Naturales',
      'Ciencias Sociales y Humanidades'
    ),
    allowNull: true
  })

  await queryInterface.addColumn('graduados', 'sector_trabajo', {
    type: DataTypes.ENUM(
      'Sector privado',
      'Sector público',
      'Organismos No Gubernamentales/Asociaciones Civiles'
    ),
    allowNull: true
  })

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

  await queryInterface.addColumn('graduados', 'nivel_empleo', {
    type: DataTypes.ENUM('Internacional', 'Nacional', 'Local'),
    allowNull: true
  })

  await queryInterface.addColumn('graduados', 'vinculado_unicen', {
    type: DataTypes.BOOLEAN,
    allowNull: true
  })

  await queryInterface.addColumn('graduados', 'areas_vinculacion', {
    type: DataTypes.STRING,
    allowNull: true
  })

  await queryInterface.addColumn('graduados', 'interes_proyectos', {
    type: DataTypes.BOOLEAN,
    allowNull: true
  })
}

export async function down(queryInterface: QueryInterface) {
  await queryInterface.removeColumn('graduados', 'lugar_trabajo')
  await queryInterface.removeColumn('graduados', 'area_desempeno')
  await queryInterface.removeColumn('graduados', 'sector_trabajo')
  await queryInterface.removeColumn('graduados', 'tipo_empleo')
  await queryInterface.removeColumn('graduados', 'nivel_empleo')
  await queryInterface.removeColumn('graduados', 'vinculado_unicen')
  await queryInterface.removeColumn('graduados', 'areas_vinculacion')
  await queryInterface.removeColumn('graduados', 'interes_proyectos')
} 