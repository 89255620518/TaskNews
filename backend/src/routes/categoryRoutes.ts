import express, { Request, Response } from "express";
import {
  createCategory,
  getCategories,
  getCategoryById,
  updateCategory,
  deleteCategory,
} from "../controllers/categoryController";
import { authenticate } from "../middlewares/authMiddleware";

const router = express.Router();

router.post("/createCategory", authenticate, async (req: Request, res: Response) => {
  try {
    await createCategory(req, res);
  } catch (error) {
    res.status(500).json({ message: "Internal server error" });
  }
});

router.get("/getCategories", async (req: Request, res: Response) => {
  try {
    await getCategories(req, res);
  } catch (error) {
    res.status(500).json({ message: "Internal server error" });
  }
});

router.get("/getCategory/:id", async (req: Request, res: Response) => {
  try {
    await getCategoryById(req, res);
  } catch (error) {
    res.status(500).json({ message: "Internal server error" });
  }
});

router.put("/updateCategory/:id", authenticate, async (req: Request, res: Response) => {
  try {
    await updateCategory(req, res);
  } catch (error) {
    res.status(500).json({ message: "Internal server error" });
  }
});

router.delete("/deleteCategory/:id", authenticate, async (req: Request, res: Response) => {
  try {
    await deleteCategory(req, res);
  } catch (error) {
    res.status(500).json({ message: "Internal server error" });
  }
});

export default router;