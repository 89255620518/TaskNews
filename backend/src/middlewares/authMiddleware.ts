import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { User } from "../models/User";

declare module "express" {
  interface Request {
    user?: User;
  }
}
interface DecodedToken {
  id: number;
}

export const authenticate = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const token = req.header("Authorization")?.replace("Bearer ", "");
    console.log('Полученный токен:', token);
    
    if (!token) {
      res.status(401).json({ message: "Токен отсутствует" });
      return;
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET!, {
      algorithms: ["HS256"],
    }) as DecodedToken;

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
