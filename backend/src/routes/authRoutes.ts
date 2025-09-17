import express from "express";
import {
  register,
  login,
  refresh,
  updateUser,
  getUserById,
  getAllUsers,
  deleteUser,
  createUser,
  getUserActivity,
  logout
} from "../controllers/authController";
import { authenticate } from "../middlewares/authMiddleware";


const router = express.Router();

router.post("/register", register);
router.post("/login", login);
router.post("/refresh", refresh);
router.post("/logout", authenticate, logout);

router.get("/profile", authenticate, (req, res) => {
  const user = req.user;
  res.json({
    success: true,
    user: {
      id: user?.id,
      firstName: user?.firstName,
      lastName: user?.lastName,
      patronymic: user?.patronymic,
      email: user?.email,
      phoneNumber: user?.phoneNumber,
      role: user?.role,
      status: user?.status,
      lastActivity: user?.lastActivity,
      createdAt: user?.createdAt,
      updatedAt: user?.updatedAt
    }
  });
});

router.put("/profile", authenticate, updateUser);
router.get("/activity", authenticate, getUserActivity);

router.get("/users", authenticate, getAllUsers);
router.get("/users/:id", authenticate, getUserById);
router.post("/users", authenticate, createUser);
router.delete("/users/:id", authenticate, deleteUser);

export default router;