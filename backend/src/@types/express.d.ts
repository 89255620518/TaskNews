import * as express from "express";

declare global {
  namespace Express {
    interface Request {
      user?: any; // Замените 'any' на конкретный тип пользователя, если он известен
    }
  }
}
