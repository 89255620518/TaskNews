'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.removeColumn('products', 'sku');
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.addColumn('products', 'sku', {
      type: Sequelize.TEXT,
      allowNull: true,
    });
  }
};