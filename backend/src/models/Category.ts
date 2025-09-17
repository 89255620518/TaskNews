import { Model, DataTypes, Optional, Sequelize } from "sequelize";

interface CategoryAttributes {
  id: number;
  name: string;
  description?: string | null;
  image?: string | null;
}

interface CategoryCreationAttributes extends Optional<CategoryAttributes, "id"> {}

class Category extends Model<CategoryAttributes, CategoryCreationAttributes> 
  implements CategoryAttributes {
  public id!: number;
  public name!: string;
  public description!: string | null;

  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;

  static associate(models: any) {
    Category.hasMany(models.Product, {
      foreignKey: 'categoryId',
      as: 'products'
    });
  }
}

const initializeCategoryModel = (sequelize: Sequelize) => {
  Category.init(
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
        allowNull: true,
      }
    },
    {
      sequelize,
      modelName: "Category",
      tableName: "categories",
      timestamps: true,
    }
  );

  return Category;
};

export { initializeCategoryModel, Category };