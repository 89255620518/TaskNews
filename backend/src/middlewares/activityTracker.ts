import { Request, Response, NextFunction } from "express";
import { User } from "../models/User";
import jwt from "jsonwebtoken";

export const updateUserActivity = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.substring(7);
      
      try {
        // Проверяем токен
        const decoded = jwt.verify(token, process.env.JWT_SECRET!) as { id: number };
        const userId = decoded.id;
        
        // Обновляем активность пользователя
        await User.update(
          { 
            lastActivity: new Date(),
            status: "active"
          },
          { 
            where: { id: userId } 
          }
        );
        
      } catch (tokenError) {
        // Токен невалиден - пропускаем обновление активности
        console.log("Невалидный токен, активность не обновляется");
      }
    }
    
    next();
  } catch (error) {
    console.error("Ошибка при обновлении активности:", error);
    next();
  }
};