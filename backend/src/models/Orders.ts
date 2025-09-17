import { Model, DataTypes, Optional, Sequelize } from "sequelize";

export type OrderStatus = "pending" | "paid" | "failed" | "completed" | "processing_payment";

interface OrderAttributes {
  id: number;
  userId: number;
  totalAmount: number;
  deliveryAddress: string;
  deliveryTime: Date;
  deliveryCost: number;
  status: OrderStatus;
  paykeeperId?: string | null;
  paidAt?: Date | null;
  createdAt?: Date;
  updatedAt?: Date;
}

interface OrderCreationAttributes extends Optional<OrderAttributes, "id" | "paykeeperId" | "paidAt" | "createdAt" | "updatedAt"> {}

class Order extends Model<OrderAttributes, OrderCreationAttributes> implements OrderAttributes {
  public id!: number;
  public userId!: number;
  public totalAmount!: number;
  public deliveryAddress!: string;
  public deliveryTime!: Date;
  public deliveryCost!: number;
  public status!: OrderStatus;
  public paykeeperId?: string | null;
  public paidAt?: Date | null;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
  public items?: any;

  static associate(models: any) {
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

const initializeOrderModel = (sequelize: Sequelize) => {
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
      },
      paidAt: {
        type: DataTypes.DATE,
        allowNull: true,
        validate: {
          isDate: true // Добавлена валидация
        }
      },
    },
    {
      sequelize,
      modelName: "Order",
      tableName: "orders",
      timestamps: true,
      underscored: true, // Для согласованности с именами колонок в БД
    }
  );

  return Order;
};

export { initializeOrderModel, Order, OrderAttributes };