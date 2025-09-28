import { SignJWT, jwtVerify } from 'jose';

const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET!);
const JWT_REFRESH_SECRET = new TextEncoder().encode(process.env.JWT_REFRESH_SECRET || 'refresh_secret_key');

export const generateTokens = async (payload: any) => {
  const accessToken = await new SignJWT(payload)
    .setProtectedHeader({ alg: 'HS256' })
    .setExpirationTime('15m')
    .sign(JWT_SECRET);

  const refreshToken = await new SignJWT(payload)
    .setProtectedHeader({ alg: 'HS256' })
    .setExpirationTime('7d')
    .sign(JWT_REFRESH_SECRET);

  return { accessToken, refreshToken };
};

export const verifyToken = async (token: string) => {
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET);
    return { valid: true, payload };
  } catch {
    return { valid: false, payload: null };
  }
};

export const verifyRefreshToken = async (token: string) => {
  try {
    const { payload } = await jwtVerify(token, JWT_REFRESH_SECRET);
    return { valid: true, payload };
  } catch {
    return { valid: false, payload: null };
  }
};