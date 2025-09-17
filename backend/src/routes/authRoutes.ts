import express, { Request, Response, NextFunction } from "express";
import {
  register,
  login,
  refresh,
  updateUser,
} from "../controllers/authController";
import { authenticate } from "../middlewares/authMiddleware";

const router = express.Router();

router.post("/register", async (req: Request, res: Response) => {
  try {
    await register(req, res);
  } catch (error) {
    res.status(500).json({ message: "Internal server error" });
  }
});

router.post("/login", async (req: Request, res: Response) => {
  try {
    await login(req, res);
  } catch (error) {
    res.status(500).json({ message: "Internal server error" });
  }
});

router.post("/refresh", async (req: Request, res: Response) => {
  try {
    await refresh(req, res);
  } catch (error) {
    res.status(500).json({ message: "Internal server error" });
  }
});

router.put(
  "/update-profile",
  authenticate,
  async (req: Request, res: Response) => {
    try {
      await updateUser(req, res);
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  }
);

export default router;