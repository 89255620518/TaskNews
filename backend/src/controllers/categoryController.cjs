const { body, validationResult } = require("express-validator");
const { generateTokens } = require("../utils/token.cjs");
const { Category } = require("../models/Category.cjs");
const { refresh } = require("./authController.cjs");

const createCategory = async (req, res) => {
    await body("name").notEmpty().trim().run(req);
    await body("description").notEmpty().trim().run(req);

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
        const existingCategory = await Category.findOne({ where: { name } });
        if (existingCategory) {
            return res.status(400).json({
                success: false,
                message: "Категория с таким именем уже существует",
            });
        }

        const category = await Category.create({
            name,
            description,
        });

        return res.status(201).json({
            success: true,
            message: "Категория успешно создана",
            category: {
                id: category.id,
                name: category.name,
                description: category.description,
            },
        });
    } catch (error) {
        console.error("Ошибка при создании категории: ", error);
        return res.status(500).json({
            success: false,
            message: "Ошибка при создании категории"
        });
    }
};

const getCategories = async (req, res) => {
    try {
        const categories = await Category.findAll({
            attributes: ['id', 'name', 'description'],
            order: [['name', 'ASC']],
        });

        return res.json({
            success: true,
            categories,
        });
    } catch (error) {
        console.error("Ошибка при получении категорий: ", error);
        return res.status(500).json({
            success: false,
            message: "Ошибка при получении категории",
        });
    }
};

const getCategoryById = async (req, res) => {
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
    } catch (error) {
        console.error("Ошибка при получении категории: ", error);
        return res.status(500), json({
            success: false,
            message: "Ошибка при получении категории",
        });
    }
};

const updateCategory = async (req, res) => {
    const { id } = req.params;

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

        return res.json({
            success: true,
            message: "Категория успешно обновлена",
            category: {
                id: category.id,
                name: category.name,
                description: category.description,
            },
        });
    } catch (error) {
        console.error("Ошибка при обновлении категории: ", error);
        return res.status(500).json({
            success: false,
            message: "Ошибка при обновлении категории",
        });

    }
}

const deleteCategory = async (req, res) => {
    const { id } = req.params;

    try {
        const category = await Category.findByPk(id);
        if (!category) {
            return res.status(404).json({
                success: false,
                message: "Категория не найдена",
            })
        }

        await category.destroy();

        return res.json({
            success: true,
            message: "Категория успешно удалена",
            accessToken: req.headers.authorization?.split(' ')[1],
            refreshToken: req.cookies?.refreshToken
        });
    } catch (error) {
        console.error("Ошибка при удалении категории: ", error);
        return res.status(500).json({
            success: false,
            message: "Ошибка при удалении категории",
        })

    }
}

module.exports = {
    createCategory,
    getCategories,
    getCategoryById,
    updateCategory,
    deleteCategory
};