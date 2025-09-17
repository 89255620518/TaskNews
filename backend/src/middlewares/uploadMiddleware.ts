import multer from "multer";
import path from "path";
import { Request } from "express";
import fs from "fs";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const storage = multer.diskStorage({
  destination: (req: Request, file, cb) => {
    // Определяем тип загрузки (продукт или категория)
    const type = req.baseUrl.includes('products') ? 'products' : 'categories';
    const uploadDir = path.join(__dirname, '..', '..', 'uploads', type);
    
    // Создаем директорию, если не существует
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname);
    const type = req.baseUrl.includes('products') ? 'product' : 'category';
    cb(null, `${type}-${uniqueSuffix}${ext}`);
  }
});

// Фильтр файлов
const fileFilter = (req: Request, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  const allowedTypes = ["image/jpeg", "image/png", "image/jpg", "image/webp"];
  
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error("Invalid file type. Only JPEG, PNG, JPG and WebP are allowed"));
  }
};

// Создание middleware
export const productUpload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB
  }
});