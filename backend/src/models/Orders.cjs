const { Model, DataTypes } = require("sequelize");

const OrderStatus = "pending" | "paid" | "failed" | "completed" | "processing_payment";



class Order extends Model {

    static associate(models) {
        Order.belongsTo(models.User, {
            foreignKey: "userId",
            as: "users",
            onDelete: "CASCADE" // Добавлено для каскадного удаления
        });
        Order.hasMany(models.OrderItem, {
            foreignKey: "orderId",
            as: "items",
            onDelete: "CASCADE" // Добавлено для каскадного удаления
        });
    }
}

const initializeOrderModel = (sequelize) => {
    Order.init(
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
                    model: "users",
                    key: "id",
                },
            },
            totalAmount: {
                type: DataTypes.DECIMAL(10, 2),
                allowNull: false,
                validate: {
                    min: 0 // Добавлена валидация
                }
            },
            deliveryAddress: {
                type: DataTypes.STRING,
                allowNull: false,
                validate: {
                    notEmpty: true // Добавлена валидация
                }
            },
            deliveryTime: {
                type: DataTypes.DATE,
                allowNull: false,
                validate: {
                    isDate: true // Добавлена валидация
                }
            },
            deliveryCost: {
                type: DataTypes.DECIMAL(10, 2),
                defaultValue: 0,
                validate: {
                    min: 0 // Добавлена валидация
                }
            },
            status: {
                type: DataTypes.ENUM("pending", "paid", "failed", "completed", "processing_payment"),
                defaultValue: "pending",
            },
            paykeeperId: {
                type: DataTypes.STRING,
                allowNull: true,
                field: 'paykeeper_id',
            },
            paidAt: {
                type: DataTypes.DATE,
                allowNull: true,
                validate: {
                    isDate: true // Добавлена валидация
                },
                field: 'paid_at',
            },
        },
        {
            sequelize,
            modelName: "Order",
            tableName: "orders",
            timestamps: true,
            underscored: true,
            createdAt: 'created_at', // Явное указание
            updatedAt: 'updated_at', // Для согласованности с именами колонок в БД
        }
    );

    return Order;
};

module.exports = { initializeOrderModel, Order, OrderStatus };
