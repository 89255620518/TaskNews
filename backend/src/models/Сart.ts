// models/Cart.ts
import { Model, DataTypes, Optional, Sequelize } from "sequelize";

interface CartAttributes {
  id: number;
  userId: number;
  createdAt?: Date;
  updatedAt?: Date;
}

interface CartCreationAttributes extends Optional<CartAttributes, "id"> {}

class Cart extends Model<CartAttributes, CartCreationAttributes> 
  implements CartAttributes {
  public id!: number;
  public userId!: number;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
  items: any;

  static associate(models: any) {
    Cart.belongsTo(models.User, {
      foreignKey: 'userId',
      as: 'user'
    });
    Cart.hasMany(models.CartItem, {
      foreignKey: 'cartId',
      as: 'items'
    });
  }
}

const initializeCartModel = (sequelize: Sequelize) => {
  Cart.init(
    {
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      userId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: 'users',
          key: 'id'
        }
      }
    },
    {
      sequelize,
      modelName: "Cart",
      tableName: "carts",
      timestamps: true,
    }
  );

  return Cart;
};

// Модель для элементов корзины
interface CartItemAttributes {
  id: number;
  cartId: number;
  productId: number;
  quantity: number;
  priceAtAddition: number; // цена на момент добавления в корзину
}

interface CartItemCreationAttributes extends Optional<CartItemAttributes, "id"> {}

class CartItem extends Model<CartItemAttributes, CartItemCreationAttributes> 
  implements CartItemAttributes {
  public id!: number;
  public cartId!: number;
  public productId!: number;
  public quantity!: number;
  public priceAtAddition!: number;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
  product: any;

  static associate(models: any) {
    CartItem.belongsTo(models.Cart, {
      foreignKey: 'cartId',
      as: 'cart'
    });
    CartItem.belongsTo(models.Product, {
      foreignKey: 'productId',
      as: 'product'
    });
  }
}

const initializeCartItemModel = (sequelize: Sequelize) => {
  CartItem.init(
    {
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      cartId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: 'carts',
          key: 'id'
        }
      },
      productId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: 'products',
          key: 'id'
        },
        onDelete: 'CASCADE'
      },
      quantity: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 1,
        validate: {
          isInt: true,
          min: 1
        }
      },
      priceAtAddition: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
        validate: {
          isDecimal: true,
          min: 0
        }
      }
    },
    {
      sequelize,
      modelName: "CartItem",
      tableName: "cart_items",
      timestamps: true,
    }
  );

  return CartItem;
};

export { initializeCartModel, Cart, initializeCartItemModel, CartItem };