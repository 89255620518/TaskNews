
const { sequelize } = require("../config/config.cjs");
const { initializeUserModels, User } = require("./Users.cjs");
const { initializeCategoryModels, Category } = require("./Category.cjs");
const { initializeProductModels, Product } = require("./Products.cjs");
const { initializeCartModels, Cart, initializeCartItemModels, CartItem } = require("./Cart.cjs");
const { initializeOrderItemModel, OrderItem } = require("./OrderItems.cjs");
const { initializeOrderModel, Order } = require("./Orders.cjs");

async function initializeModels() {
    initializeUserModels(sequelize);
    initializeCategoryModels(sequelize);
    initializeProductModels(sequelize);
    initializeCartModels(sequelize);
    initializeCartItemModels(sequelize);
    initializeOrderItemModel(sequelize);
    initializeOrderModel(sequelize);

    try {
        // Для разработки можно использовать { force: true } для пересоздания таблиц
        // В продакшене используйте { alter: true } или миграции
        await sequelize.sync({ alter: true });
    } catch (error) {
        console.error('Ошибка синхронизации моделей с БД:', error);
        throw error;
    }

    const models = {
        User,
        Category,
        Product,
        Cart,
        CartItem,
        Order,
        OrderItem,
    };

    Object.values(models).forEach((model) => {
        if (model.associate) {
            model.associate(models);
        }
    });

    return models;
}

module.exports = { initializeModels };