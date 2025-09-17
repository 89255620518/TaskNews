import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

const authMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  try {
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) {
      res.status(401).json({ message: "Не авторизован" });
      return; // Просто return без возврата значения
    }


    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as {
      id: number;
    };
    (req as any).user = { id: decoded.id }; 
    console.log('Authorization header:', req.headers.authorization);
    console.log('Token после split:', token);
    console.log('Decoded:', decoded);
    next();
  } catch (e) {
    res.status(401).json({ message: "Не авторизован" });
  }
};

export default authMiddleware;
