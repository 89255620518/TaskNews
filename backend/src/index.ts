import express from "express";
import cors from "cors";
import path from "path";
import https from 'https';
import { fileURLToPath } from "url";
import authRoutes from "./routes/authRoutes";
import { config } from "dotenv";
import { createRequire } from "module";
import productRoutes from "./routes/productRoutes";
import categoryRoutes from "./routes/categoryRoutes";
import cartRoutes from "routes/cartRoutes";
import orderRoutes from './routes/orderRoutes'

config();

const requires = createRequire(import.meta.url);
const { sequelize } = requires("./config/config.cjs"); 

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3001;

// Создаем директории для загрузок, если они не существуют
const UPLOADS_DIR = path.join(__dirname, "..", "uploads"); // Теперь внутри backend/uploads
const uploadDirs = [
  path.join(UPLOADS_DIR, "products"),
  path.join(UPLOADS_DIR, "categories")
];

import fs from "fs";
uploadDirs.forEach(dir => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
});

// Middleware
app.use(cors());
app.use(express.json());
app.use("/uploads", express.static(UPLOADS_DIR));

// Инициализация моделей
import { initializeModels } from "./models/iniatializeModels";
initializeModels();

// Routes

app.use("/api", authRoutes);
app.use("/api/products", productRoutes);
app.use("/api/categories", categoryRoutes);
app.use("/api/cart", cartRoutes);
app.use("/api/orders", orderRoutes);

const start = async () => {
  try {
    await sequelize.authenticate();
    await sequelize.sync() ;
// Настройки SSL
  const options = {
    key: fs.readFileSync('/etc/letsencrypt/ljve/shashlandfa.ru/privkey.pem'),
    cert: fs.readFileSync('/etc/letsencrypt/Live/shashlandia.ru/fullchain.pem')
  };

    // Создаем HTTPS сервер
    https.createServer(options, app).listen(3001, "0.0.0.0", () => {
      console. log(`Server is running on https://0.0.0.0:$(PORT}`);
    }) ;
  } catch (error) {
    console.error ("Unable to connect to the database: ", error);
  }
};

start();
