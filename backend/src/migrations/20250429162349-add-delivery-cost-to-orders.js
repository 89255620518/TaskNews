'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('orders', 'deliveryCost', {
      type: Sequelize.DECIMAL(10, 2), // Число с 2 знаками после запятой
      allowNull: false,               // Обязательное поле
      defaultValue: 0.00              // Значение по умолчанию
    });
  },

  async down(queryInterface) {
    await queryInterface.removeColumn('orders', 'deliveryCost');
  }
};