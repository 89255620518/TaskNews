import { initializeUserModel, User } from "./User";
import { initializeCategoryModel, Category } from "./Category";
import { initializeProductModel, Product } from "./Product";
import { createRequire } from "module";
import { initializeCartItemModel, CartItem, initializeCartModel, Cart } from "./Сart";
import { initializeOrderModel, Order } from "./Orders";
import { initializeOrderItemModel, OrderItem } from "./OrderItems";


const requires = createRequire(import.meta.url);
const { sequelize } = requires("../config/config.cjs"); 

export const initializeModels = () => {
  initializeUserModel(sequelize);
  initializeCategoryModel(sequelize);
  initializeProductModel(sequelize);
  initializeCartModel(sequelize);
  initializeCartItemModel(sequelize);
  initializeOrderModel(sequelize);
  initializeOrderItemModel(sequelize);

  const models = {
    User,
    Product,
    Category,
    Cart,
    CartItem,
    Order,
    OrderItem,
  };

  // Установка связей между моделями
  Object.values(models).forEach((model: any) => {
    if (model.associate) {
      model.associate(models);
    }
  });

  return models;
};

export type Models = ReturnType<typeof initializeModels>;
