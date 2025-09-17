module.exports = {
  async up(queryInterface, Sequelize) {
    // Проверяем существование колонки (защита от повторного выполнения)
    const tableInfo = await queryInterface.describeTable('products');
    if (!tableInfo.weight) {
      await queryInterface.addColumn('products', 'weight', {
        type: Sequelize.INTEGER,
        allowNull: true,
        validate: {
          len: [10, 12]
        }
      });
    }
  },

  async down(queryInterface) {
    await queryInterface.removeColumn('products', 'weight');
  }
};
