const { Model, DataTypes } = require("sequelize");


class Category extends Model {
  static associate(models) {
    Category.hasMany(models.Product, {
      foreignKey: 'categoryId',
      as: 'products',
      onDelete: 'CASCADE', // Удаление всех продуктов при удалении категории
      hooks: true
    });
  }

  static async getAllSorted() {
    return this.findAll({
      order: [['name', 'ASC']]
    });
  }
}

const initializeCategoryModels = (sequelize) => {
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
          notEmpty: {
            msg: 'Название категории не может быть пустым'
          },
          len: {
            args: [2, 50],
            msg: 'Название категории должно быть от 2 до 50 символов'
          }
        },
        unique: {
          name: 'categories_name_unique',
          msg: 'Категория с таким названием уже существует'
        }
      },
      description: {
        type: DataTypes.TEXT,
        allowNull: true,
        validate: {
          len: {
            args: [0, 500],
            msg: 'Описание не должно превышать 500 символов'
          }
        }
      }
    },
    {
      sequelize,
      modelName: "Category",
      tableName: "categories",
      timestamps: true,
      underscored: true,
    }
  );

  return Category;
};

module.exports = {
  Category,
  initializeCategoryModels
};