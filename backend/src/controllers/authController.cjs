const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { User } = require("../models/Users.cjs");
const { body, validationResult } = require("express-validator");
const { generateTokens } = require("../utils/token.cjs");

const register = async (req, res) => {
    // Базовая валидация (только те поля, что есть в модели)
    await body("email").isEmail().normalizeEmail().run(req);
    await body("password")
        .isLength({ min: 6 })
        .withMessage("Пароль должен содержать минимум 6 символов")
        .run(req);
    await body("phoneNumber")
        .isLength({ min: 10 })
        .withMessage("Пароль должен содержать минимум 10 символов")
        .run(req);
    await body("firstName").notEmpty().trim().run(req);
    await body("lastName").notEmpty().trim().run(req);

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({
            success: false,
            message: "Ошибка валидации",
            errors: errors.array(),
        });
    }

    const { firstName, lastName, email, password, phoneNumber } = req.body;

    try {
        // Проверка существующего пользователя
        const existingUser = await User.findOne({ where: { email } });
        if (existingUser) {
            return res.status(400).json({
                success: false,
                message: "Пользователь с этим email уже зарегистрирован",
            });
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Создание пользователя
        const user = await User.create({
            firstName,
            lastName,
            email,
            password,
            phoneNumber,
            role: "user", // По умолчанию
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
            user: {
                id: user.id,
                firstName: user.firstName,
                lastName: user.lastName,
                email: user.email,
                phoneNumber: user.phoneNumber,
                role: user.role,
            },
        });
    } catch (error) {
        console.error("Ошибка при регистрации:", error);
        return res.status(500).json({
            success: false,
            message: "Ошибка при регистрации",
        });
    }
};

const login = async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({
            success: false,
            message: "Email и пароль обязательны",
        });
    }

    try {
        const user = await User.findOne({
            where: { email },
            attributes: ["id", "email", "password", "firstName", "phoneNumber", "lastName", "role"],
        });

        if (!user) {
            return res.status(401).json({
                success: false,
                message: "Неверный email или пароль",
            });
        }

        const isMatch = await user.comparePassword(password);
        console.log(isMatch, 'iss')

        if (!isMatch) {
            return res.status(401).json({
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

        const { accessToken, refreshToken } = generateTokens(payload);

        res.json({
            success: true,
            accessToken,
            refreshToken,
            user: {
                id: user.id,
                firstName: user.firstName,
                lastName: user.lastName,
                email: user.email,
                phoneNumber: user.phoneNumber,
                role: user.role,
            },
        });
    } catch (error) {
        console.error("Ошибка при входе:", error);
        res.status(500).json({
            success: false,
            message: "Внутренняя ошибка сервера",
        });
    }
};

const refresh = async (req, res) => {
    const { refreshToken } = req.body;

    if (!refreshToken) {
        return res.status(401).json({ message: "Нет refresh токена" });
    }

    try {
        const decoded = jwt.verify(
            refreshToken,
            process.env.JWT_REFRESH_SECRET || "refresh_secret_key"
        );

        const payload = { id: decoded.id, role: decoded.role };
        const { accessToken, refreshToken: newRefreshToken } =
            generateTokens(payload);

        res.json({ accessToken, refreshToken: newRefreshToken });
    } catch (error) {
        res.status(403).json({ message: "Невалидный или истёкший refresh токен" });
    }
};

const updateUser = async (req, res) => {
    await body("firstName").optional().isString().run(req);
    await body("lastName").optional().isString().run(req);
    await body("email").optional().isString().run(req);
    await body("phoneNumber")
        .optional()
        .isLength({ min: 10 })
        .withMessage("Пароль должен содержать минимум 10 символов")
        .run(req);

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ success: false, errors: errors.array() });
    }

    try {
        const userId = req.user?.id;

        if (!userId) {
            return res
                .status(401)
                .json({ success: false, message: "Не авторизован" });
        }

        const user = await User.findByPk(userId);
        if (!user) {
            return res
                .status(404)
                .json({ success: false, message: "Пользователь не найден" });
        }

        const { firstName, lastName, email, phoneNumber } = req.body;
        if (firstName !== undefined) user.firstName = firstName;
        if (lastName !== undefined) user.lastName = lastName;
        if (email !== undefined) user.email = email;
        if (phoneNumber !== undefined) user.phoneNumber = phoneNumber;

        await user.save();

        const userData = user.get();
        const { password, ...safeUserData } = userData;

        res.json({
            success: true,
            message: "Профиль обновлен",
            user: safeUserData,
        });
    } catch (error) {
        console.error("Ошибка при обновлении профиля:", error);
        res.status(500).json({ success: false, message: "Ошибка сервера" });
    }
};

module.exports = {
    register,
    login,
    refresh,
    updateUser
};