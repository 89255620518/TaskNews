const { Model, DataTypes } = require("sequelize");

class OrderItem extends Model {
    static associate(models) {
        OrderItem.belongsTo(models.Order, {
            foreignKey: "orderId",
            as: "order",
            onDelete: "CASCADE" // Каскадное удаление
        });
    }
}

const initializeOrderItemModel = (sequelize) => {
    OrderItem.init(
        {
            id: {
                type: DataTypes.INTEGER,
                autoIncrement: true,
                primaryKey: true,
            },
            orderId: {
                type: DataTypes.INTEGER,
                allowNull: false,
                references: {
                    model: "orders",
                    key: "id",
                },
            },
            productId: {
                type: DataTypes.INTEGER,
                allowNull: false,
            },
            name: {
                type: DataTypes.STRING,
                allowNull: false,
            },
            quantity: {
                type: DataTypes.INTEGER,
                allowNull: false,
            },
            price: {
                type: DataTypes.DECIMAL(10, 2),
                allowNull: false,
            },
            total: {
                type: DataTypes.DECIMAL(10, 2),
                allowNull: false,
            },
        },
        {
            sequelize,
            modelName: "OrderItem",
            tableName: "order_items",
            timestamps: true,
            underscored: true,
        }
    );

    return OrderItem;
};

module.exports = { initializeOrderItemModel, OrderItem };