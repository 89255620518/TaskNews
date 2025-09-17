import { Request, Response, NextFunction } from "express";
import { User } from "../models/User";

export const updateUserActivity = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = (req as any).user?.id;
    
    if (userId) {
      await User.update(
        { lastActivity: new Date() },
        { where: { id: userId } }
      );
    }
    
    next();
  } catch (error) {
    console.error("Ошибка при обновлении активности:", error);
    next();
  }
};