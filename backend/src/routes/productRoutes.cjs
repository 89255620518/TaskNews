const { authenticate } = require("../middlewares/authMiddleware.cjs");
const fs = require("fs");
const { productUpload } = require("../middlewares/uploadMiddleware.cjs");
const express = require('express');
const {
    createProduct,
    getProducts,
    getProductById,
    updateProduct,
    deleteProduct,
} = require("../controllers/productController.cjs");
const {
    addProductImage,
    uploadProductImage,
    deleteProductImage,
} = require("../controllers/productImageController.cjs");


const router = express.Router();

router.post(
    "/createProduct",
    productUpload.single("image"), // Middleware for file upload
    async (req, res) => {
        try {
            await createProduct(req, res);
        } catch (error) {
            if (req.file) {
                fs.unlinkSync(req.file.path);
            }

            // Assert the error type
            const errorMessage = (error).message || "An unknown error occurred";

            res.status(500).json({
                success: false,
                message: "Internal server error",
                error: errorMessage
            });
        }
    }
);

router.post("/:id/image", async (req, res) => {
    try {
        await uploadProductImage(req, res);
    } catch (error) {
        res.status(500).json({ success: false, message: "Internal server error" });
    }
});

router.delete("/:id/image", async (req, res) => {
    try {
        await deleteProductImage(req, res);
    } catch (error) {
        res.status(500).json({ success: false, message: "Internal server error" });
    }
});

router.get("/getProducts", async (req, res) => {
    try {
        await getProducts(req, res);
    } catch (error) {
        res.status(500).json({ message: "Internal server error" });
    }
});

router.get("/getProduct/:id", async (req, res) => {
    try {
        await getProductById(req, res);
    } catch (error) {
        res.status(500).json({ message: "Internal server error" });
    }
});

router.put("/updateProduct/:id", async (req, res) => {
    try {
        await updateProduct(req, res);
    } catch (error) {
        res.status(500).json({ message: "Internal server error" });
    }
});

router.delete("/deleteProduct/:id", async (req, res) => {
    try {
        await deleteProduct(req, res);
    } catch (error) {
        res.status(500).json({ message: "Internal server error" });
    }
});

module.exports = router;