import { Request, Response } from "express";
import { body, validationResult } from "express-validator";
import { Category } from "../models/Category";
import { generateTokens } from "../utils/token";

export const createCategory = async (req: Request, res: Response) => {
  // Валидация
  await body("name").notEmpty().trim().run(req);
  await body("description").optional().trim().run(req);

  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: "Ошибка валидации",
      errors: errors.array(),
    });
  }

  const { name, description } = req.body;

  try {
    // Проверка на существующую категорию с таким именем
    const existingCategory = await Category.findOne({ where: { name } });
    if (existingCategory) {
      return res.status(400).json({
        success: false,
        message: "Категория с таким именем уже существует",
      });
    }

    // Создание категории
    const category = await Category.create({
      name,
      description,
    });

    return res.status(201).json({
      success: true,
      message: "Категория успешно создана",
      // accessToken,
      // refreshToken,
      category: {
        id: category.id,
        name: category.name,
        description: category.description,
      },
    });
  } catch (error: any) {
    console.error("Ошибка при создании категории:", error);
    return res.status(500).json({
      success: false,
      message: "Ошибка при создании категории",
    });
  }
};

export const getCategories = async (req: Request, res: Response) => {
  try {
    const categories = await Category.findAll({
      attributes: ["id", "name", "description"],
      order: [["name", "ASC"]],
    });

    return res.json({
      success: true,
      categories,
    });
  } catch (error: any) {
    console.error("Ошибка при получении категорий:", error);
    return res.status(500).json({
      success: false,
      message: "Ошибка при получении категорий",
    });
  }
};

export const getCategoryById = async (req: Request, res: Response) => {
  const { id } = req.params;

  try {
    const category = await Category.findByPk(id, {
      include: [
        {
          association: "children",
          attributes: ["id", "name"],
        },
        {
          association: "products",
          attributes: ["id", "name", "price"],
        },
      ],
    });

    if (!category) {
      return res.status(404).json({
        success: false,
        message: "Категория не найдена",
      });
    }

    const payload = {
      id: category.id,
      name: category.name,
      description: category.description,
    };
    const { accessToken, refreshToken } = generateTokens(payload);

    return res.json({
      success: true,
      accessToken, 
      refreshToken,
      category,
    });
  } catch (error: any) {
    console.error("Ошибка при получении категории:", error);
    return res.status(500).json({
      success: false,
      message: "Ошибка при получении категории",
    });
  }
};

export const updateCategory = async (req: Request, res: Response) => {
  const { id } = req.params;

  // Валидация
  await body("name").optional().notEmpty().trim().run(req);
  await body("description").optional().trim().run(req);

  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: "Ошибка валидации",
      errors: errors.array(),
    });
  }

  try {
    const category = await Category.findByPk(id);
    if (!category) {
      return res.status(404).json({
        success: false,
        message: "Категория не найдена",
      });
    }

    const { name, description } = req.body;

    if (name !== undefined) category.name = name;
    if (description !== undefined) category.description = description;

    await category.save();

    const payload = {
      id: category.id,
      name: category.name,
      description: category.description,
    };
    const { accessToken, refreshToken } = generateTokens(payload);

    return res.json({
      success: true,
      message: "Категория успешно обновлена",
      accessToken,
      refreshToken,
      category: {
        id: category.id,
        name: category.name,
        description: category.description,
      },
    });
  } catch (error: any) {
    console.error("Ошибка при обновлении категории:", error);
    return res.status(500).json({
      success: false,
      message: "Ошибка при обновлении категории",
    });
  }
};

// export const deleteCategory = async (req: Request, res: Response) => {
//   const { id } = req.params;

//   try {
//     const category = await Category.findByPk(id);
//     if (!category) {
//       return res.status(404).json({
//         success: false,
//         message: "Категория не найдена",
//       });
//     }

//     await category.destroy();

//     const payload = {
//       id: category.id,
//       name: category.name,
//       description: category.description,
//     };
//     const { accessToken, refreshToken } = generateTokens(payload);

//     return res.json({
//       success: true,
//       message: "Категория успешно удалена",
//       accessToken, 
//       refreshToken
//     });
//   } catch (error: any) {
//     console.error("Ошибка при удалении категории:", error);
//     return res.status(500).json({
//       success: false,
//       message: "Ошибка при удалении категории",
//     });
//   }
// };
export const deleteCategory = async (req: Request, res: Response) => {
  const { id } = req.params;

  try {
    const category = await Category.findByPk(id);
    if (!category) {
      return res.status(404).json({
        success: false,
        message: "Категория не найдена",
      });
    }

    // Просто удаляем категорию, не заботясь о продуктах
    await category.destroy();

    return res.json({
      success: true,
      message: "Категория успешно удалена",
      accessToken: req.headers.authorization?.split(' ')[1], // Возвращаем текущий токен
      refreshToken: req.cookies?.refreshToken
    });
  } catch (error: any) {
    console.error("Ошибка при удалении категории:", error);
    return res.status(500).json({
      success: false,
      message: "Ошибка при удалении категории",
    });
  }
};