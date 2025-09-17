module.exports = {
  async up(queryInterface, Sequelize) {
    // 1. Удаляем старый столбец (данные будут потеряны!)
    await queryInterface.removeColumn("products", "weight");
    
    // 2. Создаем новый столбец
    await queryInterface.addColumn("products", "weight", {
      type: Sequelize.DECIMAL(10, 2),
      allowNull: false,
      defaultValue: 0
    });

    // 3. Добавляем unit
    await queryInterface.addColumn("products", "unit", {
      type: Sequelize.STRING(10),
      allowNull: false,
      defaultValue: "г"
    });
  }
};