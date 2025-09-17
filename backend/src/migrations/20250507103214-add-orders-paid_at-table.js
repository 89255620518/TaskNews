'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn("orders", "paid_at", {
      type: Sequelize.DATE, // Лучше использовать DATE для временных меток
      allowNull: true       // Обычно allowNull: true для новых колонок
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn("orders", "paid_at");
  }
};
