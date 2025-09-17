'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.removeColumn('categories', 'parent_id');
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.addColumn('categories', 'parent_id', {
      type: Sequelize.TEXT,
      allowNull: true,
    });
  }
};
