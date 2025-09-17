const {
    createCategory,
    getCategories,
    getCategoryById,
    updateCategory,
    deleteCategory,
} = require("../controllers/categoryController.cjs");
const express = require('express');

const router = express.Router();

router.post("/createCategory", async (req, res) => {
    try {
        await createCategory(req, res);
    } catch (error) {
        res.status(500).json({ message: "Internal server error" });
    }
});

router.get("/getCategories", async (req, res) => {
    try {
        await getCategories(req, res);
    } catch (error) {
        res.status(500).json({ message: "Internal server error" });
    }
});

router.get("/getCategory/:id", async (req, res) => {
    try {
        await getCategoryById(req, res);
    } catch (error) {
        res.status(500).json({ message: "Internal server error" });
    }
});

router.put("/updateCategory/:id", async (req, res) => {
    try {
        await updateCategory(req, res);
    } catch (error) {
        res.status(500).json({ message: "Internal server error" });
    }
});

router.delete("/deleteCategory/:id", async (req, res) => {
    try {
        await deleteCategory(req, res);
    } catch (error) {
        res.status(500).json({ message: "Internal server error" });
    }
});

module.exports = router;