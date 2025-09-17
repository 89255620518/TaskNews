module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.dropTable('products');
    await queryInterface.dropTable('categories');
    
  },

  async down(queryInterface, Sequelize) {
    return Promise.resolve();
  }
};