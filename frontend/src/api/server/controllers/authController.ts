import { body, validationResult } from "express-validator";
import { User } from "../models/User";
import { generateTokens, verifyRefreshToken } from "../utils/token";
import { JwtPayload } from "../types/index";

interface ClientRequest {
  body: any;
  params?: any;
  query?: any;
  user?: JwtPayload;
}

interface ClientResponse {
  status(code: number): ClientResponse;
  json(data: any): void;
}

const JWT_REFRESH_SECRET = new TextEncoder().encode(process.env.JWT_REFRESH_SECRET || 'refresh_secret_key');

const createValidationError = (errors: any[]) => {
  return {
    status: (code: number) => ({
      json: (data: any) => ({ validationError: true, status: code, data })
    })
  };
};

const handleValidationErrors = (req: ClientRequest) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return createValidationError(errors.array());
  }
  return null;
};

const getSafeUserData = (user: User) => {
  const userData = user.toJSON();
  const { password, ...safeUserData } = userData;
  return safeUserData;
};

const createResponse = () => {
  let statusCode = 200;
  let responseData: any = null;

  const response: ClientResponse = {
    status(code: number) {
      statusCode = code;
      return response;
    },
    json(data: any) {
      responseData = { status: statusCode, data };
    }
  };

  return { response, getResult: () => responseData };
};

export const createAdminFromConsole = async (email: string, password: string, firstName: string, lastName: string) => {
  try {
    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      console.log("Пользователь с этим email уже существует");
      return null;
    }

    const user = await User.create({
      firstName,
      lastName,
      email,
      password,
      role: "admin",
    });
    
    return user;
  } catch (error: any) {
    console.error("Ошибка при создании администратора:", error);
    return null;
  }
};

export const register = async (reqData: { 
  firstName: string; 
  lastName: string; 
  patronymic?: string; 
  email: string; 
  password: string; 
  phoneNumber?: string;
}) => {
  const req: ClientRequest = { body: reqData };
  const { response, getResult } = createResponse();

  const validationError = handleValidationErrors(req);
  if (validationError) {
    return validationError.status(400).json({
      success: false,
      message: "Ошибка валидации",
      errors: validationResult(req).array(),
    });
  }

  const { firstName, lastName, patronymic, email, password, phoneNumber } = req.body;

  try {
    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      return response.status(400).json({
        success: false,
        message: "Пользователь с этим email уже зарегистрирован",
      });
    }

    const user = await User.create({
      firstName,
      lastName,
      patronymic: patronymic || '',
      email,
      password,
      phoneNumber: phoneNumber || '',
      role: "user",
    });

    const payload = {
      id: user.id,
      role: user.role,
      email: user.email,
      phoneNumber: user.phoneNumber,
    };

    const { accessToken, refreshToken } = await generateTokens(payload);

    return response.status(201).json({
      success: true,
      message: "Пользователь успешно зарегистрирован",
      accessToken,
      refreshToken,
      user: getSafeUserData(user),
    });
  } catch (error: any) {
    console.error("Ошибка при регистрации:", error);
    return response.status(500).json({
      success: false,
      message: "Ошибка при регистрации",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

export const login = async (reqData: { email: string; password: string }) => {
  const req: ClientRequest = { body: reqData };
  const { response, getResult } = createResponse();

  const validationError = handleValidationErrors(req);
  if (validationError) {
    return validationError.status(400).json({
      success: false,
      message: "Ошибка валидации",
      errors: validationResult(req).array(),
    });
  }

  const { email, password } = req.body;

  try {
    const user = await User.findOne({ where: { email } });

    if (!user) {
      return response.status(401).json({
        success: false,
        message: "Неверный email или пароль",
      });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return response.status(401).json({
        success: false,
        message: "Неверный email или пароль",
      });
    }

    const payload = {
      id: user.id,
      role: user.role,
      email: user.email,
      phoneNumber: user.phoneNumber,
    };

    const { accessToken, refreshToken } = await generateTokens(payload);

    response.json({
      success: true,
      accessToken,
      refreshToken,
      user: getSafeUserData(user),
    });
  } catch (error: any) {
    console.error("Ошибка при входе:", error);
    response.status(500).json({
      success: false,
      message: "Внутренняя ошибка сервера",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }

  return getResult();
};

export const refresh = async (reqData: { refreshToken: string }) => {
  const { response, getResult } = createResponse();
  const { refreshToken } = reqData;

  if (!refreshToken) {
    return response.status(401).json({ 
      success: false,
      message: "Нет refresh токена" 
    });
  }

  try {
    const result = await verifyRefreshToken(refreshToken);
    
    if (!result.valid || !result.payload) {
      return response.status(403).json({
        success: false,
        message: "Невалидный или истёкший refresh токен",
      });
    }

    const decoded = result.payload as unknown as JwtPayload;
    const user = await User.findByPk(decoded.id);
    
    if (!user) {
      return response.status(404).json({
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
    
    const { accessToken, refreshToken: newRefreshToken } = await generateTokens(payload);

    response.json({
      success: true,
      accessToken,
      refreshToken: newRefreshToken,
    });
  } catch (error) {
    response.status(403).json({
      success: false,
      message: "Невалидный или истёкший refresh токен",
    });
  }

  return getResult();
};

export const updateUser = async (reqData: { 
  user: JwtPayload; 
  firstName?: string; 
  lastName?: string; 
  patronymic?: string; 
  email?: string; 
  phoneNumber?: string;
}) => {
  const req: ClientRequest = { body: reqData, user: reqData.user };
  const { response, getResult } = createResponse();

  const validationError = handleValidationErrors(req);
  if (validationError) {
    return validationError.status(400).json({
      success: false,
      message: "Ошибка валидации",
      errors: validationResult(req).array(),
    });
  }

  try {
    const userId = req.user?.id;

    if (!userId) {
      return response.status(401).json({
        success: false,
        message: "Не авторизован",
      });
    }

    const user = await User.findByPk(userId);
    if (!user) {
      return response.status(404).json({
        success: false,
        message: "Пользователь не найден",
      });
    }

    const { firstName, lastName, patronymic, email, phoneNumber } = req.body;
    
    if (email && email !== user.email) {
      const existingUser = await User.findOne({ where: { email } });
      if (existingUser) {
        return response.status(400).json({
          success: false,
          message: "Пользователь с этим email уже существует",
        });
      }
    }

    const updateData: any = {};
    if (firstName !== undefined) updateData.firstName = firstName;
    if (lastName !== undefined) updateData.lastName = lastName;
    if (patronymic !== undefined) updateData.patronymic = patronymic;
    if (email !== undefined) updateData.email = email;
    if (phoneNumber !== undefined) updateData.phoneNumber = phoneNumber;

    await user.update(updateData);

    response.json({
      success: true,
      message: "Профиль обновлен",
      user: getSafeUserData(user),
    });
  } catch (error: any) {
    console.error("Ошибка при обновлении профиля:", error);
    response.status(500).json({
      success: false,
      message: "Ошибка сервера",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }

  return getResult();
};

export const getUserById = async (reqData: { id: string }) => {
  const { response, getResult } = createResponse();

  try {
    const { id } = reqData;

    const user = await User.findByPk(parseInt(id));

    if (!user) {
      return response.status(404).json({
        success: false,
        message: "Пользователь не найден",
      });
    }

    response.json({
      success: true,
      user: getSafeUserData(user),
    });
  } catch (error: any) {
    console.error("Ошибка при получении пользователя:", error);
    response.status(500).json({
      success: false,
      message: "Ошибка сервера",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }

  return getResult();
};

export const getAllUsers = async (reqData: { page?: string; limit?: string } = {}) => {
  const { response, getResult } = createResponse();

  try {
    const page = parseInt(reqData.page as string) || 1;
    const limit = parseInt(reqData.limit as string) || 10;
    const offset = (page - 1) * limit;

    const { count, rows: users } = await User.findAndCountAll({
      limit,
      offset,
      order: [["createdAt", "DESC"]],
    });

    const safeUsers = users.map(user => getSafeUserData(user));

    response.json({
      success: true,
      users: safeUsers,
      pagination: {
        page,
        limit,
        total: count,
        pages: Math.ceil(count / limit),
      },
    });
  } catch (error: any) {
    console.error("Ошибка при получении пользователей:", error);
    response.status(500).json({
      success: false,
      message: "Ошибка сервера",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }

  return getResult();
};

export const deleteUser = async (reqData: { id: string; user: JwtPayload }) => {
  const { response, getResult } = createResponse();

  try {
    const { id } = reqData;
    const currentUserId = reqData.user?.id;

    if (parseInt(id) === currentUserId) {
      return response.status(400).json({
        success: false,
        message: "Нельзя удалить собственный аккаунт",
      });
    }

    const user = await User.findByPk(parseInt(id));
    if (!user) {
      return response.status(404).json({
        success: false,
        message: "Пользователь не найден",
      });
    }

    await user.destroy();

    response.json({
      success: true,
      message: "Пользователь успешно удален",
    });
  } catch (error: any) {
    console.error("Ошибка при удалении пользователя:", error);
    response.status(500).json({
      success: false,
      message: "Ошибка сервера",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }

  return getResult();
};

export const logout = async () => {
  const { response, getResult } = createResponse();

  try {
    response.json({
      success: true,
      message: "Успешный выход из системы"
    });
  } catch (error: any) {
    console.error("Ошибка при выходе:", error);
    response.status(500).json({
      success: false,
      message: "Внутренняя ошибка сервера",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }

  return getResult();
};

export const createUser = async (reqData: {
  firstName: string;
  lastName: string;
  patronymic?: string;
  email: string;
  password: string;
  phoneNumber?: string;
  role?: string;
}) => {
  const req: ClientRequest = { body: reqData };
  const { response, getResult } = createResponse();

  const validationError = handleValidationErrors(req);
  if (validationError) {
    return validationError.status(400).json({
      success: false,
      message: "Ошибка валидации",
      errors: validationResult(req).array(),
    });
  }

  const { firstName, lastName, patronymic, email, password, phoneNumber, role } = req.body;

  try {
    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      return response.status(400).json({
        success: false,
        message: "Пользователь с этим email уже существует",
      });
    }

    const user = await User.create({
      firstName,
      lastName,
      patronymic: patronymic || '',
      email,
      password,
      phoneNumber: phoneNumber || '',
      role: role || "user",
    });

    response.status(201).json({
      success: true,
      message: "Пользователь успешно создан",
      user: getSafeUserData(user),
    });
  } catch (error: any) {
    console.error("Ошибка при создании пользователя:", error);
    response.status(500).json({
      success: false,
      message: "Ошибка при создании пользователя",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }

  return getResult();
};

export const updateUserRole = async (reqData: { id: string; role: string; user: JwtPayload }) => {
  const req: ClientRequest = { body: reqData, params: reqData, user: reqData.user };
  const { response, getResult } = createResponse();

  const validationError = handleValidationErrors(req);
  if (validationError) {
    return validationError.status(400).json({
      success: false,
      message: "Ошибка валидации",
      errors: validationResult(req).array(),
    });
  }

  try {
    const currentUserRole = req.user?.role;
    
    if (currentUserRole !== 'admin') {
      return response.status(403).json({
        success: false,
        message: "Недостаточно прав для изменения ролей",
      });
    }

    const { id } = req.params;
    const { role } = req.body;

    const user = await User.findByPk(parseInt(id));
    if (!user) {
      return response.status(404).json({
        success: false,
        message: "Пользователь не найден",
      });
    }

    if (parseInt(id) === req.user?.id) {
      return response.status(400).json({
        success: false,
        message: "Нельзя изменить свою собственную роль",
      });
    }

    await user.update({ role });

    response.json({
      success: true,
      message: "Роль пользователя успешно обновлена",
      user: getSafeUserData(user),
    });
  } catch (error: any) {
    console.error("Ошибка при обновлении роли пользователя:", error);
    response.status(500).json({
      success: false,
      message: "Ошибка сервера",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }

  return getResult();
};

export const getCurrentUser = async (reqData: { user: JwtPayload }) => {
  const { response, getResult } = createResponse();

  try {
    const userId = reqData.user?.id;

    if (!userId) {
      return response.status(401).json({
        success: false,
        message: "Не авторизован",
      });
    }

    const user = await User.findByPk(userId);
    if (!user) {
      return response.status(404).json({
        success: false,
        message: "Пользователь не найден",
      });
    }

    response.json({
      success: true,
      user: getSafeUserData(user),
    });
  } catch (error: any) {
    console.error("Ошибка при получении текущего пользователя:", error);
    response.status(500).json({
      success: false,
      message: "Ошибка сервера",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }

  return getResult();
};

export const registrationValidation = [
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

export const loginValidation = [
  body("email").isEmail().normalizeEmail().withMessage("Некорректный email"),
  body("password").notEmpty().withMessage("Пароль обязателен"),
];

export const updateValidation = [
  body("firstName").optional().isString().trim().withMessage("Имя должно быть строкой"),
  body("lastName").optional().isString().trim().withMessage("Фамилия должна быть строкой"),
  body("email").optional().isEmail().withMessage("Некорректный email"),
  body("phoneNumber")
    .optional()
    .isLength({ min: 10 })
    .withMessage("Номер телефона должен содержать минимум 10 символов"),
];

export const roleValidation = [
  body("role").isIn(["user", "admin", "manager", "support"]).withMessage("Некорректная роль"),
];