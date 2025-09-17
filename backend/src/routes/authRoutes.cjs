const {
    register,
    login,
    refresh,
    updateUser,
} = require("../controllers/authController.cjs");
const { authenticate } = require("../middlewares/authMiddleware.cjs");
const express = require('express');


const router = express.Router();

router.post("/register", async (req, res) => {
    try {
        await register(req, res);
    } catch (error) {
        res.status(500).json({ message: "Internal server error" });
    }
});

router.post("/login", async (req, res) => {
    try {
        await login(req, res);
    } catch (error) {
        res.status(500).json({ message: "Internal server error" });
    }
})

router.post("/refresh", async (req, res) => {
    try {
        await refresh(req, res);
    } catch (error) {
        res.status(500).json({ message: "Internal server error" });
    }
})

router.put("/update-profile", authenticate, async (req, res) => {
    try {
        await updateUser(req, res);
    } catch (error) {
        res.status(500).json({ message: "Internal server error" });
    }
})


module.exports = router;