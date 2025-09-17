const fs = require("fs");
const path = require("path");
const multer = require("multer");
const { Product } = require("../models/Products.cjs");
const { productUpload } = require("../middlewares/uploadMiddleware.cjs");
// import { fileURLToPath } from "url";

// const __filename = fileURLToPath(import.meta.url);
// const __dirname = path.dirname(__filename);



const addProductImage = async (req, res) => {
    productUpload.single("image")(req, res, async (err) => {
        try {
            if (err) {
                return res.status(400).json({
                    success: false,
                    message: err instanceof multer.MulterError
                        ? err.message
                        : "File upload failed"
                });
            }

            if (!req.file) {
                return res.status(400).json({
                    success: false,
                    message: "No file uploaded"
                });
            }

            const { id } = req.params;
            const product = await Product.findByPk(id);

            if (!product) {
                // Удаляем загруженный файл, если продукт не найден
                fs.unlinkSync(req.file.path);
                return res.status(404).json({
                    success: false,
                    message: "Product not found"
                });
            }

            // Если у продукта уже есть изображение, возвращаем ошибку
            // (используйте uploadProductImage если нужно перезаписать)
            if (product.imageUrl) {
                fs.unlinkSync(req.file.path);
                return res.status(400).json({
                    success: false,
                    message: "Product already has an image. Use update instead."
                });
            }

            // Сохраняем ссылку на новое изображение
            // const imageUrl = `${req.protocol}://${req.get('host')}/uploads/products/${req.file.filename}`;
            const imageUrl = `https://dostavka-pominki.ru/uploads/products/${req.file.filename}`;
            await product.update({ imageUrl });

            return res.status(201).json({
                success: true,
                imageUrl: imageUrl
            });
        } catch (error) {
            console.error("Add image error:", error);
            if (req.file) {
                fs.unlinkSync(req.file.path);
            }
            return res.status(500).json({
                success: false,
                message: "Internal server error"
            });
        }
    });
};

const uploadProductImage = async (req, res) => {
    // Обрабатываем загрузку файла через middleware
    productUpload.single("image")(req, res, async (err) => {
        try {
            if (err) {
                return res.status(400).json({
                    success: false,
                    message: err instanceof multer.MulterError
                        ? err.message
                        : "File upload failed"
                });
            }

            if (!req.file) {
                return res.status(400).json({
                    success: false,
                    message: "No file uploaded"
                });
            }

            const { id } = req.params;
            const product = await Product.findByPk(id);

            if (!product) {
                // Удаляем загруженный файл, если продукт не найден
                fs.unlinkSync(req.file.path);
                return res.status(404).json({
                    success: false,
                    message: "Product not found"
                });
            }

            // Удаляем старое изображение если оно есть
            if (product.imageUrl) {
                const oldImagePath = path.join(
                    __dirname,
                    "..",
                    "uploads",
                    product.imageUrl.replace("/uploads/", "")
                );

                if (fs.existsSync(oldImagePath)) {
                    fs.unlinkSync(oldImagePath);
                }
            }

            // Обновляем ссылку на изображение
            // const newImageUrl = `${req.protocol}://${req.get('host')}/uploads/products/${req.file.filename}`;
            const newImageUrl = `https://dostavka-pominki.ru/uploads/products/${req.file.filename}`;
            await product.update({ imageUrl: newImageUrl });

            return res.json({
                success: true,
                imageUrl: newImageUrl
            });
        } catch (error) {
            console.error("Image upload error:", error);
            // Удаляем файл если произошла ошибка
            if (req.file) {
                fs.unlinkSync(req.file.path);
            }
            return res.status(500).json({
                success: false,
                message: "Internal server error"
            });
        }
    });
};

const deleteProductImage = async (req, res) => {
    const { id } = req.params;

    try {
        const product = await Product.findByPk(id);

        if (!product) {
            return res.status(404).json({
                success: false,
                message: "Product not found"
            });
        }

        if (!product.imageUrl) {
            return res.json({
                success: true,
                message: "No image to delete"
            });
        }

        // Удаляем файл изображения
        const imagePath = path.join(
            __dirname,
            "..",
            "uploads",
            product.imageUrl.replace("/uploads/", "")
        );

        if (fs.existsSync(imagePath)) {
            fs.unlinkSync(imagePath);
        }

        // Обнуляем ссылку в базе
        product.imageUrl = null;
        await product.save();

        return res.json({
            success: true,
            message: "Image deleted successfully"
        });
    } catch (error) {
        console.error("Delete image error:", error);
        return res.status(500).json({
            success: false,
            message: "Internal server error"
        });
    }
};

module.exports = {
    addProductImage,
    uploadProductImage,
    deleteProductImage
};