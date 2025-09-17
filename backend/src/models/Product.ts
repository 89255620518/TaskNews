import { Model, DataTypes, Optional, Sequelize } from "sequelize";

interface ProductAttributes {
  id: number;
  name: string;
  description: string;
  price: number;
  quantity: number;
  categoryId: number;
  weight: number;
  unit: string;
  imageUrl?: string | null;
}

interface ProductCreationAttributes extends Optional<ProductAttributes, "id" | "imageUrl"> {}

class Product extends Model<ProductAttributes, ProductCreationAttributes> 
  implements ProductAttributes {
  public id!: number;
  public name!: string;
  public description!: string;
  public price!: number;
  public quantity!: number;
  public categoryId!: number;
  public weight!: number;
  public unit!: string;
  public imageUrl?: string | null;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;

  static associate(models: any) {
    Product.belongsTo(models.Category, {
      foreignKey: 'categoryId',
      as: 'category'
    });
  }
}

const initializeProductModel = (sequelize: Sequelize) => {
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
        defaultValue: "г",  // По умолчанию граммы
        validate: {
          isIn: [["кг", "г", "мл", "л"]],  // Разрешенные единицы
        },
      },
      categoryId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: 'categories',
          key: 'id'
        }
      },
      imageUrl: {
        type: DataTypes.STRING,
        allowNull: true,
        validate: {
          // Убираем isUrl
          notEmpty: {
            msg: "imageUrl не должен быть пустым"
          }
        }
      }
    },
    {
      sequelize,
      modelName: "Product",
      tableName: "products",
      timestamps: true,
    }
  );

  return Product;
};

export { initializeProductModel, Product };