import { jwtVerify } from 'jose';

const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET!);

export const authMiddleware = async (token: string | null): Promise<{ userId: number | null; error: string | null }> => {
  try {
    if (!token) {
      return { userId: null, error: "Не авторизован" };
    }

    const { payload } = await jwtVerify(token, JWT_SECRET);
    const decoded = payload as { id: number };
    
    console.log('Token:', token);
    console.log('Decoded:', decoded);
    
    return { userId: decoded.id, error: null };
  } catch (e) {
    return { userId: null, error: "Не авторизован" };
  }
};