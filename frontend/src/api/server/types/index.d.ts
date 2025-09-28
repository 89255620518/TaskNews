export interface JwtPayload {
  id: number;
  role: string;
  email: string;
  phoneNumber?: string;
  iat?: number;
  exp?: number;
}

declare global {
  interface Request {
    user?: JwtPayload;
  }
}