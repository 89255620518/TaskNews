import { jwtVerify } from 'jose';
import { User } from "../models/User";
import { JwtPayload } from "../types/index";

const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET!);

export const authenticate = async (token: string): Promise<{ user: User | null; error: string | null }> => {
  try {
    console.log('Полученный токен:', token);
    
    if (!token) {
      return { user: null, error: "Токен отсутствует" };
    }

    const { payload } = await jwtVerify(token, JWT_SECRET);
    const decoded = payload as unknown as JwtPayload;

    const user = await User.findByPk(decoded.id);

    if (!user) {
      return { user: null, error: "Пользователь не найден" };
    }

    return { user, error: null };
  } catch (error) {
    return { user: null, error: "Неверный токен" };
  }
};