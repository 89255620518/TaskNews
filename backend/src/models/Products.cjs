const { Model, DataTypes } = require("sequelize");

class Product extends Model {
    static associate(models) {
        Product.belongsTo(models.Category, {
            foreignKey: 'categoryId',
            as: 'category'
        });
    }
}

const initializeProductModels = (sequelize) => {
    Product.init(
        {
            id: {
                type: DataTypes.INTEGER,
                autoIncrement: true,
                primaryKey: true,
            },
            name: {
                type: DataTypes.STRING,
                allowNull: false,
                validate: {
                    notEmpty: true,
                },
            },
            description: {
                type: DataTypes.TEXT,
                allowNull: false,
            },
            price: {
                type: DataTypes.DECIMAL(10, 2),
                allowNull: false,
                validate: {
                    isDecimal: true,
                    min: 0,
                },
            },
            quantity: {
                type: DataTypes.INTEGER,
                allowNull: false,
                defaultValue: 0,
                validate: {
                    isInt: true,
                    min: 0,
                },
            },
            weight: {
                type: DataTypes.INTEGER,
                allowNull: false,
                defaultValue: 0,
                validate: {
                    isInt: true,
                    min: 0,
                },
            },
            unit: {
                type: DataTypes.STRING(10),
                allowNull: false,
                defaultValue: 'г',
                validate: {
                    isIn: [["кг", "г", "мл", "л"]], // Исправлено с isInt на isIn
                },
            },
            categoryId: {
                type: DataTypes.INTEGER,
                allowNull: false,
                references: {
                    model: 'categories', // Исправлено на lowercase
                    key: 'id'
                },
            },
            imageUrl: {
                type: DataTypes.STRING,
                allowNull: true,
                validate: {
                    notEmpty: {
                        msg: "imageUrl не должен быть пустым"
                    },
                },
            },
        },
        {
            sequelize,
            modelName: 'Product', // Исправлено на singular
            tableName: "products",
            timestamps: true,
            underscored: true,
        }
    )

    return Product;
};

module.exports = { Product, initializeProductModels }