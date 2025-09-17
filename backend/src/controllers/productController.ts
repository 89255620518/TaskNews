import { Request, Response } from "express";
import { body, validationResult } from "express-validator";
import { Product } from "../models/Product";
import { Category } from "../models/Category";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { createRequire } from "module";


const requires = createRequire(import.meta.url);
const { sequelize } = requires("../config/config.cjs"); 

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const createProduct = async (req: Request, res: Response) => {
  // Валидация
  await body("name").notEmpty().trim().run(req);
  await body("description").notEmpty().trim().run(req);
  await body("price").isFloat({ min: 0 }).toFloat().run(req);
  await body("quantity").isInt({ min: 0 }).toInt().run(req);
  await body("weight").isInt({ min: 0 }).toInt().run(req);
  await body("unit").notEmpty().trim().run(req);
  await body("categoryId").isInt().toInt().run(req);

  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    if (req.file) {
      fs.unlinkSync(req.file.path);
    }
    return res.status(400).json({
      success: false,
      message: "Ошибка валидации",
      errors: errors.array(),
    });
  }

  const { name, description, price, quantity, weight, unit, categoryId } = req.body;

  try {
    // Проверка существования категории
    const category = await Category.findByPk(categoryId);
    if (!category) {
      if (req.file) {
        fs.unlinkSync(req.file.path);
      }
      return res.status(400).json({
        success: false,
        message: "Указанная категория не существует",
      });
    }

    // Обработка загруженного изображения
    let imageUrl = null;
    if (req.file) {
      imageUrl = `${req.protocol}://${req.get('host')}/uploads/products/${req.file.filename}`;
    }
    

    // Создание товара
    const product = await Product.create({
      name,
      description,
      price,
      quantity,
      weight,
      unit,
      categoryId,
      imageUrl,
    });

    return res.status(201).json({
      success: true,
      message: "Товар успешно создан",
      product: {
        id: product.id,
        name: product.name,
        description: product.description,
        price: product.price,
        weight: product.weight,
        unit: product.unit,
        quantity: product.quantity,
        categoryId: product.categoryId,
        imageUrl: imageUrl,
      },
    });
  } catch (error: any) {
    console.error("Ошибка при создании товара:", error);
    if (req.file) {
      fs.unlinkSync(req.file.path);
    }
    return res.status(500).json({
      success: false,
      message: "Ошибка при создании товара",
      error: error.message,
    });
  }
};

export const getProducts = async (req: Request, res: Response) => {
  try {
    const { categoryId } = req.query;

    const where: any = {};
    if (categoryId) where.categoryId = categoryId;

    const products = await Product.findAll({
      where,
      include: [
        {
          association: "category",
          attributes: ["id", "name"],
        },
      ],
      order: [["name", "ASC"]],
    });

    return res.json({
      success: true,
      products,
    });
  } catch (error: any) {
    console.error("Ошибка при получении товаров:", error);
    return res.status(500).json({
      success: false,
      message: "Ошибка при получении товаров",
    });
  }
};

export const getProductById = async (req: Request, res: Response) => {
  const { id } = req.params;

  try {
    const product = await Product.findByPk(id, {
      include: [
        {
          association: "category",
          attributes: ["id", "name", "weight", "unit", "description"],
        },
      ],
    });

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Товар не найден",
      });
    }

    return res.json({
      success: true,
      product,
    });
  } catch (error: any) {
    console.error("Ошибка при получении товара:", error);
    return res.status(500).json({
      success: false,
      message: "Ошибка при получении товара",
    });
  }
};

export const updateProduct = async (req: Request, res: Response) => {
  const { id } = req.params;

  // Валидация
  await body("name").optional().notEmpty().trim().run(req);
  await body("description").optional().notEmpty().trim().run(req);
  await body("price").optional().isFloat({ min: 0 }).toFloat().run(req);
  await body("quantity").optional().isInt({ min: 0 }).toInt().run(req);
  await body("weight").optional().isInt({ min: 0 }).toInt().run(req);
  await body("unit").optional().notEmpty().trim().run(req);
  await body("categoryId").optional().isInt().toInt().run(req);
  await body("imageUrl").optional().isURL().run(req);

  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: "Ошибка валидации",
      errors: errors.array(),
    });
  }

  try {
    const product = await Product.findByPk(id);
    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Товар не найден",
      });
    }

    const { name, description, price, quantity, categoryId, weight, unit, imageUrl } = req.body;

    // Проверка существования категории (если указана)
    if (categoryId !== undefined) {
      const category = await Category.findByPk(categoryId);
      if (!category) {
        return res.status(400).json({
          success: false,
          message: "Указанная категория не существует",
        });
      }
      product.categoryId = categoryId;
    }

    if (name !== undefined) product.name = name;
    if (description !== undefined) product.description = description;
    if (price !== undefined) product.price = price;
    if (quantity !== undefined) product.quantity = quantity;
    if (weight !== undefined) product.weight = weight;
    if (unit !== undefined) product.unit = unit;
    if (imageUrl !== undefined) product.imageUrl = imageUrl;

    await product.save();

    return res.json({
      success: true,
      message: "Товар успешно обновлен",
      product: {
        id: product.id,
        name: product.name,
        description: product.description,
        price: product.price,
        quantity: product.quantity,
        weight: product.weight,
        unit: product.unit,
        categoryId: product.categoryId,
        imageUrl: product.imageUrl,
      },
    });
  } catch (error: any) {
    console.error("Ошибка при обновлении товара:", error);
    return res.status(500).json({
      success: false,
      message: "Ошибка при обновлении товара",
    });
  }
};

// export const deleteProduct = async (req: Request, res: Response) => {
//   const { id } = req.params;

//   try {
//     const product = await Product.findByPk(id);
//     if (!product) {
//       return res.status(404).json({
//         success: false,
//         message: "Товар не найден",
//       });
//     }

//     await product.destroy();

//     return res.json({
//       success: true,
//       message: "Товар успешно удален",
//     });
//   } catch (error: any) {
//     console.error("Ошибка при удалении товара:", error);
//     return res.status(500).json({
//       success: false,
//       message: "Ошибка при удалении товара",
//     });
//   }
// };
export const deleteProduct = async (req: Request, res: Response) => {
  const { id } = req.params;
  
  // Получаем экземпляр sequelize
  const transaction = await sequelize.transaction();

  try {
    const product = await Product.findByPk(id, { transaction });
    if (!product) {
      await transaction.rollback();
      return res.status(404).json({
        success: false,
        message: "Товар не найден",
      });
    }

    // Вариант 1: Если каскадное удаление работает, этого достаточно
    await product.destroy({ transaction });
    
    // Вариант 2: Явное удаление (если каскад не работает)
    // await CartItem.destroy({
    //   where: { productId: id },
    //   transaction
    // });
    // await product.destroy({ transaction });

    await transaction.commit();

    return res.json({
      success: true,
      message: "Товар и связанные элементы корзины успешно удалены",
    });
  } catch (error: any) {
    await transaction.rollback();
    console.error("Ошибка при удалении товара:", error);
    return res.status(500).json({
      success: false,
      message: "Ошибка при удалении товара",
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};