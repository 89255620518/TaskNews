import express from "express";
import cors from "cors";
import authRoutes from "./routes/authRoutes";
import { config } from "dotenv";
import { createRequire } from "module";
import { startStatusCronJob } from "./utils/cronJobs";
import { updateUserActivity } from "./middlewares/activityTracker";

config();

const requires = createRequire(import.meta.url);
const { sequelize } = requires("./config/config.cjs"); 

const app = express();
const PORT = Number( process.env.PORT ) || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Инициализация моделей
import { initializeModels } from "./models/iniatializeModels";
initializeModels();
startStatusCronJob();

app.use("/api", updateUserActivity);
app.use("/api", authRoutes);

const start = async () => {
    try {
        await sequelize.authenticate();
        await sequelize.sync();
        app.listen(PORT, "0.0.0.0", () => {
            console.log(`Server is running on http://0.0.0.0:${PORT}`);
        });
    } catch (error) {
        console.error("Database connection error:", error);
    }
};

start();
