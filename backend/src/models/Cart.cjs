// import { Model, DataTypes } from "sequelize";
// import { createRequire } from 'module';

// const require = createRequire(import.meta.url);
// const { sequelize } = require("../config/config.cjs");

// export class Cart extends Model {
//     static associate(models) {
//         Cart.belongsTo(models.User, {
//             foreignKey: 'userId',
//             as: 'user'
//         });

//         Cart.hasMany(models.CartItem, {
//             foreignKey: 'cartId',
//             as: 'items'
//         });
//     }
// }

// export const initializeCartModels = (sequilize) => {
//     Cart.init(
//         {
//             id: {
//                 type: DataTypes.INTEGER,
//                 autoIncrement: true,
//                 primaryKey: true,
//             },

//             userId: {
//                 type: DataTypes.INTEGER,
//                 allowNull: false,
//                 references: {
//                     model: 'users',
//                     key: 'id'
//                 }
//             }
//         },

//         {
//             sequelize,
//             modelName: "Cart",
//             tableName: 'carts',
//             timestamps: true,
//         }
//     );

//     return Cart;
// }

// export class CartItem extends Model {
//     static associate(models) {
//         CartItem.belongsTo(models.Cart, {
//             foreignKey: 'cartId',
//             as: 'cart'
//         });

//         CartItem.belongsTo(models.Product, {
//             foreignKey: 'productId',
//             as: 'product'
//         })
//     }
// }

// export const initializeCartItemModels = (sequilize) => {
//     CartItem.init(
//         {
//             id: {
//                 type: DataTypes.INTEGER,
//                 autoIncrement: true,
//                 primaryKey: true,
//             },

//             cartId: {
//                 type: DataTypes.INTEGER,
//                 allowNull: false,
//                 references: {
//                     model: 'carts',
//                     key: 'id'
//                 }
//             },

//             productId: {
//                 type: DataTypes.INTEGER,
//                 allowNull: false,
//                 references: {
//                     model: 'products',
//                     key: 'id'
//                 },
//                 onDelete: 'CASCADE'
//             },

//             quantity: {
//                 type: DataTypes.INTEGER,
//                 allowNull: false,
//                 defaultValue: 1,
//                 validate: {
//                     isInt: true,
//                     min: 1
//                 }
//             },

//             priceAtAddition: {
//                 type: DataTypes.DECIMAL(10, 2),
//                 allowNull: false,
//                 validate: {
//                     isDecimal: true,
//                     min: 0
//                 }
//             },
//         },

//         {
//             sequelize,
//             modelName: "CartItem",
//             tableName: "cart_items",
//             timestamps: true,
//         }
//     );

//     return CartItem;
// };

const { Model, DataTypes } = require("sequelize");
const { createRequire } = require('module');
const { sequelize } = require("../config/config.cjs");

class Cart extends Model {
    static associate(models) {
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

function initializeCartModels(sequilize) {
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
            tableName: 'carts',
            timestamps: true,
            underscored: true,
        }
    );

    return Cart;
}

class CartItem extends Model {
    static associate(models) {
        CartItem.belongsTo(models.Cart, {
            foreignKey: 'cartId',
            as: 'cart'
        });

        CartItem.belongsTo(models.Product, {
            foreignKey: 'productId',
            as: 'product'
        })
    }
}

function initializeCartItemModels(sequilize) {
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
            },
        },

        {
            sequelize,
            modelName: "CartItem",
            tableName: "cart_items",
            timestamps: true,
            underscored: true,
        }
    );

    return CartItem;
}

module.exports = {
    Cart,
    initializeCartModels,
    CartItem,
    initializeCartItemModels
};