const jwt = require("jsonwebtoken");
const { User } = require("../models/Users.cjs");


const authenticate = async (req, res, next) => {
    try {
        const token = req.header("Authorization")?.replace("Bearer ", "");
        console.log('Полученный токен:', token);

        if (!token) {
            res.status(401).json({ message: "Токен отсутствует" });
            return;
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET, {
            algorithms: ['HS256'],
        });

        console.log('Декодированный токен:', decoded);

        const user = await User.findByPk(decoded.id);

        if (!user) {
            res.status(401).json({ message: "Пользователь не найден" });
            return;
        }

        req.user = user;
        next();
    } catch (error) {
        res.status(401).json({ message: "Неверный токен" });
    }
};

module.exports = { authenticate };