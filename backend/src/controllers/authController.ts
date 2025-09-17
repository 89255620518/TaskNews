import jwt from "jsonwebtoken";
import { Request, Response } from "express";
import { body, validationResult } from "express-validator";
import { User } from "../models/User";
import { generateTokens } from "../utils/token";

// Валидационные правила
const registrationValidation = [
  body("email").isEmail().normalizeEmail().withMessage("Некорректный email"),
  body("password")
    .isLength({ min: 6 })
    .withMessage("Пароль должен содержать минимум 6 символов"),
  body("firstName").notEmpty().trim().withMessage("Имя обязательно"),
  body("lastName").notEmpty().trim().withMessage("Фамилия обязательна"),
  body("phoneNumber")
    .optional()
    .isLength({ min: 10 })
    .withMessage("Номер телефона должен содержать минимум 10 символов"),
];

const loginValidation = [
  body("email").isEmail().normalizeEmail().withMessage("Некорректный email"),
  body("password").notEmpty().withMessage("Пароль обязателен"),
];

const updateValidation = [
  body("firstName").optional().isString().trim().withMessage("Имя должно быть строкой"),
  body("lastName").optional().isString().trim().withMessage("Фамилия должна быть строкой"),
  body("email").optional().isEmail().withMessage("Некорректный email"),
  body("phoneNumber")
    .optional()
    .isLength({ min: 10 })
    .withMessage("Номер телефона должен содержать минимум 10 символов"),
];

const handleValidationErrors = (req: Request, res: Response) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: "Ошибка валидации",
      errors: errors.array(),
    });
  }
  return null;
};

// Вспомогательная функция для безопасного возврата данных пользователя
const getSafeUserData = (user: User) => {
  const userData = user.toJSON();
  const { password, ...safeUserData } = userData;
  return safeUserData;
};

// Регистрация пользователя
export const register = [
  ...registrationValidation,
  async (req: Request, res: Response) => {
    const validationError = handleValidationErrors(req, res);
    if (validationError) return validationError;

    const { firstName, lastName, patronymic, email, password, phoneNumber } = req.body;

    try {
      // Проверка существующего пользователя
      const existingUser = await User.findOne({ where: { email } });
      if (existingUser) {
        return res.status(400).json({
          success: false,
          message: "Пользователь с этим email уже зарегистрирован",
        });
      }

      const user = await User.create({
        firstName,
        lastName,
        patronymic: patronymic || null,
        email,
        password,
        phoneNumber: phoneNumber || null,
        role: "user",
        status: "inactive",
        lastActivity: new Date(),
      });

      const payload = {
        id: user.id,
        role: user.role,
        email: user.email,
        phoneNumber: user.phoneNumber,
      };

      const { accessToken, refreshToken } = generateTokens(payload);

      return res.status(201).json({
        success: true,
        message: "Пользователь успешно зарегистрирован",
        accessToken,
        refreshToken,
        user: getSafeUserData(user),
      });
    } catch (error: any) {
      console.error("Ошибка при регистрации:", error);
      return res.status(500).json({
        success: false,
        message: "Ошибка при регистрации",
        error: process.env.NODE_ENV === "development" ? error.message : undefined,
      });
    }
  },
];

// Вход пользователя
export const login = [
  ...loginValidation,
  async (req: Request, res: Response) => {
    const validationError = handleValidationErrors(req, res);
    if (validationError) return validationError;

    const { email, password } = req.body;

    try {
      const user = await User.findOne({
        where: { email },
        attributes: { include: ["password"] },
      });

      if (!user) {
        return res.status(401).json({
          success: false,
          message: "Неверный email или пароль",
        });
      }

      const isMatch = await user.comparePassword(password);
      if (!isMatch) {
        return res.status(401).json({
          success: false,
          message: "Неверный email или пароль",
        });
      }

      await user.update({ lastActivity: new Date(), status: "active" });

      const payload = {
        id: user.id,
        role: user.role,
        email: user.email,
        phoneNumber: user.phoneNumber,
      };

      const { accessToken, refreshToken } = generateTokens(payload);

      res.json({
        success: true,
        accessToken,
        refreshToken,
        user: getSafeUserData(user),
      });
    } catch (error: any) {
      console.error("Ошибка при входе:", error);
      res.status(500).json({
        success: false,
        message: "Внутренняя ошибка сервера",
        error: process.env.NODE_ENV === "development" ? error.message : undefined,
      });
    }
  },
];

// Обновление токена
export const refresh = async (req: Request, res: Response) => {
  const { refreshToken } = req.body;

  if (!refreshToken) {
    return res.status(401).json({ 
      success: false,
      message: "Нет refresh токена" 
    });
  }

  try {
    const decoded = jwt.verify(
      refreshToken,
      process.env.JWT_REFRESH_SECRET || "refresh_secret_key"
    ) as { id: number; role: string };

    // Получаем пользователя для обновленных данных
    const user = await User.findByPk(decoded.id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "Пользователь не найден",
      });
    }

    const payload = {
      id: user.id,
      role: user.role,
      email: user.email,
      phoneNumber: user.phoneNumber,
    };
    
    const { accessToken, refreshToken: newRefreshToken } = generateTokens(payload);

    res.json({
      success: true,
      accessToken,
      refreshToken: newRefreshToken,
    });
  } catch (error) {
    res.status(403).json({
      success: false,
      message: "Невалидный или истёкший refresh токен",
    });
  }
};

// Обновление профиля пользователя
export const updateUser = [
  ...updateValidation,
  async (req: Request, res: Response) => {
    const validationError = handleValidationErrors(req, res);
    if (validationError) return validationError;

    try {
      const userId = req.user?.id;

      if (!userId) {
        return res.status(401).json({
          success: false,
          message: "Не авторизован",
        });
      }

      const user = await User.findByPk(userId);
      if (!user) {
        return res.status(404).json({
          success: false,
          message: "Пользователь не найден",
        });
      }

      const { firstName, lastName, patronymic, email, phoneNumber } = req.body;
      
      // Проверка email на уникальность, если он изменяется
      if (email && email !== user.email) {
        const existingUser = await User.findOne({ where: { email } });
        if (existingUser) {
          return res.status(400).json({
            success: false,
            message: "Пользователь с этим email уже существует",
          });
        }
      }

      // Обновление полей
      if (firstName !== undefined) user.firstName = firstName;
      if (lastName !== undefined) user.lastName = lastName;
      if (patronymic !== undefined) user.patronymic = patronymic;
      if (email !== undefined) user.email = email;
      if (phoneNumber !== undefined) user.phoneNumber = phoneNumber;

      await user.save();

      res.json({
        success: true,
        message: "Профиль обновлен",
        user: getSafeUserData(user),
      });
    } catch (error: any) {
      console.error("Ошибка при обновлении профиля:", error);
      res.status(500).json({
        success: false,
        message: "Ошибка сервера",
        error: process.env.NODE_ENV === "development" ? error.message : undefined,
      });
    }
  },
];

// Получение пользователя по ID
export const getUserById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const user = await User.findByPk(id, {
      attributes: ["id", "firstName", "lastName", "patronymic", "email", "phoneNumber", "role", "status", "lastActivity", "createdAt", "updatedAt"],
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "Пользователь не найден",
      });
    }

    res.json({
      success: true,
      user: getSafeUserData(user),
    });
  } catch (error: any) {
    console.error("Ошибка при получении пользователя:", error);
    res.status(500).json({
      success: false,
      message: "Ошибка сервера",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

// Получение всех пользователей
export const getAllUsers = async (req: Request, res: Response) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const offset = (page - 1) * limit;

    const { count, rows: users } = await User.findAndCountAll({
      attributes: ["id", "firstName", "lastName", "patronymic", "email", "phoneNumber", "role", "status", "lastActivity", "createdAt", "updatedAt"],
      limit,
      offset,
      order: [["createdAt", "DESC"]],
    });

    res.json({
      success: true,
      users,
      pagination: {
        page,
        limit,
        total: count,
        pages: Math.ceil(count / limit),
      },
    });
  } catch (error: any) {
    console.error("Ошибка при получении пользователей:", error);
    res.status(500).json({
      success: false,
      message: "Ошибка сервера",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

// Удаление пользователя
export const deleteUser = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const currentUserId = req.user?.id;

    // Нельзя удалить самого себя
    if (parseInt(id) === currentUserId) {
      return res.status(400).json({
        success: false,
        message: "Нельзя удалить собственный аккаунт",
      });
    }

    const user = await User.findByPk(id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "Пользователь не найден",
      });
    }

    await user.destroy();

    res.json({
      success: true,
      message: "Пользователь успешно удален",
    });
  } catch (error: any) {
    console.error("Ошибка при удалении пользователя:", error);
    res.status(500).json({
      success: false,
      message: "Ошибка сервера",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

// Выход пользователя
export const logout = async (req: Request, res: Response) => {
  try {
    // Здесь можно добавить логику для инвалидации токена если нужно
    res.json({
      success: true,
      message: "Успешный выход из системы"
    });
  } catch (error: any) {
    console.error("Ошибка при выходе:", error);
    res.status(500).json({
        success: false,
        message: "Внутренняя ошибка сервера",
        error: process.env.NODE_ENV === "development" ? error.message : undefined,
      });
    }
}

// Создание пользователя (админом)
export const createUser = [
  ...registrationValidation,
  async (req: Request, res: Response) => {
    const validationError = handleValidationErrors(req, res);
    if (validationError) return validationError;

    const { firstName, lastName, patronymic, email, password, phoneNumber, role, status } = req.body;

    try {
      // Проверка существующего пользователя
      const existingUser = await User.findOne({ where: { email } });
      if (existingUser) {
        return res.status(400).json({
          success: false,
          message: "Пользователь с этим email уже существует",
        });
      }

      // Создание пользователя
      const user = await User.create({
        firstName,
        lastName,
        patronymic: patronymic || null,
        email,
        password,
        phoneNumber: phoneNumber || null,
        role: role || "user",
        status: status || "active",
        lastActivity: new Date(),
      });

      res.status(201).json({
        success: true,
        message: "Пользователь успешно создан",
        user: getSafeUserData(user),
      });
    } catch (error: any) {
      console.error("Ошибка при создании пользователя:", error);
      res.status(500).json({
        success: false,
        message: "Ошибка при создании пользователя",
        error: process.env.NODE_ENV === "development" ? error.message : undefined,
      });
    }
  },
];

// Получение информации об активности пользователя
export const getUserActivity = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    
    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Не авторизован",
      });
    }

    const user = await User.findByPk(userId, {
      attributes: ["id", "status", "lastActivity"]
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "Пользователь не найден",
      });
    }

    res.json({
      success: true,
      activity: {
        status: user.status,
        lastActivity: user.lastActivity,
        isOnline: user.status === "active"
      }
    });
  } catch (error: any) {
    console.error("Ошибка при получении активности:", error);
    res.status(500).json({
      success: false,
      message: "Ошибка сервера",
    });
  }
};