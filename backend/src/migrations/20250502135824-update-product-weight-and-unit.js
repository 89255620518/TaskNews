"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.changeColumn("products", "weight", {
      type: Sequelize.DECIMAL(10, 2),
      allowNull: false,
      defaultValue: 0,
    });

    await queryInterface.addColumn("products", "unit", {
      type: Sequelize.STRING(10),
      allowNull: false,
      defaultValue: "г",
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.changeColumn("products", "weight", {
      type: Sequelize.INTEGER,
      allowNull: false,
      defaultValue: 0,
    });

    await queryInterface.removeColumn("products", "unit");
  },
};