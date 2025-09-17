import express, { Request, Response } from "express";
import {
  createProduct,
  getProducts,
  getProductById,
  updateProduct,
  deleteProduct,
} from "../controllers/productController";
import {
  addProductImage,
  uploadProductImage,
  deleteProductImage,
} from "../controllers/productImageController";
import { authenticate } from "../middlewares/authMiddleware";
import fs from "fs";
import { productUpload } from "middlewares/uploadMiddleware";

const router = express.Router();

router.post(
  "/createProduct",
  authenticate,
  productUpload.single("image"), // Middleware for file upload
  async (req: Request, res: Response) => {
    try {
      await createProduct(req, res);
    } catch (error) {
      if (req.file) {
        fs.unlinkSync(req.file.path);
      }

      // Assert the error type
      const errorMessage = (error as Error).message || "An unknown error occurred";

      res.status(500).json({ 
        success: false,
        message: "Internal server error",
        error: errorMessage 
      });
    }
  }
);

router.post("/:id/image", authenticate, async (req: Request, res: Response) => {
  try {
    await uploadProductImage(req, res);
  } catch (error) {
    res.status(500).json({ success: false, message: "Internal server error" });
  }
});

router.delete("/:id/image", authenticate, async (req: Request, res: Response) => {
  try {
    await deleteProductImage(req, res);
  } catch (error) {
    res.status(500).json({ success: false, message: "Internal server error" });
  }
});

router.get("/getProducts", async (req: Request, res: Response) => {
  try {
    await getProducts(req, res);
  } catch (error) {
    res.status(500).json({ message: "Internal server error" });
  }
});

router.get("/getProduct/:id", async (req: Request, res: Response) => {
  try {
    await getProductById(req, res);
  } catch (error) {
    res.status(500).json({ message: "Internal server error" });
  }
});

router.put("/updateProduct/:id", authenticate, async (req: Request, res: Response) => {
  try {
    await updateProduct(req, res);
  } catch (error) {
    res.status(500).json({ message: "Internal server error" });
  }
});

router.delete("/deleteProduct/:id", authenticate, async (req: Request, res: Response) => {
  try {
    await deleteProduct(req, res);
  } catch (error) {
    res.status(500).json({ message: "Internal server error" });
  }
});

export default router;