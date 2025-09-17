'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    // Проверяем существование колонки (защита от повторного выполнения)
    const tableInfo = await queryInterface.describeTable('users');
    if (!tableInfo.phone_number) {
      await queryInterface.addColumn('users', 'phone_number', {
        type: Sequelize.STRING,
        allowNull: true,
        validate: {
          len: [10, 12]
        }
      });
    }
  },

  async down(queryInterface) {
    await queryInterface.removeColumn('users', 'phone_number');
  }
};